const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// ---------------------------------------------------------
// GET ALL PATIENTS (Admin / Staff only)
// ---------------------------------------------------------
router.get(
  "/",
  authenticateToken,
  authorizeRoles("Admin", "Receptionist", "Doctor"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT 
           p.patientID,
           p.userID,
           p.firstName,
           p.lastName,
           p.gender,
           p.email,
           p.phone,
           p.patientBirthdate
         FROM patient p
         ORDER BY p.patientID DESC`
      );

      res.json(rows);
    } catch (err) {
      console.error("Error fetching patients:", err);
      res.status(500).json({ message: "Server error loading patients" });
    }
  }
);

// ---------------------------------------------------------
// GET SINGLE PATIENT BY ID
// ---------------------------------------------------------
router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin", "Receptionist", "Doctor"),
  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT 
            p.*, 
            u.email, 
            u.role
         FROM patient p
         JOIN users u ON p.userID = u.userID
         WHERE p.patientID = ?`,
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error("Error fetching patient:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------------------------------------------------------
// UPDATE PATIENT (Admin / Staff)
// ---------------------------------------------------------
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin", "Receptionist"),
  async (req, res) => {
    try {
      const patientID = req.params.id;
      const { firstName, lastName, gender, email, phone, patientBirthdate } =
        req.body;

      // Ensure patient exists
      const [existing] = await db.query(
        "SELECT userID FROM patient WHERE patientID = ?",
        [patientID]
      );

      if (existing.length === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const userID = existing[0].userID;

      // Update patient table
      await db.query(
        `UPDATE patient SET 
           firstName=?, 
           lastName=?, 
           gender=?,
           email=?, 
           phone=?, 
           patientBirthdate=?
         WHERE patientID=?`,
        [firstName, lastName, gender, email, phone, patientBirthdate, patientID]
      );

      // Update users table email
      await db.query(`UPDATE users SET email=? WHERE userID=?`, [
        email,
        userID,
      ]);

      res.json({ message: "Patient updated successfully" });
    } catch (err) {
      console.error("Error updating patient:", err);
      res.status(500).json({ message: "Server error updating patient" });
    }
  }
);

// ---------------------------------------------------------
// DELETE PATIENT (Admin only) — removes both user + patient
// ---------------------------------------------------------
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const patientID = req.params.id;

      // Get userID for deletion
      const [rows] = await db.query(
        "SELECT userID FROM patient WHERE patientID = ?",
        [patientID]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      const userID = rows[0].userID;

      // Delete patient profile
      await db.query("DELETE FROM patient WHERE patientID = ?", [patientID]);

      // Delete login account
      await db.query("DELETE FROM users WHERE userID = ?", [userID]);

      res.json({ message: "Patient deleted successfully" });
    } catch (err) {
      console.error("Error deleting patient:", err);
      res.status(500).json({ message: "Server error deleting patient" });
    }
  }
);

module.exports = router;
