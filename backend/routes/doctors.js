const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const [doctors] = await db.query(
      `SELECT employeeID, firstName, lastName, specialization, phone
       FROM employee 
       WHERE employeeType = 'Doctor'`
    );

    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: "Failed to load doctors" });
  }
});

module.exports = router;
