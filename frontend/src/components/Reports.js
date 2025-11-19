import { useState, useEffect } from 'react';
import { reportAPI, shopAPI, employeeAPI, patientAPI } from '../services/api';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('');
  const [activeReport, setActiveReport] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Dropdown data
  const [shopItems, setShopItems] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  // Query parameters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder] = useState('DESC');

  // Shop Sales Report filters
  const [shopCategory, setShopCategory] = useState('');
  const [shopItemID, setShopItemID] = useState('');
  const [shopOrderStatus, setShopOrderStatus] = useState('');
  const [shopSortBy, setShopSortBy] = useState('revenue');

  // Doctor Activity Report filters
  const [doctorID, setDoctorID] = useState('');
  const [doctorApptType, setDoctorApptType] = useState('');
  const [doctorApptStatus, setDoctorApptStatus] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [hasSpecialistReferral, setHasSpecialistReferral] = useState('');

  // Patient Appointment History filters
  const [patientID, setPatientID] = useState('');
  const [patientApptStatus, setPatientApptStatus] = useState('');
  const [patientApptType, setPatientApptType] = useState('');
  const [patientDoctorID, setPatientDoctorID] = useState('');

  // Fetch dropdown data on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [itemsRes, employeesRes, patientsRes] = await Promise.all([
          shopAPI.getAllItems(),
          employeeAPI.getAll(),
          patientAPI.getAll()
        ]);

        setShopItems(itemsRes.data || []);
        setDoctors((employeesRes.data || []).filter(emp => emp.employeeType === 'Doctor'));
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const generateReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    setReportData(null);
    try {
      let response;
      switch (reportType) {
        case 'shopSales':
          response = await reportAPI.shopSales({
            startDate,
            endDate,
            category: shopCategory,
            itemID: shopItemID,
            orderStatus: shopOrderStatus,
            sortBy: shopSortBy,
            sortOrder
          });
          break;
        case 'doctorActivity':
          response = await reportAPI.doctorActivity({
            employeeID: doctorID,
            appointmentType: doctorApptType,
            appointmentStatus: doctorApptStatus,
            startDate,
            endDate,
            ageGroup,
            hasSpecialistReferral
          });
          break;
        case 'patientAppointmentHistory':
          response = await reportAPI.patientAppointmentHistory({
            patientID,
            appointmentStatus: patientApptStatus,
            startDate,
            endDate,
            employeeID: patientDoctorID,
            appointmentType: patientApptType,
            hasSpecialistReferral
          });
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
      case 'shopSales':
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div className="stat-card">
                <h4>{reportData.totals.totalOrders}</h4>
                <p>Total Orders</p>
              </div>
              <div className="stat-card">
                <h4>{reportData.totals.totalQuantity}</h4>
                <p>Items Sold</p>
              </div>
              <div className="stat-card">
                <h4>${parseFloat(reportData.totals.totalRevenue || 0).toFixed(2)}</h4>
                <p>Total Revenue</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item ID</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                  <th>Avg Price</th>
                  <th>First Sale</th>
                  <th>Last Sale</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.itemID}</td>
                    <td>{row.itemName}</td>
                    <td>{row.category}</td>
                    <td>{row.totalOrders || 0}</td>
                    <td>{row.totalQuantitySold || 0}</td>
                    <td>${parseFloat(row.totalRevenue || 0).toFixed(2)}</td>
                    <td>${parseFloat(row.averagePrice || 0).toFixed(2)}</td>
                    <td>{row.firstSale ? new Date(row.firstSale).toLocaleDateString() : 'N/A'}</td>
                    <td>{row.lastSale ? new Date(row.lastSale).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'doctorActivity':
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div className="stat-card">
                <h4>{reportData.summary.totalAppointments}</h4>
                <p>Total Appointments</p>
              </div>
              <div className="stat-card">
                <h4>{reportData.summary.specialistReferrals}</h4>
                <p>Specialist Referrals</p>
              </div>
              <div className="stat-card">
                <h4>
                  {Object.entries(reportData.summary.byType).map(([type, count]) => (
                    <span key={type} style={{ display: 'block', fontSize: '0.9rem' }}>
                      {type}: {count}
                    </span>
                  ))}
                </h4>
                <p>By Type</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Patient</th>
                  <th>Age</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Specialist?</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.doctorName}</td>
                    <td>{row.patientName}</td>
                    <td>{row.patientAge}</td>
                    <td>{new Date(row.appointmentDate).toLocaleDateString()}</td>
                    <td>{row.appointmentTime}</td>
                    <td>{row.appointmentType}</td>
                    <td>{row.appointmentStatus}</td>
                    <td>{row.reason}</td>
                    <td>{row.needsSpecialist ? `Yes (${row.specialistType})` : 'No'}</td>
                    <td>{row.appointmentSummary || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'patientAppointmentHistory':
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div className="stat-card">
                <h4>{reportData.summary.totalPatients}</h4>
                <p>Total Patients</p>
              </div>
              <div className="stat-card">
                <h4>{reportData.summary.totalAppointments}</h4>
                <p>Total Appointments</p>
              </div>
              <div className="stat-card">
                <h4>{reportData.summary.avgAppointmentsPerPatient}</h4>
                <p>Avg Appts/Patient</p>
              </div>
            </div>
            {reportData.data.map((patient, idx) => (
              <div key={idx} style={{ marginBottom: '2rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '4px' }}>
                <h4>{patient.patientName} (ID: {patient.patientID})</h4>
                <p>
                  <strong>Age:</strong> {patient.age} |
                  <strong> Gender:</strong> {patient.gender || 'N/A'} |
                  <strong> Email:</strong> {patient.patientEmail} |
                  <strong> Phone:</strong> {patient.patientPhone}
                </p>
                <p><strong>Total Appointments:</strong> {patient.appointments.length}</p>
                {patient.appointments.length > 0 ? (
                  <table style={{ width: '100%', marginTop: '0.5rem' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Doctor</th>
                        <th>Reason</th>
                        <th>Summary</th>
                        <th>Specialist Referral</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.appointments.map((appt, apptIdx) => (
                        <tr key={apptIdx}>
                          <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                          <td>{appt.appointmentTime}</td>
                          <td>{appt.appointmentType}</td>
                          <td>{appt.appointmentStatus}</td>
                          <td>{appt.doctorName || 'N/A'}</td>
                          <td>{appt.reason}</td>
                          <td>{appt.appointmentSummary || '-'}</td>
                          <td>{appt.needsSpecialist ? `${appt.specialistType}` : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No appointments found</p>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Admin Reports</h1>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Report Selection Buttons */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', padding: '2rem' }}>
          <button
            onClick={() => {
              setSelectedReport('shopSales');
              setReportData(null);
            }}
            className={`btn ${selectedReport === 'shopSales' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              flex: 1,
              maxWidth: '350px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              border: selectedReport === 'shopSales' ? '3px solid #007bff' : '2px solid #6c757d',
              borderRadius: '12px',
              boxShadow: selectedReport === 'shopSales' ? '0 6px 20px rgba(0,123,255,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: selectedReport === 'shopSales' ? 'translateY(-4px)' : 'none'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🛒</div>
            <div>Shop Sales Report</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'normal', opacity: 0.85, textAlign: 'center' }}>
              Analyze merchandise sales, revenue, and order trends
            </div>
          </button>
          <button
            onClick={() => {
              setSelectedReport('doctorActivity');
              setReportData(null);
            }}
            className={`btn ${selectedReport === 'doctorActivity' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              flex: 1,
              maxWidth: '350px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              border: selectedReport === 'doctorActivity' ? '3px solid #007bff' : '2px solid #6c757d',
              borderRadius: '12px',
              boxShadow: selectedReport === 'doctorActivity' ? '0 6px 20px rgba(0,123,255,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: selectedReport === 'doctorActivity' ? 'translateY(-4px)' : 'none'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>👨‍⚕️</div>
            <div>Doctor Activity Report</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'normal', opacity: 0.85, textAlign: 'center' }}>
              Track appointments, patient demographics, and referrals
            </div>
          </button>
          <button
            onClick={() => {
              setSelectedReport('patientAppointmentHistory');
              setReportData(null);
            }}
            className={`btn ${selectedReport === 'patientAppointmentHistory' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              flex: 1,
              maxWidth: '350px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              border: selectedReport === 'patientAppointmentHistory' ? '3px solid #007bff' : '2px solid #6c757d',
              borderRadius: '12px',
              boxShadow: selectedReport === 'patientAppointmentHistory' ? '0 6px 20px rgba(0,123,255,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              transform: selectedReport === 'patientAppointmentHistory' ? 'translateY(-4px)' : 'none'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📋</div>
            <div>Patient Appointment History</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'normal', opacity: 0.85, textAlign: 'center' }}>
              Complete patient records with appointment details
            </div>
          </button>
        </div>
      </div>

      {/* Filters Section - Conditional Rendering */}
      {selectedReport === 'shopSales' && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">Shop Sales Report Filters</div>
          <div className="form-group">
            <label>Category</label>
            <select
              className="form-control"
              value={shopCategory}
              onChange={(e) => setShopCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Contact Care">Contact Care</option>
              <option value="Accessories">Accessories</option>
            </select>
          </div>
          <div className="form-group">
            <label>Item</label>
            <select
              className="form-control"
              value={shopItemID}
              onChange={(e) => setShopItemID(e.target.value)}
            >
              <option value="">All Items</option>
              {shopItems.map((item) => (
                <option key={item.itemID} value={item.itemID}>
                  {item.itemName} (ID: {item.itemID})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Order Status</label>
            <select
              className="form-control"
              value={shopOrderStatus}
              onChange={(e) => setShopOrderStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Sort By</label>
            <select
              className="form-control"
              value={shopSortBy}
              onChange={(e) => setShopSortBy(e.target.value)}
            >
              <option value="revenue">Revenue</option>
              <option value="quantity">Quantity Sold</option>
              <option value="orders">Number of Orders</option>
              <option value="itemName">Item Name</option>
              <option value="category">Category</option>
            </select>
          </div>
          <button
            onClick={() => generateReport('shopSales')}
            className="btn btn-primary"
            disabled={loading}
          >
            Generate Report
          </button>
        </div>
      )}

      {selectedReport === 'doctorActivity' && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">Doctor Activity Report Filters</div>
          <div className="form-group">
            <label>Doctor</label>
            <select
              className="form-control"
              value={doctorID}
              onChange={(e) => setDoctorID(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.employeeID} value={doctor.employeeID}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General'}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Appointment Type</label>
            <select
              className="form-control"
              value={doctorApptType}
              onChange={(e) => setDoctorApptType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Normal">Normal</option>
              <option value="Checkup">Checkup</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div className="form-group">
            <label>Appointment Status</label>
            <select
              className="form-control"
              value={doctorApptStatus}
              onChange={(e) => setDoctorApptStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Patient Age Group</label>
            <select
              className="form-control"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
            >
              <option value="">All Ages</option>
              <option value="Under 18">Under 18</option>
              <option value="18-30">18-30</option>
              <option value="31-50">31-50</option>
              <option value="51-70">51-70</option>
              <option value="Over 70">Over 70</option>
            </select>
          </div>
          <div className="form-group">
            <label>Specialist Referral</label>
            <select
              className="form-control"
              value={hasSpecialistReferral}
              onChange={(e) => setHasSpecialistReferral(e.target.value)}
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => generateReport('doctorActivity')}
            className="btn btn-primary"
            disabled={loading}
          >
            Generate Report
          </button>
        </div>
      )}

      {selectedReport === 'patientAppointmentHistory' && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <div className="card-header">Patient Appointment History Filters</div>
          <div className="form-group">
            <label>Patient</label>
            <select
              className="form-control"
              value={patientID}
              onChange={(e) => setPatientID(e.target.value)}
            >
              <option value="">All Patients</option>
              {patients.map((patient) => (
                <option key={patient.patientID} value={patient.patientID}>
                  {patient.firstName} {patient.lastName} - {patient.email}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Appointment Status</label>
            <select
              className="form-control"
              value={patientApptStatus}
              onChange={(e) => setPatientApptStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Appointment Type</label>
            <select
              className="form-control"
              value={patientApptType}
              onChange={(e) => setPatientApptType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Normal">Normal</option>
              <option value="Checkup">Checkup</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>
          <div className="form-group">
            <label>Doctor</label>
            <select
              className="form-control"
              value={patientDoctorID}
              onChange={(e) => setPatientDoctorID(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.employeeID} value={doctor.employeeID}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General'}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date Range</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => generateReport('patientAppointmentHistory')}
            className="btn btn-primary"
            disabled={loading}
          >
            Generate Report
          </button>
        </div>
      )}

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
