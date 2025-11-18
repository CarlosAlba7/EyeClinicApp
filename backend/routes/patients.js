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
      const search = req.query.search ? `%${req.query.search}%` : "%";

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
         WHERE 
           p.firstName LIKE ? OR
           p.lastName LIKE ? OR
           CONCAT(p.firstName, ' ', p.lastName) LIKE ? OR
           p.email LIKE ? OR
           p.phone LIKE ?
         ORDER BY p.patientID DESC`,
        [search, search, search, search, search]
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
// CREATE NEW PATIENT (Admin / Receptionist)
// ---------------------------------------------------------
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin", "Receptionist"),
  async (req, res) => {
    try {
      const {
        firstName,
        middleInit,
        lastName,
        gender,
        patientBirthdate,
        patientAddress,
        email,
        phone,
        emergencyEmail,
        emergencyPhone,
        visionHistory,
        medHistory,
        insuranceNote,
      } = req.body;

      // Check required fields
      if (!firstName || !lastName || !email || !gender) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create login account in users table
      const [userResult] = await db.query(
        `INSERT INTO users (email, passwordHash, role)
         VALUES (?, ?, 'Patient')`,
        [email, ""] // <-- optional: no password for manually-created patient
      );

      const userID = userResult.insertId;

      // Insert into patient table
      await db.query(
        `INSERT INTO patient (
          userID, firstName, middleInit, lastName, gender,
          patientBirthdate, patientAddress, email, phone,
          emergencyEmail, emergencyPhone, visionHistory,
          medHistory, insuranceNote
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userID,
          firstName,
          middleInit,
          lastName,
          gender,
          patientBirthdate,
          patientAddress,
          email,
          phone,
          emergencyEmail,
          emergencyPhone,
          visionHistory,
          medHistory,
          insuranceNote,
        ]
      );

      res.status(201).json({ message: "Patient created successfully" });
    } catch (err) {
      console.error("Error creating patient:", err);
      res.status(500).json({ message: "Server error creating patient" });
    }
  }
);

// ---------------------------------------------------------
// UPDATE PATIENT (Admin / Staff)
// ---------------------------------------------------------
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("Admin", "Receptionist", "Patient"),
  async (req, res) => {
    try {
      const patientID = req.params.id;

      // Check if patient exists
      const [existing] = await db.query(
        "SELECT userID FROM patient WHERE patientID = ?",
        [patientID]
      );

      if (existing.length === 0) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Security: Patients can only edit themselves
      if (req.user.role === "Patient" && existing[0].userID !== req.user.userID) {
        return res.status(403).json({ message: "Not allowed" });
      }

      const {
        firstName,
        middleInit,
        lastName,
        email,
        phone,
        patientAddress
      } = req.body;

      await db.query(
        `UPDATE patient SET 
           firstName=?, 
           middleInit=?, 
           lastName=?, 
           email=?, 
           phone=?, 
           patientAddress=?
         WHERE patientID=?`,
        [
          firstName,
          middleInit,
          lastName,
          email,
          phone,
          patientAddress,
          patientID
        ]
      );

      await db.query("UPDATE users SET email=? WHERE userID=?", [
        email,
        existing[0].userID
      ]);

      res.json({ message: "Profile updated successfully!" });
    } catch (err) {
      console.error("Error updating patient:", err);
      res.status(500).json({ message: "Server error updating profile" });
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
