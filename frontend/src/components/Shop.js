import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shopAPI } from "../services/api";

const Shop = ({ user }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await shopAPI.getAllItems();
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load shop items");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (itemID, stockQuantity) => {
    try {
      setError("");
      setSuccess("");

      if (stockQuantity === 0) {
        setError("This item is out of stock");
        return;
      }

      await shopAPI.addToCart({ itemID, quantity: 1 });
      setSuccess("Item added to cart!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setError(error.response?.data?.message || "Failed to add item to cart");
    }
  };

  const categories = ["All", ...new Set(items.map((item) => item.category).filter(Boolean))];
  const filteredItems = selectedCategory === "All"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  if (loading) {
    return <div className="loading">Loading shop...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Shop</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate("/cart")}
            className="btn btn-primary"
          >
            View Cart
          </button>
          {(user.employeeType === "Receptionist" || user.employeeType === "Admin") && (
            <button
              onClick={() => navigate("/shop-management")}
              className="btn btn-secondary"
            >
              Manage Shop
            </button>
          )}
        </div>
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

      <div className="card">
        <div className="card-header">Categories</div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", padding: "1rem" }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`btn ${selectedCategory === category ? "btn-primary" : "btn-secondary"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "1.5rem",
        marginTop: "1.5rem"
      }}>
        {filteredItems.map((item) => (
          <div key={item.itemID} className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>{item.itemName}</h3>
            {item.category && (
              <span
                style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  backgroundColor: "#667eea",
                  color: "white",
                  borderRadius: "1rem",
                  fontSize: "0.875rem",
                  marginBottom: "0.75rem"
                }}
              >
                {item.category}
              </span>
            )}
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              {item.description}
            </p>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem"
            }}>
              <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#667eea" }}>
                ${Number(item.price).toFixed(2)}
              </span>
              <span style={{
                color: item.stockQuantity <= 3 ? "#f5576c" : "#43e97b",
                fontWeight: "500"
              }}>
                {item.stockQuantity === 0
                  ? "Out of Stock"
                  : item.stockQuantity <= 3
                  ? `Only ${item.stockQuantity} left!`
                  : `${item.stockQuantity} in stock`}
              </span>
            </div>
            <button
              onClick={() => handleAddToCart(item.itemID, item.stockQuantity)}
              className="btn btn-primary"
              disabled={item.stockQuantity === 0}
              style={{ width: "100%" }}
            >
              {item.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
          <p>No items found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
