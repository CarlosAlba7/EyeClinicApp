const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Query employee by email
    const [employees] = await db.query(
      'SELECT * FROM employee WHERE email = ?',
      [email]
    );

    if (employees.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const employee = employees[0];

    // For demo purposes, password is: password123 for all users
    // In production, you should hash passwords properly
    const isValidPassword = password === 'password123';

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        employeeID: employee.employeeID,
        email: employee.email,
        employeeType: employee.employeeType,
        firstName: employee.firstName,
        lastName: employee.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        employeeID: employee.employeeID,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        employeeType: employee.employeeType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [employees] = await db.query(
      'SELECT employeeID, firstName, lastName, email, employeeType FROM employee WHERE employeeID = ?',
      [decoded.employeeID]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
