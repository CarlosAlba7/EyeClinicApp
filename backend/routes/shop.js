const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all shop items (only active items for shop view, all items for management)
router.get('/items', authenticateToken, async (req, res) => {
  try {
    // Check if this is a management request (will include showAll query param)
    const showAll = req.query.showAll === 'true';
    const userRole = req.user.role || req.user.employeeType;
    const isStaff = userRole === 'Receptionist' || userRole === 'Admin';

    // Check if isActive column exists
    const [columns] = await db.query(
      "SHOW COLUMNS FROM shop_items LIKE 'isActive'"
    );

    const hasIsActiveColumn = columns.length > 0;

    let query = 'SELECT * FROM shop_items';

    // Only show ALL items (including inactive) if:
    // 1. User is staff (Receptionist or Admin)
    // 2. showAll parameter is explicitly true (from management interface)
    // 3. isActive column exists
    // Otherwise ALWAYS filter to show only active items
    if (hasIsActiveColumn) {
      if (showAll && isStaff) {
        // Management view - show all items including inactive
      } else {
        // Shop view - always show only active items for everyone
        query += ' WHERE isActive = 1';
      }
    }

    query += ' ORDER BY category, itemName';

    const [items] = await db.query(query);
    res.json(items);
  } catch (error) {
    console.error('Error fetching shop items:', error);
    res.status(500).json({ message: 'Error fetching shop items' });
  }
});

// Get a single shop item by ID
router.get('/items/:id', authenticateToken, async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT * FROM shop_items WHERE itemID = ?',
      [req.params.id]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(items[0]);
  } catch (error) {
    console.error('Error fetching shop item:', error);
    res.status(500).json({ message: 'Error fetching shop item' });
  }
});

// Create a new shop item (Receptionist/Admin only)
router.post('/items', authenticateToken, async (req, res) => {
  try {
    // Check if user is receptionist or admin (check both role and employeeType)
    const userRole = req.user.role || req.user.employeeType;
    if (userRole !== 'Receptionist' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Receptionist or Admin role required.' });
    }

    const { itemName, description, price, stockQuantity, category, imageURL } = req.body;

    if (!itemName || !price || stockQuantity === undefined) {
      return res.status(400).json({ message: 'Item name, price, and stock quantity are required' });
    }

    const [result] = await db.query(
      'INSERT INTO shop_items (itemName, description, price, stockQuantity, category, imageURL) VALUES (?, ?, ?, ?, ?, ?)',
      [itemName, description, price, stockQuantity, category, imageURL]
    );

    res.status(201).json({
      message: 'Item created successfully',
      itemID: result.insertId
    });
  } catch (error) {
    console.error('Error creating shop item:', error);
    res.status(500).json({ message: 'Error creating shop item' });
  }
});

// Update a shop item (Receptionist/Admin only)
router.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is receptionist or admin (check both role and employeeType)
    const userRole = req.user.role || req.user.employeeType;
    if (userRole !== 'Receptionist' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Receptionist or Admin role required.' });
    }

    const { itemName, description, price, stockQuantity, category, imageURL } = req.body;

    const [result] = await db.query(
      'UPDATE shop_items SET itemName = ?, description = ?, price = ?, stockQuantity = ?, category = ?, imageURL = ? WHERE itemID = ?',
      [itemName, description, price, stockQuantity, category, imageURL, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating shop item:', error);
    res.status(500).json({ message: 'Error updating shop item' });
  }
});

