import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shopAPI } from "../services/api";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await shopAPI.getCart();
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (cartID, newQuantity, stockQuantity) => {
    try {
      setError("");

      if (newQuantity <= 0) {
        setError("Quantity must be at least 1");
        return;
      }

      if (newQuantity > stockQuantity) {
        setError(`Only ${stockQuantity} items available in stock`);
        return;
      }

      await shopAPI.updateCartItem(cartID, { quantity: newQuantity });
      setSuccess("Cart updated!");
      setTimeout(() => setSuccess(""), 2000);
      fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
      setError(error.response?.data?.message || "Failed to update cart");
    }
  };

  const handleRemoveItem = async (cartID) => {
    try {
      setError("");
      await shopAPI.removeFromCart(cartID);
      setSuccess("Item removed from cart");
      setTimeout(() => setSuccess(""), 2000);
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item from cart");
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <button onClick={() => navigate("/shop")} className="btn btn-secondary">
          Continue Shopping
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

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess("")} className="alert-close">
            ×
          </button>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <h3>Your cart is empty</h3>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Add some items from the shop to get started!
          </p>
          <button onClick={() => navigate("/shop")} className="btn btn-primary">
            Go to Shop
          </button>
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-header">Cart Items</div>
            <div style={{ padding: "1rem" }}>
              {cartItems.map((item) => (
                <div
                  key={item.cartID}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ marginBottom: "0.25rem" }}>{item.itemName}</h4>
                    <p style={{ color: "#666", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                      {item.description}
                    </p>
                    {item.category && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          backgroundColor: "#667eea",
                          color: "white",
                          borderRadius: "1rem",
                          fontSize: "0.75rem",
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#667eea" }}>
                      ${Number(item.price).toFixed(2)}
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.cartID, item.quantity - 1, item.stockQuantity)
                        }
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.75rem" }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: "2rem", textAlign: "center", fontWeight: "bold" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(item.cartID, item.quantity + 1, item.stockQuantity)
                        }
                        className="btn btn-secondary"
                        style={{ padding: "0.25rem 0.75rem" }}
                        disabled={item.quantity >= item.stockQuantity}
                      >
                        +
                      </button>
                    </div>

                    <span style={{ minWidth: "5rem", textAlign: "right", fontWeight: "bold" }}>
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item.cartID)}
                      className="btn btn-danger"
                      style={{ padding: "0.5rem 1rem" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: "1.5rem" }}>
            <div style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3>Total:</h3>
                <h2 style={{ color: "#667eea" }}>${calculateTotal().toFixed(2)}</h2>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="btn btn-primary"
                style={{ width: "100%", fontSize: "1.125rem", padding: "0.75rem" }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
