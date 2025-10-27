import React, { useState } from 'react';
import { reportAPI } from '../services/api';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Query parameters
  const [condition, setCondition] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const generateReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    try {
      let response;
      switch (reportType) {
        case 'appointmentStats':
          response = await reportAPI.appointmentStatistics();
          break;
        case 'revenue':
          response = await reportAPI.revenueByMonth();
          break;
        case 'employeePerformance':
          response = await reportAPI.employeePerformance();
          break;
        case 'patientDemographics':
          response = await reportAPI.patientDemographics();
          break;
        case 'patientsByCondition':
          if (!condition) {
            showMessage('error', 'Please enter a medical condition');
            setLoading(false);
            return;
          }
          response = await reportAPI.patientsByCondition(condition);
          break;
        case 'appointmentsByDate':
          if (!startDate || !endDate) {
            showMessage('error', 'Please select both start and end dates');
            setLoading(false);
            return;
          }
          response = await reportAPI.appointmentsByDateRange(startDate, endDate);
          break;
        case 'outstandingInvoices':
          response = await reportAPI.outstandingInvoices();
          break;
        case 'doctorWorkload':
          response = await reportAPI.doctorWorkload(month, year);
          break;
        default:
          break;
      }
      setReportData(response.data);
    } catch (error) {
      showMessage('error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const renderReportData = () => {
    if (!reportData) return null;

    switch (activeReport) {
      case 'appointmentStats':
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.appointmentStatus}</td>
                    <td>{row.count}</td>
                    <td>{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'revenue':
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Invoice Count</th>
                  <th>Total Revenue</th>
                  <th>Average Invoice</th>
                  <th>Paid Amount</th>
                  <th>Pending Amount</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.month}</td>
                    <td>{row.invoiceCount}</td>
                    <td>${parseFloat(row.totalRevenue || 0).toFixed(2)}</td>
                    <td>${parseFloat(row.averageInvoice || 0).toFixed(2)}</td>
                    <td>${parseFloat(row.paidAmount || 0).toFixed(2)}</td>
                    <td>${parseFloat(row.pendingAmount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'employeePerformance':
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Type</th>
                  <th>Specialization</th>
                  <th>Total Appointments</th>
                  <th>Completed</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.employeeName}</td>
                    <td>{row.employeeType}</td>
                    <td>{row.specialization || '-'}</td>
                    <td>{row.totalAppointments}</td>
                    <td>{row.completedAppointments}</td>
                    <td>{row.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'patientDemographics':
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <div className="stats-grid">
              <div>
                <h4>Gender Distribution</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Gender</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.genderDistribution.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.gender}</td>
                        <td>{row.count}</td>
                        <td>{row.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h4>Age Distribution</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Age Group</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.ageDistribution.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.ageGroup}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'patientsByCondition':
        return (
          <div className="report-section">
            <h3>{reportData.query}</h3>
            <p><strong>Condition:</strong> {reportData.condition}</p>
            <p><strong>Total Patients Found:</strong> {reportData.count}</p>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Medical History</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.patientID}</td>
                    <td>{row.patientName}</td>
                    <td>{row.email}</td>
                    <td>{row.phone}</td>
                    <td>{row.medHistory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'appointmentsByDate':
        return (
          <div className="report-section">
            <h3>{reportData.query}</h3>
            <p><strong>Date Range:</strong> {reportData.startDate} to {reportData.endDate}</p>
            <p><strong>Total Appointments:</strong> {reportData.count}</p>
            <table>
              <thead>
                <tr>
                  <th>Appt ID</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.apptID}</td>
                    <td>{row.appointmentDate.split('T')[0]}</td>
                    <td>{row.appointmentTime}</td>
                    <td>{row.patientName}</td>
                    <td>{row.doctorName || '-'}</td>
                    <td>{row.appointmentStatus}</td>
                    <td>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'outstandingInvoices':
        return (
          <div className="report-section">
            <h3>{reportData.query}</h3>
            <div className="stat-card">
              <h4>${reportData.totalOutstanding}</h4>
              <p>Total Outstanding Amount</p>
            </div>
            <p><strong>Total Outstanding Invoices:</strong> {reportData.count}</p>
            <table>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient</th>
                  <th>Date Issued</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Days Outstanding</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.invoiceID}</td>
                    <td>{row.patientName}</td>
                    <td>{row.dateIssued.split('T')[0]}</td>
                    <td>${parseFloat(row.invoiceTotal).toFixed(2)}</td>
                    <td>{row.invoiceStatus}</td>
                    <td>{row.daysOutstanding}</td>
                    <td>{row.patientPhone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'doctorWorkload':
        return (
          <div className="report-section">
            <h3>{reportData.query}</h3>
            <p><strong>Period:</strong> {reportData.period}</p>
            <table>
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Specialization</th>
                  <th>Total Appointments</th>
                  <th>Scheduled</th>
                  <th>Completed</th>
                  <th>Cancelled</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.doctorName}</td>
                    <td>{row.specialization || '-'}</td>
                    <td>{row.appointmentCount}</td>
                    <td>{row.scheduledCount}</td>
                    <td>{row.completedCount}</td>
                    <td>{row.cancelledCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Reports & Data Queries</h1>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <div className="card-header">Available Reports</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="card">
            <h4>REPORT 1: Appointment Statistics</h4>
            <p>View appointment statistics by status</p>
            <button 
              onClick={() => generateReport('appointmentStats')}
              className="btn btn-primary"
              disabled={loading}
            >
              Generate Report
            </button>
          </div>

          <div className="card">
            <h4>REPORT 2: Revenue by Month</h4>
            <p>Monthly revenue analysis with payment breakdown</p>
            <button 
              onClick={() => generateReport('revenue')}
              className="btn btn-primary"
              disabled={loading}
            >
              Generate Report
            </button>
          </div>

          <div className="card">
            <h4>REPORT 3: Employee Performance</h4>
            <p>Staff performance metrics and completion rates</p>
            <button 
              onClick={() => generateReport('employeePerformance')}
              className="btn btn-primary"
              disabled={loading}
            >
              Generate Report
            </button>
          </div>

          <div className="card">
            <h4>REPORT 4: Patient Demographics</h4>
            <p>Patient demographics by gender and age group</p>
            <button 
              onClick={() => generateReport('patientDemographics')}
              className="btn btn-primary"
              disabled={loading}
            >
              Generate Report
            </button>
          </div>
        </div>

        <div className="card-header">Data Queries</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div className="card">
            <h4>QUERY 1: Patients by Condition</h4>
            <p>Find patients with specific medical conditions</p>
            <div className="form-group">
              <input 
                type="text" 
                className="form-control"
                placeholder="Enter condition (e.g., Diabetes)"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              />
            </div>
            <button 
              onClick={() => generateReport('patientsByCondition')}
              className="btn btn-success"
              disabled={loading}
            >
              Search
            </button>
          </div>

          <div className="card">
            <h4>QUERY 2: Appointments by Date Range</h4>
            <p>View appointments within a date range</p>
            <div className="form-group">
              <label>Start Date</label>
              <input 
                type="date" 
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input 
                type="date" 
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button 
              onClick={() => generateReport('appointmentsByDate')}
              className="btn btn-success"
              disabled={loading}
            >
              Search
            </button>
          </div>

          <div className="card">
            <h4>QUERY 3: Outstanding Invoices</h4>
            <p>List of pending and overdue invoices</p>
            <button 
              onClick={() => generateReport('outstandingInvoices')}
              className="btn btn-success"
              disabled={loading}
            >
              View Outstanding
            </button>
          </div>

          <div className="card">
            <h4>QUERY 4: Doctor Workload</h4>
            <p>Analyze doctor appointment workload</p>
            <div className="form-group">
              <label>Month (optional)</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="1-12"
                min="1"
                max="12"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Year (optional)</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="2024"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
            <button 
              onClick={() => generateReport('doctorWorkload')}
              className="btn btn-success"
              disabled={loading}
            >
              Analyze
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading">Generating report...</div>
      )}

      {reportData && !loading && (
        <div className="report-container">
          <div className="report-header">
            <h2>Report Results</h2>
          </div>
          {renderReportData()}
        </div>
      )}
    </div>
  );
};

export default Reports;