// Delete a shop item (Receptionist/Admin only) - Uses soft delete
router.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is receptionist or admin (check both role and employeeType)
    const userRole = req.user.role || req.user.employeeType;
    if (userRole !== 'Receptionist' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Receptionist or Admin role required.' });
    }

    // Check if isActive column exists
    const [columns] = await db.query(
      "SHOW COLUMNS FROM shop_items LIKE 'isActive'"
    );
    const hasIsActiveColumn = columns.length > 0;

    // Check if item has been ordered
    const [orderItems] = await db.query(
      'SELECT COUNT(*) as count FROM order_items WHERE itemID = ?',
      [req.params.id]
    );

    if (orderItems[0].count > 0 && hasIsActiveColumn) {
      // Soft delete - mark as inactive instead of physically deleting
      const [result] = await db.query(
        'UPDATE shop_items SET isActive = 0 WHERE itemID = ?',
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Item not found' });
      }

      return res.json({
        message: 'Item marked as inactive (soft deleted) because it has order history',
        softDeleted: true
      });
    } else if (orderItems[0].count > 0 && !hasIsActiveColumn) {
      // If no isActive column, can't soft delete items with order history
      return res.status(400).json({
        message: 'Cannot delete item because it has order history. Please run the database migration to add soft delete support.'
      });
    }

    // Hard delete if never ordered
    const [result] = await db.query(
      'DELETE FROM shop_items WHERE itemID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      message: 'Item permanently deleted',
      softDeleted: false
    });
  } catch (error) {
    console.error('Error deleting shop item:', error);
    res.status(500).json({ message: 'Error deleting shop item' });
  }
});

// Restore a soft-deleted item (Receptionist/Admin only)
router.put('/items/:id/restore', authenticateToken, async (req, res) => {
  try {
    // Check if user is receptionist or admin (check both role and employeeType)
    const userRole = req.user.role || req.user.employeeType;
    if (userRole !== 'Receptionist' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Receptionist or Admin role required.' });
    }

    const [result] = await db.query(
      'UPDATE shop_items SET isActive = 1 WHERE itemID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item restored successfully' });
  } catch (error) {
    console.error('Error restoring shop item:', error);
    res.status(500).json({ message: 'Error restoring shop item' });
  }
});

// Get cart for current user
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await db.query(
      `SELECT c.cartID, c.quantity, c.addedAt,
              s.itemID, s.itemName, s.description, s.price, s.stockQuantity, s.category, s.imageURL
       FROM cart c
       JOIN shop_items s ON c.itemID = s.itemID
       WHERE c.userID = ?
       ORDER BY c.addedAt DESC`,
      [req.user.userID]
    );
    res.json(cartItems);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Add item to cart
