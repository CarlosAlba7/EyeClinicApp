const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// REPORT 1: Appointment Statistics
router.get('/appointment-statistics', authenticateToken, async (req, res) => {
  try {

    const {
      employeeID,
      startDate,
      endDate
    } = req.query;

    const params = [];
    
    let query = `
      SELECT
        e.employeeID,
        CONCAT(e.firstName, ' ', e.lastName) AS doctorName,
        COUNT(a.apptID) AS totalAppointments,
        SUM(CASE WHEN a.appointmentStatus = 'Completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN a.appointmentStatus = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN a.appointmentStatus = 'No-Show' THEN 1 ELSE 0 END) AS noShow,
        ROUND(
          SUM(CASE WHEN a.appointmentStatus = 'Completed' THEN 1 ELSE 0 END) /
          NULLIF(COUNT(a.apptID), 0) * 100, 2
        ) AS completionRate
      FROM employee e
      LEFT JOIN appointment a
        ON e.employeeID = a.employeeID
        ${startDate && endDate ? "AND a.appointmentDate BETWEEN ? AND ?" : ""}
      WHERE e.employeeType = 'Doctor'
      ${employeeID ? "AND e.employeeID = ?" : ""}
      GROUP BY e.employeeID, e.firstName, e.lastName
      ORDER BY totalAppointments DESC
    `;

    if (startDate != "" && endDate != "") {
      params.push(startDate, endDate);
    }

    if (employeeID != "" && employeeID != undefined) {
      params.push(employeeID);
    }

    const [results] = await db.query(query, params);

    res.json({
      title: 'Appointment Statistics',
      filters: { employeeID, startDate, endDate },
      data: results
    });
  } catch (error) {
    console.error('Appointment statistics error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// REPORT 2: Revenue Report by Month
router.get('/revenue-by-month', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        DATE_FORMAT(dateIssued, '%Y-%m') as month,
        COUNT(*) as invoiceCount,
        SUM(invoiceTotal) as totalRevenue,
        AVG(invoiceTotal) as averageInvoice,
        SUM(CASE WHEN invoiceStatus = 'Paid' THEN invoiceTotal ELSE 0 END) as paidAmount,
        SUM(CASE WHEN invoiceStatus = 'Pending' THEN invoiceTotal ELSE 0 END) as pendingAmount
      FROM invoice
      GROUP BY DATE_FORMAT(dateIssued, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      title: 'Revenue Report by Month',
      data: results
    });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// REPORT 3: Employee Performance Report
router.get('/employee-performance', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        e.employeeID,
        CONCAT(e.firstName, ' ', e.lastName) as employeeName,
        e.employeeType,
        e.specialization,
        COALESCE(SUM(i.invoiceTotal), 0) as totalRevenue,
        COALESCE(ROUND(
          COUNT(DISTINCT CASE WHEN a.appointmentStatus = 'Completed' THEN a.apptID END) * 100.0 / 
          NULLIF(COUNT(DISTINCT a.apptID), 0), 2
        ), 0) as completionRate
      FROM employee e
      LEFT JOIN appointment a ON e.employeeID = a.employeeID
      LEFT JOIN invoice i ON a.apptID = i.apptID
      WHERE e.employeeType IN ('Doctor', 'Receptionist')
      GROUP BY e.employeeID, e.firstName, e.lastName, e.employeeType, e.specialization
      ORDER BY totalRevenue DESC
    `);

    res.json({
      title: 'Employee Performance Report',
      data: results
    });
  } catch (error) {
    console.error('Employee performance error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// REPORT 4: Patient Demographics Report
router.get('/patient-demographics', authenticateToken, async (req, res) => {
  try {
    const [genderStats] = await db.query(`
      SELECT 
        gender,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM patient), 2) as percentage
      FROM patient
      WHERE gender IS NOT NULL
      GROUP BY gender
    `);

    const [ageStats] = await db.query(`
      SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, patientBirthdate, CURDATE()) < 18 THEN 'Under 18'
          WHEN TIMESTAMPDIFF(YEAR, patientBirthdate, CURDATE()) BETWEEN 18 AND 30 THEN '18-30'
          WHEN TIMESTAMPDIFF(YEAR, patientBirthdate, CURDATE()) BETWEEN 31 AND 50 THEN '31-50'
          WHEN TIMESTAMPDIFF(YEAR, patientBirthdate, CURDATE()) BETWEEN 51 AND 70 THEN '51-70'
          ELSE 'Over 70'
        END as ageGroup,
        COUNT(*) as count
      FROM patient
      WHERE patientBirthdate IS NOT NULL
      GROUP BY ageGroup
      ORDER BY 
        CASE ageGroup
          WHEN 'Under 18' THEN 1
          WHEN '18-30' THEN 2
          WHEN '31-50' THEN 3
          WHEN '51-70' THEN 4
          WHEN 'Over 70' THEN 5
        END
    `);

    res.json({
      title: 'Patient Demographics Report',
      data: {
        genderDistribution: genderStats,
        ageDistribution: ageStats
      }
    });
  } catch (error) {
    console.error('Patient demographics error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// QUERY 1: Search patients
router.get('/patients-by-condition', authenticateToken, async (req, res) => {
  try {
    const { gender, minAge, maxAge } = req.query;

    const params = [];
    let conditions = [];

    // Gender filter
    if (gender) {
      conditions.push("gender = ?");
      params.push(gender);
    }

    // Age range filter
    if (minAge) {
      conditions.push("TIMESTAMPDIFF(YEAR, patientBirthdate, CURDATE()) >= ?");
      params.push(Number(minAge));
    }

    if (maxAge) {
      conditions.push("TIMESTAMPDIFF(YEAR, patientBirthdate, CURDATE()) <= ?");
      params.push(Number(maxAge));
    }

    let query = `
      SELECT
        CONCAT(firstName, ' ', lastName) as patientName,
        email,
        phone,
        medHistory,
        visionHistory,
        gender,
        patientBirthdate
      FROM patient
    `;

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY lastName, firstName";

    const [results] = await db.query(query, params);

    res.json({
      query: 'Patients by Filter',
      filters: {
        gender,
        minAge,
        maxAge
      },
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Patients query error:', error);
    res.status(500).json({ message: 'Server error executing patient query' });
  }
});

// QUERY 2: Appointments in date range
router.get('/appointments-by-date-range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, employeeID, status } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    let query = `
      SELECT
        a.apptID,
        a.appointmentDate,
        a.appointmentTime,
        a.appointmentStatus,
        a.reason,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.email as patientEmail,
        CONCAT(e.firstName, ' ', e.lastName) as doctorName,
        e.specialization
      FROM appointment a
      LEFT JOIN patient p ON a.patientID = p.patientID
      LEFT JOIN employee e ON a.employeeID = e.employeeID
      WHERE a.appointmentDate BETWEEN ? AND ?
    `;

    const params = [startDate, endDate];

    // optional doctor
    if (employeeID && employeeID !== "") {
      query += " AND a.employeeID = ?";
      params.push(employeeID);
    }

    // optional status
    if (status && status !== "") {
      query += " AND a.appointmentStatus = ?";
      params.push(status);
    }

    query += " ORDER BY a.appointmentDate, a.appointmentTime";

    const [results] = await db.query(query, params);

    res.json({
      query: 'Appointments by Date Range',
      filters: { startDate, endDate, employeeID, status },
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Appointments by date range error:', error);
    res.status(500).json({ message: 'Server error executing query' });
  }
});

// QUERY 3: Outstanding invoices
router.get('/outstanding-invoices', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        i.invoiceID,
        i.dateIssued,
        i.invoiceTotal,
        i.invoiceStatus,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.email as patientEmail,
        p.phone as patientPhone,
        DATEDIFF(CURDATE(), i.dateIssued) as daysOutstanding
      FROM invoice i
      LEFT JOIN patient p ON i.patientID = p.patientID
      WHERE i.invoiceStatus IN ('Pending', 'Overdue')
      ORDER BY i.dateIssued ASC
    `);

    const totalOutstanding = results.reduce((sum, inv) => sum + parseFloat(inv.invoiceTotal), 0);

    res.json({
      query: 'Outstanding Invoices',
      count: results.length,
      totalOutstanding: totalOutstanding.toFixed(2),
      data: results
    });
  } catch (error) {
    console.error('Outstanding invoices error:', error);
    res.status(500).json({ message: 'Server error executing query' });
  }
});

