import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shopAPI } from "../services/api";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemMessage, setSystemMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customerName: "",
    cardNumber: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await shopAPI.getCart();
      if (response.data.length === 0) {
        navigate("/cart");
        return;
      }
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError("");

    try {
      if (!formData.customerName.trim()) {
        setError("Please enter your name");
        setProcessing(false);
        return;
      }

      if (!formData.cardNumber.trim()) {
        setError("Please enter a card number");
        setProcessing(false);
        return;
      }

      const response = await shopAPI.checkout(formData);

      // Show success message and redirect
      setSystemMessage(
        `Order completed successfully!
      Order ID: ${response.data.orderID}
      Total: $${response.data.totalAmount.toFixed(2)}`
      );
    
      setProcessing(false); 
      setTimeout(() => navigate("/shop"), 2000); 

    } catch (error) {
      console.error("Error processing checkout:", error);
      setError(error.response?.data?.message || "Failed to process checkout");
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading checkout...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Checkout</h1>
        <button
          onClick={() => navigate("/cart")}
          className="btn btn-secondary"
          disabled={processing}
        >
          Back to Cart
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError("")} className="alert-close">
            ×
          </button>
        </div>
      )}
      {systemMessage && (
        <div className="system-message">
          <pre>{systemMessage}</pre>
          <button onClick={() => setSystemMessage("")} className="alert-close">×</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Order Summary */}
        <div className="card">
          <div className="card-header">Order Summary</div>
          <div style={{ padding: "1rem" }}>
            {cartItems.map((item) => (
              <div
                key={item.cartID}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <div>
                  <h4 style={{ marginBottom: "0.25rem" }}>{item.itemName}</h4>
                  <p style={{ color: "#666", fontSize: "0.875rem" }}>
                    Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}
                  </p>
                </div>
                <div style={{ fontWeight: "bold" }}>
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 0",
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              <span>Total:</span>
              <span style={{ color: "#667eea" }}>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="card">
          <div className="card-header">Payment Information</div>
          <form onSubmit={handleCheckout} style={{ padding: "1rem" }}>
            

            <div className="form-group">
              <label htmlFor="customerName">Full Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your full name"
                required
                disabled={processing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cardNumber">Card Number *</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter card number"
                required
                disabled={processing}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", fontSize: "1.125rem", padding: "0.75rem" }}
              disabled={processing}
            >
              {processing ? "Processing..." : `Complete Purchase - $${calculateTotal().toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