router.post('/cart', authenticateToken, async (req, res) => {
  try {
    const { itemID, quantity } = req.body;

    if (!itemID || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid item ID and quantity are required' });
    }

    // Check if item exists and has sufficient stock
    const [items] = await db.query(
      'SELECT stockQuantity FROM shop_items WHERE itemID = ?',
      [itemID]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (items[0].stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    // Check if item already in cart
    const [existingCart] = await db.query(
      'SELECT cartID, quantity FROM cart WHERE userID = ? AND itemID = ?',
      [req.user.userID, itemID]
    );

    if (existingCart.length > 0) {
      // Update existing cart item
      const newQuantity = existingCart[0].quantity + quantity;

      if (items[0].stockQuantity < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock available for requested quantity' });
      }

      await db.query(
        'UPDATE cart SET quantity = ? WHERE cartID = ?',
        [newQuantity, existingCart[0].cartID]
      );

      res.json({ message: 'Cart updated successfully' });
    } else {
      // Add new cart item
      const [result] = await db.query(
        'INSERT INTO cart (userID, itemID, quantity) VALUES (?, ?, ?)',
        [req.user.userID, itemID, quantity]
      );

      res.status(201).json({
        message: 'Item added to cart successfully',
        cartID: result.insertId
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Update cart item quantity
router.put('/cart/:cartID', authenticateToken, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Get cart item and check ownership
    const [cartItems] = await db.query(
      'SELECT c.*, s.stockQuantity FROM cart c JOIN shop_items s ON c.itemID = s.itemID WHERE c.cartID = ? AND c.userID = ?',
      [req.params.cartID, req.user.userID]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (cartItems[0].stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock available' });
    }

    await db.query(
      'UPDATE cart SET quantity = ? WHERE cartID = ?',
      [quantity, req.params.cartID]
    );

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// Remove item from cart
router.delete('/cart/:cartID', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM cart WHERE cartID = ? AND userID = ?',
      [req.params.cartID, req.user.userID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Error removing from cart' });
  }
});

// Checkout
router.post('/checkout', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { customerName, cardNumber } = req.body;

    if (!customerName || !cardNumber) {
      return res.status(400).json({ message: 'Customer name and card number are required' });
    }

    await connection.beginTransaction();

    // Get cart items
    const [cartItems] = await connection.query(
      `SELECT c.cartID, c.itemID, c.quantity, s.price, s.stockQuantity, s.itemName
       FROM cart c
       JOIN shop_items s ON c.itemID = s.itemID
       WHERE c.userID = ?`,
      [req.user.userID]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Verify stock availability
    for (const item of cartItems) {
      if (item.stockQuantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Insufficient stock for ${item.itemName}. Only ${item.stockQuantity} available.`
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create order
    const [orderResult] = await connection.query(
      'INSERT INTO shop_orders (userID, totalAmount, customerName, cardNumber, orderStatus) VALUES (?, ?, ?, ?, ?)',
      [req.user.userID, totalAmount, customerName, cardNumber, 'Completed']
    );

    const orderID = orderResult.insertId;

    // Create order items and update stock
    for (const item of cartItems) {
      // Insert order item
      await connection.query(
        'INSERT INTO order_items (orderID, itemID, quantity, priceAtPurchase) VALUES (?, ?, ?, ?)',
        [orderID, item.itemID, item.quantity, item.price]
      );

      // Update stock quantity
      await connection.query(
        'UPDATE shop_items SET stockQuantity = stockQuantity - ? WHERE itemID = ?',
        [item.quantity, item.itemID]
      );
    }

    // Clear cart
    await connection.query(
      'DELETE FROM cart WHERE userID = ?',
      [req.user.userID]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Order completed successfully',
      orderID: orderID,
      totalAmount: totalAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error processing checkout:', error);
    res.status(500).json({ message: 'Error processing checkout' });
  } finally {
    connection.release();
  }
});

// Get low stock notifications (Receptionist/Admin only)
router.get('/notifications/low-stock', authenticateToken, async (req, res) => {
  try {
    // Check if user is receptionist or admin (check both role and employeeType)
    const userRole = req.user.role || req.user.employeeType;
    if (userRole !== 'Receptionist' && userRole !== 'Admin' && userRole !== 'Doctor') {
      return res.status(403).json({ message: 'Access denied. Receptionist or Admin role required.' });
    }

    const [notifications] = await db.query(
      'SELECT * FROM low_stock_notifications WHERE isRead = 0 ORDER BY notifiedAt DESC'
    );

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching low stock notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read (Receptionist/Admin only)
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    // Check if user is receptionist or admin (check both role and employeeType)
    const userRole = req.user.role || req.user.employeeType;
    if (userRole !== 'Receptionist' && userRole !== 'Admin') {
      return res.status(403).json({ message: 'Access denied. Receptionist or Admin role required.' });
    }

    const [result] = await db.query(
      'UPDATE low_stock_notifications SET isRead = 1 WHERE notificationID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Get order history for current user
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*,
              GROUP_CONCAT(CONCAT(oi.quantity, 'x ', s.itemName) SEPARATOR ', ') as items
       FROM shop_orders o
       LEFT JOIN order_items oi ON o.orderID = oi.orderID
       LEFT JOIN shop_items s ON oi.itemID = s.itemID
       WHERE o.userID = ?
       GROUP BY o.orderID
       ORDER BY o.orderDate DESC`,
      [req.user.userID]
    );

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Get order details
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT * FROM shop_orders WHERE orderID = ? AND userID = ?',
      [req.params.id, req.user.userID]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const [orderItems] = await db.query(
      `SELECT oi.*, s.itemName, s.description
       FROM order_items oi
       JOIN shop_items s ON oi.itemID = s.itemID
       WHERE oi.orderID = ?`,
      [req.params.id]
    );

    res.json({
      order: orders[0],
      items: orderItems
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});

module.exports = router;