// QUERY 4: Doctor workload
router.get('/doctor-workload', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = `
      SELECT 
        e.employeeID,
        CONCAT(e.firstName, ' ', e.lastName) as doctorName,
        e.specialization,
        COUNT(a.apptID) as appointmentCount,
        COUNT(CASE WHEN a.appointmentStatus = 'Scheduled' THEN 1 END) as scheduledCount,
        COUNT(CASE WHEN a.appointmentStatus = 'Completed' THEN 1 END) as completedCount,
        COUNT(CASE WHEN a.appointmentStatus = 'Cancelled' THEN 1 END) as cancelledCount
      FROM employee e
      LEFT JOIN appointment a ON e.employeeID = a.employeeID
      WHERE e.employeeType = 'Doctor'
    `;

    const params = [];
    if (month && year) {
      query += ` AND MONTH(a.appointmentDate) = ? AND YEAR(a.appointmentDate) = ?`;
      params.push(month, year);
    }

    query += ` GROUP BY e.employeeID, e.firstName, e.lastName, e.specialization
               ORDER BY appointmentCount DESC`;

    const [results] = await db.query(query, params);

    res.json({
      query: 'Doctor Workload Analysis',
      period: month && year ? `${year}-${month.toString().padStart(2, '0')}` : 'All time',
      data: results
    });
  } catch (error) {
    console.error('Doctor workload error:', error);
    res.status(500).json({ message: 'Server error executing query' });
  }
});

// Get list of doctors for report filters
router.get('/doctors', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        employeeID AS id,
        CONCAT(firstName, ' ', lastName) as name
      FROM employee
      WHERE employeeType = 'Doctor'
      ORDER BY lastName, firstName
    `);

    res.json(results);
  } catch (error) {
    console.error('Error fetching doctor list:', error);
    res.status(500).json({ message: 'Server error fetching doctor list' });
  }
});

module.exports = router;
