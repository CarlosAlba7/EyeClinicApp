const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// GET patient appointments
router.get(
  "/my",
  authenticateToken,
  authorizeRoles("Patient"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT
          a.apptID,
          a.appointmentDate,
          a.appointmentTime,
          a.appointmentStatus,
          a.reason,
          a.appointmentType,
          CONCAT(e.firstName, ' ', e.lastName) AS doctorName,
          e.specialization,
          af.doctorNotes,
          af.requiresSpecialist,
          af.specialistType
        FROM appointment a
        LEFT JOIN employee e ON a.employeeID = e.employeeID
        LEFT JOIN appointment_feedback af ON a.apptID = af.apptID
        JOIN patient p ON a.patientID = p.patientID
        WHERE p.userID = ?
        ORDER BY a.appointmentDate DESC, a.appointmentTime DESC`,
        [req.user.userID]
      );
      res.json(rows);
    } catch (err) {
      console.error("Error fetching patient appointments:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// BOOK new appointment
router.post(
  "/book",
  authenticateToken,
  authorizeRoles("Patient"),
  async (req, res) => {
    try {
      const { employeeID, appointmentDate, appointmentTime, reason, appointmentType } = req.body;

      // Validate required fields
      if (!employeeID || !appointmentDate || !appointmentTime || !reason) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Get patient ID from userID
      const [[patient]] = await db.query(
        `SELECT patientID FROM patient WHERE userID = ?`,
        [req.user.userID]
      );

      if (!patient) {
        return res.status(404).json({ message: "Patient profile missing" });
      }

      // Check if the appointment time is in the future
      const appointmentDateTime = new Date(`${appointmentDate} ${appointmentTime}`);
      if (appointmentDateTime < new Date()) {
        return res.status(400).json({ message: "Cannot book appointments in the past" });
      }

      // Insert appointment
      const [result] = await db.query(
        `INSERT INTO appointment
        (patientID, employeeID, appointmentDate, appointmentTime, appointmentStatus, reason, appointmentType)
        VALUES (?, ?, ?, ?, 'Scheduled', ?, ?)`,
        [
          patient.patientID,
          employeeID,
          appointmentDate,
          appointmentTime,
          reason,
          appointmentType || 'Normal',
        ]
      );

      res.status(201).json({
        message: "Appointment booked successfully!",
        apptID: result.insertId
      });
    } catch (err) {
      console.error("Booking error:", err);
      res.status(500).json({
        message: "Server error while booking appointment"
      });
    }
  }
);

// CANCEL appointment
router.put(
  "/cancel/:id",
  authenticateToken,
  authorizeRoles("Patient"),
  async (req, res) => {
    try {
      // First verify that this appointment belongs to the logged-in patient
      const [[appointment]] = await db.query(
        `SELECT a.apptID 
         FROM appointment a
         JOIN patient p ON a.patientID = p.patientID
         WHERE a.apptID = ? AND p.userID = ?`,
        [req.params.id, req.user.userID]
      );

      if (!appointment) {
        return res.status(404).json({ 
          message: "Appointment not found or you don't have permission to cancel it" 
        });
      }

      // Update the appointment status
      const [result] = await db.query(
        `UPDATE appointment 
         SET appointmentStatus='Cancelled'
         WHERE apptID = ?`,
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      res.json({ message: "Appointment cancelled successfully" });
    } catch (err) {
      console.error("Cancel error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;