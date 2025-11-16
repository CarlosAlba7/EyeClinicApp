const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

router.get(
  "/me",
  authenticateToken,

  async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT p.*, u.email, u.role 
       FROM patient p
       JOIN users u ON p.userID = u.userID
       WHERE p.userID = ?`,
        [req.user.userID]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: "Patient profile not found" });
      }

      res.json(rows[0]);
    } catch (err) {
      console.error("Error loading patient profile:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
