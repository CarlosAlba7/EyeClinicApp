const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all invoices with related details
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, patientID } = req.query;
    
    let query = `
      SELECT 
        i.*,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.email as patientEmail,
        CONCAT(e.firstName, ' ', e.lastName) as createdByName,
        a.appointmentDate,
        a.appointmentTime
      FROM invoice i
      LEFT JOIN patient p ON i.patientID = p.patientID
      LEFT JOIN employee e ON i.createdBy = e.employeeID
      LEFT JOIN appointment a ON i.apptID = a.apptID
    `;
    
    let params = [];
    const conditions = [];

    if (status) {
      conditions.push('i.invoiceStatus = ?');
      params.push(status);
    }

    if (patientID) {
      conditions.push('i.patientID = ?');
      params.push(patientID);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY i.dateIssued DESC';

    const [invoices] = await db.query(query, params);
    res.json(invoices);
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error fetching invoices' });
  }
});

// Get single invoice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [invoices] = await db.query(
      `SELECT 
        i.*,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.email as patientEmail,
        p.phone as patientPhone,
        CONCAT(e.firstName, ' ', e.lastName) as createdByName,
        a.appointmentDate,
        a.appointmentTime,
        a.reason as appointmentReason
      FROM invoice i
      LEFT JOIN patient p ON i.patientID = p.patientID
      LEFT JOIN employee e ON i.createdBy = e.employeeID
      LEFT JOIN appointment a ON i.apptID = a.apptID
      WHERE i.invoiceID = ?`,
      [req.params.id]
    );

    if (invoices.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoices[0]);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error fetching invoice' });
  }
});

// Create new invoice
router.post('/', authenticateToken, authorizeRoles('Admin', 'Receptionist'), async (req, res) => {
  try {
    const {
      apptID, patientID, dateIssued, invoiceStatus,
      methodOfPay, invoiceTotal, specialistRefer, summary
    } = req.body;

    const createdBy = req.user.employeeID;

    const [result] = await db.query(
      `INSERT INTO invoice (
        apptID, patientID, createdBy, dateIssued, invoiceStatus,
        methodOfPay, invoiceTotal, specialistRefer, summary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [apptID, patientID, createdBy, dateIssued, invoiceStatus,
       methodOfPay, invoiceTotal, specialistRefer, summary]
    );

    res.status(201).json({
      message: 'Invoice created successfully',
      invoiceID: result.insertId
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Invoice already exists for this appointment' });
    }
    res.status(500).json({ message: 'Server error creating invoice' });
  }
});

// Update invoice
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Receptionist'), async (req, res) => {
  try {
    const {
      invoiceStatus, methodOfPay, invoiceTotal, specialistRefer, summary
    } = req.body;

    const [result] = await db.query(
      `UPDATE invoice SET
        invoiceStatus = ?, methodOfPay = ?, invoiceTotal = ?,
        specialistRefer = ?, summary = ?
      WHERE invoiceID = ?`,
      [invoiceStatus, methodOfPay, invoiceTotal, specialistRefer, summary, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ message: 'Server error updating invoice' });
  }
});

// Delete invoice
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM invoice WHERE invoiceID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ message: 'Server error deleting invoice' });
  }
});

module.exports = router;
