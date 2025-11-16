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
        `SELECT a.*, CONCAT(e.firstName, ' ', e.lastName) AS doctorName
       FROM appointment a
       LEFT JOIN employee e ON a.employeeID = e.employeeID
       JOIN patient p ON a.patientID = p.patientID
       WHERE p.userID = ?
       ORDER BY a.appointmentDate DESC`,
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
      const { employeeID, appointmentDate, appointmentTime, reason } = req.body;

      // Get patient ID from userID
      const [[patient]] = await db.query(
        `SELECT patientID FROM patient WHERE userID = ?`,
        [req.user.userID]
      );

      if (!patient) {
        return res.status(404).json({ message: "Patient profile missing" });
      }

      const [result] = await db.query(
        `INSERT INTO appointment 
       (patientID, employeeID, appointmentDate, appointmentTime, appointmentStatus, reason)
       VALUES (?, ?, ?, ?, 'Scheduled', ?)`,
        [
          patient.patientID,
          employeeID,
          appointmentDate,
          appointmentTime,
          reason,
        ]
      );

      res.json({ message: "Appointment booked!", apptID: result.insertId });
    } catch (err) {
      console.error("Booking error:", err);
      res
        .status(500)
        .json({ message: "Server error while booking appointment" });
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
      const [result] = await db.query(
        `UPDATE appointment 
       SET appointmentStatus='Cancelled'
       WHERE apptID = ?`,
        [req.params.id]
      );
      res.json({ message: "Appointment cancelled" });
    } catch (err) {
      console.error("Cancel error:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
