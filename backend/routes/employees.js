const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, type } = req.query;
    
    let query = 'SELECT * FROM employee';
    let params = [];
    const conditions = [];

    if (search) {
      conditions.push('(firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (type) {
      conditions.push('employeeType = ?');
      params.push(type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY employeeID DESC';

    const [employees] = await db.query(query, params);
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error fetching employees' });
  }
});

// Get single employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [employees] = await db.query(
      'SELECT * FROM employee WHERE employeeID = ?',
      [req.params.id]
    );

    if (employees.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employees[0]);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ message: 'Server error fetching employee' });
  }
});

// Create new employee
router.post('/', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const {
      firstName, middleInit, lastName, gender, birthdate,
      employeeAddress, employeeType, specialization, yearsExperience,
      startedOn, endedOn, employeeSSN, employeeContact,
      email, phone, emergencyPhone, emergencyEmail, salary
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO employee (
        firstName, middleInit, lastName, gender, birthdate,
        employeeAddress, employeeType, specialization, yearsExperience,
        startedOn, endedOn, employeeSSN, employeeContact,
        email, phone, emergencyPhone, emergencyEmail, salary
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        firstName, middleInit, lastName, gender, birthdate,
        employeeAddress, employeeType, specialization, yearsExperience,
        startedOn, endedOn, employeeSSN, employeeContact,
        email, phone, emergencyPhone, emergencyEmail, salary
      ]
    );

    res.status(201).json({
      message: 'Employee created successfully',
      employeeID: result.insertId
    });
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.sqlMessage && error.sqlMessage.includes('Receptionist salary')) {
      return res.status(400).json({ message: error.sqlMessage });
    }
    res.status(500).json({ message: 'Server error creating employee' });
  }
});

// Update employee
router.put('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const {
      firstName, middleInit, lastName, gender, birthdate,
      employeeAddress, employeeType, specialization, yearsExperience,
      startedOn, endedOn, employeeSSN, employeeContact,
      email, phone, emergencyPhone, emergencyEmail, salary
    } = req.body;

    const [result] = await db.query(
      `UPDATE employee SET
        firstName = ?, middleInit = ?, lastName = ?, gender = ?,
        birthdate = ?, employeeAddress = ?, employeeType = ?,
        specialization = ?, yearsExperience = ?, startedOn = ?,
        endedOn = ?, employeeSSN = ?, employeeContact = ?,
        email = ?, phone = ?, emergencyPhone = ?, emergencyEmail = ?,
        salary = ?
      WHERE employeeID = ?`,
      [
        firstName, middleInit, lastName, gender, birthdate,
        employeeAddress, employeeType, specialization, yearsExperience,
        startedOn, endedOn, employeeSSN, employeeContact,
        email, phone, emergencyPhone, emergencyEmail, salary,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    if (error.sqlMessage && error.sqlMessage.includes('Receptionist salary')) {
      return res.status(400).json({ message: error.sqlMessage });
    }
    res.status(500).json({ message: 'Server error updating employee' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, authorizeRoles('Admin'), async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM employee WHERE employeeID = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error deleting employee' });
  }
});

module.exports = router;
