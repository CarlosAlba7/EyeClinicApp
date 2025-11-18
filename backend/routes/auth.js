const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

// --------------------------
// LOGIN ROUTE (EMPLOYEE + PATIENT)
// --------------------------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // 1. Check employee table
    const [employees] = await db.query(
      "SELECT employeeID, firstName, lastName, email, employeeType FROM employee WHERE email = ?",
      [email]
    );

    if (employees.length > 0) {
      const employee = employees[0];

      // Demo fixed password
      const isValidPassword = password === "password123";

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate unified token
      const token = jwt.sign(
        {
          userID: employee.employeeID,
          role: employee.employeeType, // Admin / Doctor / Receptionist
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" }
      );

      return res.json({
        token,
        user: {
          userID: employee.employeeID,
          role: employee.employeeType,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
        },
      });
    }

    // 2. Check patient table (users table)
    const [users] = await db.query(
      "SELECT userID, email, passwordHash, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    const correctPassword = await bcrypt.compare(password, user.passwordHash);
    if (!correctPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token for patient
    const token = jwt.sign(
      {
        userID: user.userID,
        role: user.role, // Always "Patient"
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Fetch patient profile
    const [patient] = await db.query(
      "SELECT firstName, lastName FROM patient WHERE userID = ?",
      [user.userID]
    );

    return res.json({
      token,
      user: {
        userID: user.userID,
        role: user.role,
        firstName: patient[0]?.firstName || "",
        lastName: patient[0]?.lastName || "",
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// --------------------------
// CURRENT USER (EMPLOYEE OR PATIENT)
// --------------------------
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // PATIENT
    if (decoded.role === "Patient") {
      const [rows] = await db.query(
        `SELECT 
            p.patientID,
            p.userID,
            p.firstName,
            p.middleInit,
            p.lastName,
            p.gender,
            p.patientBirthdate,
            p.patientAddress,
            p.email,
            p.phone,
            p.emergencyEmail,
            p.emergencyPhone,
            p.visionHistory,
            p.medHistory,
            p.insuranceNote,
            u.role
         FROM patient p
         JOIN users u ON p.userID = u.userID
         WHERE p.userID = ?`,
        [decoded.userID]
      );

      return res.json(rows[0]);
    }

    // EMPLOYEE
    const [rows] = await db.query(
      `SELECT 
          employeeID AS userID,
          firstName,
          lastName,
          email,
          employeeType AS role
       FROM employee 
       WHERE employeeID = ?`,
      [decoded.userID]
    );

    return res.json(rows[0]);

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// --------------------------
// PATIENT SIGNUP
// --------------------------
router.post("/patient-signup", async (req, res) => {
  const {
    firstName,
    middleInit,
    lastName,
    email,
    phone,
    password,
    gender,
    patientBirthdate,
    patientAddress
  } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !gender || !patientBirthdate) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Check if email exists
    const [existingUser] = await db.query(
      "SELECT userID FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const connection = await db.getConnection();
    await connection.beginTransaction();

    // Insert into users table
    const [userResult] = await connection.query(
      `INSERT INTO users (email, passwordHash, role)
       VALUES (?, ?, 'Patient')`,
      [email, passwordHash]
    );

    const userID = userResult.insertId;

    // Insert into patient table
    const [patientResult] = await connection.query(
      `INSERT INTO patient (
          userID, firstName, middleInit, lastName, gender,
          patientBirthdate, patientAddress, email, phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userID,
        firstName,
        middleInit || null,
        lastName,
        gender,
        patientBirthdate,
        patientAddress || null,
        email,
        phone
      ]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      message: "Patient account created.",
      userID,
      patientID: patientResult.insertId,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during signup." });
  }
});

// PATIENT LOGIN
router.post("/patient-login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required." });
    }

    // Check if user exists
    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND role = 'Patient'",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid login." });
    }

    const user = users[0];

    // Check password
    const bcrypt = require("bcryptjs");
    const validPass = await bcrypt.compare(password, user.passwordHash);

    if (!validPass) {
      return res.status(401).json({ message: "Invalid login." });
    }

    // Get patient profile
    const [patient] = await db.query("SELECT * FROM patient WHERE userID = ?", [
      user.userID,
    ]);

    // Generate token
    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
      {
        userID: user.userID,
        role: "Patient",
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        userID: user.userID,
        role: "Patient",
        firstName: patient[0].firstName,
        lastName: patient[0].lastName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Patient login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
