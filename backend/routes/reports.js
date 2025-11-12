const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// REPORT 1: Appointment Statistics
router.get('/appointment-statistics', authenticateToken, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      employeeID,
      patientID,
      status,
      sortBy = 'count',
      sortOrder = 'DESC'
    } = req.query;

    // Base query
    let query = `
      SELECT
        appointmentStatus,
        COUNT(*) AS count,
        ROUND(COUNT(*) * 100.0 / SELECT COUNT(*) FROM appointment), 2) AS percentage
      FROM appointment
      WHERE appointmentStatus IS NOT NULL
    `;

    const params = [];

    // Apply filters
    if (startDate && endDate) {
      query += ` AND appointmentDate BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (employeeID) {
      query += ` AND employeeID = ?`;
      params.push(employeeID);
    }

    if (patientID) {
      query += ` AND patientID = ?`;
      params.push(patientID);
    }

    if (status) {
      query += ` AND appointmentStatus = ?`;
      params.push(status);
    }

    query += ` GROUP BY appointmentStatus`;

    // Check if valid sorting
    const validSortColumns = ['appointmentStatus', 'count', 'percentage'];
    const validSortOrders = ['ASC', 'DESC'];

    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'count';
    const safeSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    const [results] = await db.query(query, params);

    res.json({
      title: 'Appointment Statistics',
      filters: { startDate, endDate, employeeID, patientID, status },
      sort: { sortBy: safeSortBy, sortOrder: safeSortOrder },
      data: results
    });
  } catch (error) {
    console.error('Appointment statistics error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// REPORT 1: Appointment Statistics by Status
/*router.get('/appointment-statistics', authenticateToken, async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        appointmentStatus,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM appointment), 2) as percentage
      FROM appointment
      WHERE appointmentStatus IS NOT NULL
      GROUP BY appointmentStatus
      ORDER BY count DESC
    `);

    res.json({
      title: 'Appointment Statistics by Status',
      data: results
    });
  } catch (error) {
    console.error('Appointment statistics error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});*/

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
        COUNT(DISTINCT a.apptID) as totalAppointments,
        COUNT(DISTINCT CASE WHEN a.appointmentStatus = 'Completed' THEN a.apptID END) as completedAppointments,
        ROUND(COUNT(DISTINCT CASE WHEN a.appointmentStatus = 'Completed' THEN a.apptID END) * 100.0 / 
              NULLIF(COUNT(DISTINCT a.apptID), 0), 2) as completionRate
      FROM employee e
      LEFT JOIN appointment a ON e.employeeID = a.employeeID
      WHERE e.employeeType IN ('Doctor', 'Receptionist')
      GROUP BY e.employeeID, e.firstName, e.lastName, e.employeeType, e.specialization
      ORDER BY totalAppointments DESC
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

// QUERY 1: Search patients with medical conditions
router.get('/patients-by-condition', authenticateToken, async (req, res) => {
  try {
    const { condition } = req.query;
    
    if (!condition) {
      return res.status(400).json({ message: 'Condition parameter is required' });
    }

    const [results] = await db.query(`
      SELECT 
        patientID,
        CONCAT(firstName, ' ', lastName) as patientName,
        email,
        phone,
        medHistory,
        visionHistory
      FROM patient
      WHERE medHistory LIKE ? OR visionHistory LIKE ?
      ORDER BY lastName, firstName
    `, [`%${condition}%`, `%${condition}%`]);

    res.json({
      query: 'Patients by Medical Condition',
      condition: condition,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Patients by condition error:', error);
    res.status(500).json({ message: 'Server error executing query' });
  }
});

// QUERY 2: Appointments in date range
router.get('/appointments-by-date-range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const [results] = await db.query(`
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
      ORDER BY a.appointmentDate, a.appointmentTime
    `, [startDate, endDate]);

    res.json({
      query: 'Appointments by Date Range',
      startDate,
      endDate,
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

module.exports = router;
