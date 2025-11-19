const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all appointments with patient and employee details
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, date, patientID } = req.query;
    
    let query = `
      SELECT
        a.*,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.email as patientEmail,
        p.phone as patientPhone,
        CONCAT(e.firstName, ' ', e.lastName) as employeeName,
        e.employeeType,
        CONCAT(completedByEmp.firstName, ' ', completedByEmp.lastName) as completedByName
      FROM appointment a
      LEFT JOIN patient p ON a.patientID = p.patientID
      LEFT JOIN employee e ON a.employeeID = e.employeeID
      LEFT JOIN employee completedByEmp ON a.completedBy = completedByEmp.employeeID
    `;
    
    let params = [];
    const conditions = [];

    if (status) {
      conditions.push('a.appointmentStatus = ?');
      params.push(status);
    }

    if (date) {
      conditions.push('a.appointmentDate = ?');
      params.push(date);
    }

    if (patientID) {
      conditions.push('a.patientID = ?');
      params.push(patientID);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.appointmentDate DESC, a.appointmentTime DESC';

    const [appointments] = await db.query(query, params);
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
});

// Get single appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [appointments] = await db.query(
      `SELECT
        a.*,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.email as patientEmail,
        CONCAT(e.firstName, ' ', e.lastName) as employeeName,
        e.employeeType,
        CONCAT(completedByEmp.firstName, ' ', completedByEmp.lastName) as completedByName
      FROM appointment a
      LEFT JOIN patient p ON a.patientID = p.patientID
      LEFT JOIN employee e ON a.employeeID = e.employeeID
      LEFT JOIN employee completedByEmp ON a.completedBy = completedByEmp.employeeID
      WHERE a.apptID = ?`,
      [req.params.id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointments[0]);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error fetching appointment' });
  }
});

// Create new appointment
router.post('/', authenticateToken, authorizeRoles('Admin', 'Receptionist'), async (req, res) => {
  try {
    const {
      patientID, employeeID, appointmentDate, appointmentTime,
      appointmentStatus, reason
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO appointment (
        patientID, employeeID, appointmentDate, appointmentTime,
        appointmentStatus, reason
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [patientID, employeeID, appointmentDate, appointmentTime, appointmentStatus, reason]
    );

    res.status(201).json({
      message: 'Appointment created successfully',
      apptID: result.insertId
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error creating appointment' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Receptionist', 'Doctor'), async (req, res) => {
  try {
    const {
      patientID, employeeID, appointmentDate, appointmentTime,
      appointmentStatus, reason
    } = req.body;

    const [result] = await db.query(
      `UPDATE appointment SET
        patientID = ?, employeeID = ?, appointmentDate = ?,
        appointmentTime = ?, appointmentStatus = ?, reason = ?
      WHERE apptID = ?`,
      [patientID, employeeID, appointmentDate, appointmentTime, 
       appointmentStatus, reason, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: 'Server error updating appointment' });
  }
});

// Complete appointment (doctors only)
router.put('/:id/complete', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const { appointmentSummary, needsSpecialist, specialistType } = req.body;

    const [result] = await db.query(
      `UPDATE appointment SET
        appointmentStatus = 'Completed',
        appointmentSummary = ?,
        needsSpecialist = ?,
        specialistType = ?,
        completedAt = NOW(),
        completedBy = ?
      WHERE apptID = ?`,
      [appointmentSummary, needsSpecialist ? 1 : 0, specialistType || null, req.user.userID, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment completed successfully' });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ message: 'Server error completing appointment' });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM appointment WHERE apptID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: 'Server error deleting appointment' });
  }
});

module.exports = router;
