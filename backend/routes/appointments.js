const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { isInPastCST } = require('../utils/timezone');

// Get all appointments with patient and employee details
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, date, patientID, employeeID } = req.query;

    let query = `
      SELECT
        a.*,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.email as patientEmail,
        p.phone as patientPhone,
        CONCAT(e.firstName, ' ', e.lastName) as employeeName,
        e.employeeType,
        af.doctorNotes,
        af.requiresSpecialist,
        af.specialistType
      FROM appointment a
      LEFT JOIN patient p ON a.patientID = p.patientID
      LEFT JOIN employee e ON a.employeeID = e.employeeID
      LEFT JOIN appointment_feedback af ON a.apptID = af.apptID
    `;

    let params = [];
    const conditions = [];

    if (status) {
      conditions.push('a.appointmentStatus = ?');
      params.push(status);
    }

    if (date) {
      conditions.push('DATE(a.appointmentDate) = ?');
      params.push(date);
    }

    if (patientID) {
      conditions.push('a.patientID = ?');
      params.push(parseInt(patientID));
    }

    if (employeeID) {
      conditions.push('a.employeeID = ?');
      params.push(parseInt(employeeID));
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
        af.doctorNotes,
        af.requiresSpecialist,
        af.specialistType
      FROM appointment a
      LEFT JOIN patient p ON a.patientID = p.patientID
      LEFT JOIN employee e ON a.employeeID = e.employeeID
      LEFT JOIN appointment_feedback af ON a.apptID = af.apptID
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
      appointmentStatus, reason, appointmentType
    } = req.body;

    // Check if the appointment time is in the future (CST)
    if (isInPastCST(appointmentDate, appointmentTime)) {
      return res.status(400).json({ message: 'Cannot schedule appointments in the past (CST)' });
    }

    const [result] = await db.query(
      `INSERT INTO appointment (
        patientID, employeeID, appointmentDate, appointmentTime,
        appointmentStatus, reason, appointmentType
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [patientID, employeeID, appointmentDate, appointmentTime, appointmentStatus, reason, appointmentType || 'Normal']
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
      appointmentStatus, reason, appointmentType
    } = req.body;

    const [result] = await db.query(
      `UPDATE appointment SET
        patientID = ?, employeeID = ?, appointmentDate = ?,
        appointmentTime = ?, appointmentStatus = ?, reason = ?, appointmentType = ?
      WHERE apptID = ?`,
      [patientID, employeeID, appointmentDate, appointmentTime,
       appointmentStatus, reason, appointmentType || 'Normal', req.params.id]
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
router.post('/:id/complete', authenticateToken, authorizeRoles('Doctor', 'Admin'), async (req, res) => {
  try {
    const { doctorNotes, requiresSpecialist, specialistType } = req.body;
    const apptID = req.params.id;

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update appointment status
      const [updateResult] = await connection.query(
        `UPDATE appointment SET appointmentStatus = 'Completed' WHERE apptID = ?`,
        [apptID]
      );

      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Insert or update feedback
      await connection.query(
        `INSERT INTO appointment_feedback (apptID, doctorNotes, requiresSpecialist, specialistType)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         doctorNotes = VALUES(doctorNotes),
         requiresSpecialist = VALUES(requiresSpecialist),
         specialistType = VALUES(specialistType)`,
        [apptID, doctorNotes, requiresSpecialist ? 1 : 0, specialistType || null]
      );

      await connection.commit();
      connection.release();

      res.json({ message: 'Appointment completed successfully' });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ message: 'Server error completing appointment' });
  }
});

// Cancel appointment
router.post('/:id/cancel', authenticateToken, authorizeRoles('Doctor', 'Admin', 'Receptionist'), async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE appointment SET appointmentStatus = 'Cancelled' WHERE apptID = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
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
