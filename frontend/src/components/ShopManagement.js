import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shopAPI } from "../services/api";

const ShopManagement = ({ user }) => {
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "",
    imageURL: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== "Receptionist" && user.role !== "Admin") {
      navigate("/shop");
      return;
    }
    fetchItems();
    fetchNotifications();
  }, [user, navigate]);

  const fetchItems = async () => {
    try {
      const response = await shopAPI.getAllItems(true); // Pass true to show all items including inactive
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await shopAPI.getLowStockNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "",
      imageURL: "",
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
      };

      if (editingItem) {
        await shopAPI.updateItem(editingItem.itemID, data);
        setSuccess("Item updated successfully!");
      } else {
        await shopAPI.createItem(data);
        setSuccess("Item created successfully!");
      }

      resetForm();
      fetchItems();
      fetchNotifications();
    } catch (error) {
      console.error("Error saving item:", error);
      setError(error.response?.data?.message || "Failed to save item");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      description: item.description || "",
      price: item.price.toString(),
      stockQuantity: item.stockQuantity.toString(),
      category: item.category || "",
      imageURL: item.imageURL || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (itemID, itemName) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      setError("");
      const response = await shopAPI.deleteItem(itemID);
      setSuccess(response.data.message || "Item deleted successfully!");
      fetchItems();
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(error.response?.data?.message || "Failed to delete item");
    }
  };

  const handleRestore = async (itemID, itemName) => {
    if (!window.confirm(`Are you sure you want to restore "${itemName}"?`)) {
      return;
    }

    try {
      setError("");
      await shopAPI.restoreItem(itemID);
      setSuccess("Item restored successfully!");
      fetchItems();
    } catch (error) {
      console.error("Error restoring item:", error);
      setError(error.response?.data?.message || "Failed to restore item");
    }
  };

  const markNotificationRead = async (notificationID) => {
    try {
      await shopAPI.markNotificationRead(notificationID);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading shop management...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Shop Management</h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => navigate("/shop")} className="btn btn-secondary">
            Back to Shop
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? "Cancel" : "Add New Item"}
          </button>
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

      {/* Low Stock Notifications */}
      {notifications.length > 0 && (
        <div className="card" style={{ backgroundColor: "#fff3cd", borderLeft: "4px solid #f5576c" }}>
          <div className="card-header" style={{ backgroundColor: "#f5576c", color: "white" }}>
            Low Stock Alerts ({notifications.length})
          </div>
          <div style={{ padding: "1rem" }}>
            {notifications.map((notification) => (
              <div
                key={notification.notificationID}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <div>
                  <strong>{notification.itemName}</strong> - Only{" "}
                  <span style={{ color: "#f5576c", fontWeight: "bold" }}>
                    {notification.currentStock}
                  </span>{" "}
                  left in stock!
                  <br />
                  <small style={{ color: "#666" }}>
                    {new Date(notification.notifiedAt).toLocaleString()}
                  </small>
                </div>
                <button
                  onClick={() => markNotificationRead(notification.notificationID)}
                  className="btn btn-secondary"
                  style={{ padding: "0.5rem 1rem" }}
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Item Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            {editingItem ? "Edit Item" : "Add New Item"}
          </div>
          <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label htmlFor="itemName">Item Name *</label>
                <input
                  type="text"
                  id="itemName"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., Contact Care, Cleaning"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stockQuantity">Stock Quantity *</label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageURL">Image URL</label>
              <input
                type="text"
                id="imageURL"
                name="imageURL"
                value={formData.imageURL}
                onChange={handleChange}
                className="form-control"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingItem ? "Update Item" : "Create Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="card">
        <div className="card-header">All Shop Items ({items.length})</div>
        <div style={{ padding: "1rem" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isInactive = item.isActive === 0 || item.isActive === false;
                return (
                  <tr
                    key={item.itemID}
                    style={{
                      opacity: isInactive ? 0.6 : 1,
                      backgroundColor: isInactive ? "#f5f5f5" : "transparent"
                    }}
                  >
                    <td>
                      <strong>{item.itemName}</strong>
                      {isInactive && (
                        <span style={{
                          marginLeft: "0.5rem",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#dc3545",
                          color: "white",
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          fontWeight: "bold"
                        }}>
                          INACTIVE
                        </span>
                      )}
                      {item.description && (
                        <div style={{ fontSize: "0.875rem", color: "#666" }}>
                          {item.description.substring(0, 50)}
                          {item.description.length > 50 ? "..." : ""}
                        </div>
                      )}
                    </td>
                    <td>{item.category || "-"}</td>
                    <td>${Number(item.price).toFixed(2)}</td>
                    <td>
                      <span
                        style={{
                          fontWeight: "bold",
                          color:
                            item.stockQuantity === 0
                              ? "#f5576c"
                              : item.stockQuantity <= 3
                              ? "#ffa500"
                              : "#43e97b",
                        }}
                      >
                        {item.stockQuantity}
                      </span>
                    </td>
                    <td>
                      {isInactive ? (
                        <span style={{ color: "#dc3545", fontWeight: "bold" }}>
                          Deleted
                        </span>
                      ) : item.stockQuantity === 0 ? (
                        <span style={{ color: "#f5576c", fontWeight: "bold" }}>
                          Out of Stock
                        </span>
                      ) : item.stockQuantity <= 3 ? (
                        <span style={{ color: "#ffa500", fontWeight: "bold" }}>
                          Low Stock
                        </span>
                      ) : (
                        <span style={{ color: "#43e97b", fontWeight: "bold" }}>
                          In Stock
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {isInactive ? (
                          <button
                            onClick={() => handleRestore(item.itemID, item.itemName)}
                            className="btn btn-success"
                            style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              className="btn btn-primary"
                              style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.itemID, item.itemName)}
                              className="btn btn-danger"
                              style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShopManagement;
