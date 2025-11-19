const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// REPORT 1: Shop Sales Report
router.get('/shop-sales', authenticateToken, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      itemID,
      orderStatus,
      sortBy = 'revenue',
      sortOrder = 'DESC'
    } = req.query;

    let query = `
      SELECT
        si.itemID,
        si.itemName,
        si.category,
        COUNT(DISTINCT so.orderID) as totalOrders,
        SUM(oi.quantity) as totalQuantitySold,
        SUM(oi.quantity * oi.priceAtPurchase) as totalRevenue,
        AVG(oi.priceAtPurchase) as averagePrice,
        MIN(so.orderDate) as firstSale,
        MAX(so.orderDate) as lastSale
      FROM shop_items si
      LEFT JOIN order_items oi ON si.itemID = oi.itemID
      LEFT JOIN shop_orders so ON oi.orderID = so.orderID
      WHERE 1=1
    `;

    const params = [];

    // Apply filters
    if (startDate && endDate) {
      query += ` AND so.orderDate BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (category) {
      query += ` AND si.category = ?`;
      params.push(category);
    }

    if (itemID) {
      query += ` AND si.itemID = ?`;
      params.push(itemID);
    }

    if (orderStatus) {
      query += ` AND so.orderStatus = ?`;
      params.push(orderStatus);
    }

    query += ` GROUP BY si.itemID, si.itemName, si.category`;

    // Validate and apply sorting
    const validSortColumns = ['revenue', 'quantity', 'orders', 'itemName', 'category'];
    const sortColumnMap = {
      'revenue': 'totalRevenue',
      'quantity': 'totalQuantitySold',
      'orders': 'totalOrders',
      'itemName': 'si.itemName',
      'category': 'si.category'
    };

    const safeSortBy = validSortColumns.includes(sortBy) ? sortColumnMap[sortBy] : 'totalRevenue';
    const safeSortOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    const [results] = await db.query(query, params);

    // Calculate totals
    const totals = results.reduce((acc, row) => ({
      totalOrders: acc.totalOrders + (row.totalOrders || 0),
      totalQuantity: acc.totalQuantity + (row.totalQuantitySold || 0),
      totalRevenue: acc.totalRevenue + (parseFloat(row.totalRevenue) || 0)
    }), { totalOrders: 0, totalQuantity: 0, totalRevenue: 0 });

    res.json({
      title: 'Shop Sales Report',
      filters: { startDate, endDate, category, itemID, orderStatus },
      sort: { sortBy: safeSortBy, sortOrder: safeSortOrder },
      totals,
      data: results
    });
  } catch (error) {
    console.error('Shop sales report error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// REPORT 2: Doctor Activity Report
router.get('/doctor-activity', authenticateToken, async (req, res) => {
  try {
    const {
      employeeID,
      appointmentType,
      appointmentStatus,
      startDate,
      endDate,
      ageGroup,
      hasSpecialistReferral
    } = req.query;

    let query = `
      SELECT
        e.employeeID,
        CONCAT(e.firstName, ' ', e.lastName) as doctorName,
        e.specialization,
        a.apptID,
        a.appointmentDate,
        a.appointmentTime,
        a.appointmentType,
        a.appointmentStatus,
        a.reason,
        a.appointmentSummary,
        a.needsSpecialist,
        a.specialistType,
        a.completedAt,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.patientID,
        TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) as patientAge,
        CASE
          WHEN TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) < 18 THEN 'Under 18'
          WHEN TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) BETWEEN 18 AND 30 THEN '18-30'
          WHEN TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) BETWEEN 31 AND 50 THEN '31-50'
          WHEN TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) BETWEEN 51 AND 70 THEN '51-70'
          ELSE 'Over 70'
        END as ageGroup
      FROM employee e
      INNER JOIN appointment a ON e.employeeID = a.employeeID
      INNER JOIN patient p ON a.patientID = p.patientID
      WHERE e.employeeType = 'Doctor'
    `;

    const params = [];

    // Apply filters
    if (employeeID) {
      query += ` AND e.employeeID = ?`;
      params.push(employeeID);
    }

    if (appointmentType) {
      query += ` AND a.appointmentType = ?`;
      params.push(appointmentType);
    }

    if (appointmentStatus) {
      query += ` AND a.appointmentStatus = ?`;
      params.push(appointmentStatus);
    }

    if (startDate && endDate) {
      query += ` AND a.appointmentDate BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (ageGroup) {
      const ageConditions = {
        'Under 18': 'TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) < 18',
        '18-30': 'TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) BETWEEN 18 AND 30',
        '31-50': 'TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) BETWEEN 31 AND 50',
        '51-70': 'TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) BETWEEN 51 AND 70',
        'Over 70': 'TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) > 70'
      };
      if (ageConditions[ageGroup]) {
        query += ` AND ${ageConditions[ageGroup]}`;
      }
    }

    if (hasSpecialistReferral !== undefined) {
      query += ` AND a.needsSpecialist = ?`;
      params.push(hasSpecialistReferral === 'true' || hasSpecialistReferral === '1' ? 1 : 0);
    }

    query += ` ORDER BY a.appointmentDate DESC, a.appointmentTime DESC`;

    const [results] = await db.query(query, params);

    // Calculate summary statistics
    const summary = {
      totalAppointments: results.length,
      byType: {},
      byStatus: {},
      specialistReferrals: results.filter(r => r.needsSpecialist).length,
      avgPatientsPerDay: 0
    };

    results.forEach(row => {
      summary.byType[row.appointmentType] = (summary.byType[row.appointmentType] || 0) + 1;
      summary.byStatus[row.appointmentStatus] = (summary.byStatus[row.appointmentStatus] || 0) + 1;
    });

    res.json({
      title: 'Doctor Activity Report',
      filters: { employeeID, appointmentType, appointmentStatus, startDate, endDate, ageGroup, hasSpecialistReferral },
      summary,
      data: results
    });
  } catch (error) {
    console.error('Doctor activity report error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// REPORT 3: Patient Appointment History Report
router.get('/patient-appointment-history', authenticateToken, async (req, res) => {
  try {
    const {
      patientID,
      patientSearch,
      appointmentStatus,
      startDate,
      endDate,
      employeeID,
      appointmentType,
      hasSpecialistReferral
    } = req.query;

    let query = `
      SELECT
        p.patientID,
        CONCAT(p.firstName, ' ', p.lastName) as patientName,
        p.email as patientEmail,
        p.phone as patientPhone,
        TIMESTAMPDIFF(YEAR, p.patientBirthdate, CURDATE()) as age,
        p.gender,
        a.apptID,
        a.appointmentDate,
        a.appointmentTime,
        a.appointmentType,
        a.appointmentStatus,
        a.reason,
        a.appointmentSummary,
        a.needsSpecialist,
        a.specialistType,
        a.completedAt,
        CONCAT(e.firstName, ' ', e.lastName) as doctorName,
        e.specialization as doctorSpecialization,
        e.employeeID
      FROM patient p
      LEFT JOIN appointment a ON p.patientID = a.patientID
      LEFT JOIN employee e ON a.employeeID = e.employeeID
      WHERE 1=1
    `;

    const params = [];

    // Apply filters
    if (patientID) {
      query += ` AND p.patientID = ?`;
      params.push(patientID);
    }

    if (patientSearch) {
      query += ` AND (CONCAT(p.firstName, ' ', p.lastName) LIKE ? OR p.email LIKE ?)`;
      params.push(`%${patientSearch}%`, `%${patientSearch}%`);
    }

    if (appointmentStatus) {
      query += ` AND a.appointmentStatus = ?`;
      params.push(appointmentStatus);
    }

    if (startDate && endDate) {
      query += ` AND a.appointmentDate BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    if (employeeID) {
      query += ` AND a.employeeID = ?`;
      params.push(employeeID);
    }

    if (appointmentType) {
      query += ` AND a.appointmentType = ?`;
      params.push(appointmentType);
    }

    if (hasSpecialistReferral !== undefined) {
      query += ` AND a.needsSpecialist = ?`;
      params.push(hasSpecialistReferral === 'true' || hasSpecialistReferral === '1' ? 1 : 0);
    }

    query += ` ORDER BY p.lastName, p.firstName, a.appointmentDate DESC`;

    const [results] = await db.query(query, params);

    // Group by patient
    const patientGroups = {};
    results.forEach(row => {
      if (!patientGroups[row.patientID]) {
        patientGroups[row.patientID] = {
          patientID: row.patientID,
          patientName: row.patientName,
          patientEmail: row.patientEmail,
          patientPhone: row.patientPhone,
          age: row.age,
          gender: row.gender,
          appointments: []
        };
      }
      if (row.apptID) {
        patientGroups[row.patientID].appointments.push({
          apptID: row.apptID,
          appointmentDate: row.appointmentDate,
          appointmentTime: row.appointmentTime,
          appointmentType: row.appointmentType,
          appointmentStatus: row.appointmentStatus,
          reason: row.reason,
          appointmentSummary: row.appointmentSummary,
          needsSpecialist: row.needsSpecialist,
          specialistType: row.specialistType,
          completedAt: row.completedAt,
          doctorName: row.doctorName,
          doctorSpecialization: row.doctorSpecialization
        });
      }
    });

    const patientData = Object.values(patientGroups);

    // Calculate summary
    const summary = {
      totalPatients: patientData.length,
      totalAppointments: results.filter(r => r.apptID).length,
      avgAppointmentsPerPatient: patientData.length > 0
        ? (results.filter(r => r.apptID).length / patientData.length).toFixed(2)
        : 0
    };

    res.json({
      title: 'Patient Appointment History Report',
      filters: { patientID, patientSearch, appointmentStatus, startDate, endDate, employeeID, appointmentType, hasSpecialistReferral },
      summary,
      data: patientData
    });
  } catch (error) {
    console.error('Patient appointment history report error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

module.exports = router;
