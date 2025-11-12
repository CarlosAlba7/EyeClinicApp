const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all patients (with optional search)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = 'SELECT * FROM patient';
    let params = [];

    if (search) {
      query += ' WHERE firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR phone LIKE ?';
      const searchPattern = `%${search}%`;
      params = [searchPattern, searchPattern, searchPattern, searchPattern];
    }

    query += ' ORDER BY patientID DESC';

    const [patients] = await db.query(query, params);
    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: 'Server error fetching patients' });
  }
});

// Get single patient by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [patients] = await db.query(
      'SELECT * FROM patient WHERE patientID = ?',
      [req.params.id]
    );

    if (patients.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json(patients[0]);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: 'Server error fetching patient' });
  }
});

// Patient Signup
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await db.query(
      `INSERT INTO patient (
        firstName, lastName, email, phone, password)
        VALUES (?, ?, ?, ?, ?)`,
        [firstName, lastName, email, phone, password]
    );

    res.status(201).json({
      message: 'Patient account created successfully',
      patientID: result.insertID
    });
  } catch (error) {
    console.error('Patient signup error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error creating account' });
  }
});

// Create new patient
router.post('/', authenticateToken, authorizeRoles('Admin', 'Receptionist'), async (req, res) => {
  try {
    const {
      firstName, middleInit, lastName, gender, patientBirthdate,
      patientAddress, patientContact, email, phone,
      emergencyEmail, emergencyPhone, visionHistory,
      medHistory, insuranceNote
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO patient (
        firstName, middleInit, lastName, gender, patientBirthdate,
        patientAddress, patientContact, email, phone,
        emergencyEmail, emergencyPhone, visionHistory,
        medHistory, insuranceNote
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName, middleInit, lastName, gender, patientBirthdate,
        patientAddress, patientContact, email, phone,
        emergencyEmail, emergencyPhone, visionHistory,
        medHistory, insuranceNote
      ]
    );

    res.status(201).json({
      message: 'Patient created successfully',
      patientID: result.insertId
    });
  } catch (error) {
    console.error('Create patient error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error creating patient' });
  }
});

// Update patient
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Receptionist'), async (req, res) => {
  try {
    const {
      firstName, middleInit, lastName, gender, patientBirthdate,
      patientAddress, patientContact, email, phone,
      emergencyEmail, emergencyPhone, visionHistory,
      medHistory, insuranceNote
    } = req.body;

    const [result] = await db.query(
      `UPDATE patient SET
        firstName = ?, middleInit = ?, lastName = ?, gender = ?,
        patientBirthdate = ?, patientAddress = ?, patientContact = ?,
        email = ?, phone = ?, emergencyEmail = ?, emergencyPhone = ?,
        visionHistory = ?, medHistory = ?, insuranceNote = ?
      WHERE patientID = ?`,
      [
        firstName, middleInit, lastName, gender, patientBirthdate,
        patientAddress, patientContact, email, phone,
        emergencyEmail, emergencyPhone, visionHistory,
        medHistory, insuranceNote, req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Update patient error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error updating patient' });
  }
});

// Delete patient
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM patient WHERE patientID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ message: 'Server error deleting patient' });
  }
});

module.exports = router;
