const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all alerts for a specific doctor
router.get('/my', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const doctorID = req.user.userID;

    const [alerts] = await db.query(
      `SELECT
        da.alertID,
        da.alertType,
        da.alertMessage,
        da.isRead,
        da.createdAt,
        da.apptID,
        a.appointmentDate,
        a.appointmentTime,
        a.appointmentStatus,
        a.appointmentType,
        a.reason,
        CONCAT(p.firstName, ' ', p.lastName) AS patientName,
        p.phone AS patientPhone,
        p.email AS patientEmail
      FROM doctor_alerts da
      JOIN appointment a ON da.apptID = a.apptID
      JOIN patient p ON da.patientID = p.patientID
      WHERE da.doctorID = ?
      ORDER BY
        CASE da.alertType
          WHEN 'EMERGENCY' THEN 1
          WHEN 'URGENT' THEN 2
          ELSE 3
        END,
        da.isRead ASC,
        da.createdAt DESC`,
      [doctorID]
    );

    res.json(alerts);
  } catch (error) {
    console.error('Get doctor alerts error:', error);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
});

// Get unread alert count
router.get('/unread-count', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const doctorID = req.user.userID;

    const [[result]] = await db.query(
      `SELECT COUNT(*) AS unreadCount
       FROM doctor_alerts
       WHERE doctorID = ? AND isRead = FALSE`,
      [doctorID]
    );

    res.json({ unreadCount: result.unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error fetching unread count' });
  }
});

// Mark a specific alert as read
router.put('/:id/mark-read', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const alertID = req.params.id;
    const doctorID = req.user.userID;

    // Verify the alert belongs to this doctor
    const [[alert]] = await db.query(
      'SELECT alertID FROM doctor_alerts WHERE alertID = ? AND doctorID = ?',
      [alertID, doctorID]
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or access denied' });
    }

    const [result] = await db.query(
      'UPDATE doctor_alerts SET isRead = TRUE WHERE alertID = ?',
      [alertID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    res.json({ message: 'Alert marked as read' });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({ message: 'Server error marking alert as read' });
  }
});

// Mark all alerts as read for a doctor
router.put('/mark-all-read', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const doctorID = req.user.userID;

    await db.query(
      'UPDATE doctor_alerts SET isRead = TRUE WHERE doctorID = ? AND isRead = FALSE',
      [doctorID]
    );

    res.json({ message: 'All alerts marked as read' });
  } catch (error) {
    console.error('Mark all alerts as read error:', error);
    res.status(500).json({ message: 'Server error marking alerts as read' });
  }
});

// Delete a specific alert
router.delete('/:id', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const alertID = req.params.id;
    const doctorID = req.user.userID;

    // Verify the alert belongs to this doctor
    const [result] = await db.query(
      'DELETE FROM doctor_alerts WHERE alertID = ? AND doctorID = ?',
      [alertID, doctorID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alert not found or access denied' });
    }

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ message: 'Server error deleting alert' });
  }
});

// Get emergency alerts specifically (for priority display)
router.get('/emergency', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const doctorID = req.user.userID;

    const [alerts] = await db.query(
      `SELECT
        da.alertID,
        da.alertMessage,
        da.isRead,
        da.createdAt,
        da.apptID,
        a.appointmentDate,
        a.appointmentTime,
        a.reason,
        CONCAT(p.firstName, ' ', p.lastName) AS patientName,
        p.phone AS patientPhone
      FROM doctor_alerts da
      JOIN appointment a ON da.apptID = a.apptID
      JOIN patient p ON da.patientID = p.patientID
      WHERE da.doctorID = ? AND da.alertType = 'EMERGENCY'
      ORDER BY da.isRead ASC, da.createdAt DESC`,
      [doctorID]
    );

    res.json(alerts);
  } catch (error) {
    console.error('Get emergency alerts error:', error);
    res.status(500).json({ message: 'Server error fetching emergency alerts' });
  }
});

module.exports = router;
