import React, { useState, useEffect, useRef } from "react";
import { reportAPI } from "../services/api";

const Reports = () => {
  const [showModal, setShowModal] = useState(false);

  const [activeReport, setActiveReport] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const resultsRef = useRef(null);

  // Query parameters
  const [gender, setGender] = useState("");
  const [ageRange, setAgeRange] = useState({ min: "", max: "" });
  const [selectedRange, setSelectedRange] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Appointment Statistics filters
  const [filterEmployee, setFilterEmployee] = useState("");

  // Doctors list
  const [doctors, setDoctors] = useState([{ id: "", name: "All Doctors" }]);

  // Fetch doctors for filtering
  useEffect(() => {
    reportAPI.getDoctors().then((response) => {
      setDoctors([{ id: "", name: "All Doctors" }, ...response.data]);
    });
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  // Generate selected report
  const generateReport = async (reportType) => {
    setLoading(true);
    setActiveReport(reportType);
    setReportData(null);
    try {
      let response;

      switch (reportType) {
        case "appointmentStats":
          response = await reportAPI.appointmentStatistics({
            employeeID: filterEmployee || "",
            startDate: startDate || "",
            endDate: endDate || "",
          });
          break;

        case "revenue":
          response = await reportAPI.revenueByMonth();
          break;

        case "employeePerformance":
          response = await reportAPI.employeePerformance();
          break;

        case "patientDemographics":
          response = await reportAPI.patientDemographics();
          break;

        case "patientsByCondition":
          if (ageRange.min && ageRange.max && ageRange.min > ageRange.max) {
            showMessage("error", "Min age cannot be greater than max age");
            setLoading(false);
            return;
          }
          response = await reportAPI.patientsByCondition({
            gender: gender || "",
            minAge: ageRange.min || "",
            maxAge: ageRange.max || "",
          });
          break;

        case "appointmentsByDate":
          if (!startDate || !endDate) {
            showMessage("error", "Please select both start and end dates");
            setLoading(false);
            return;
          }
          response = await reportAPI.appointmentsByDateRange(
            startDate,
            endDate,
            filterEmployee || "",
            filterStatus || ""
          );
          break;

        case "outstandingInvoices":
          response = await reportAPI.outstandingInvoices();
          break;

        case "doctorWorkload":
          response = await reportAPI.doctorWorkload(month, year);
          break;
        default:
          break;
      }
      setReportData(response.data);
      setShowModal(false);

      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: "smooth"});
        }
      }, 100);

    } catch (error) {
      showMessage("error", "Failed to generate report");
    }

    setLoading(false);
  };

  const renderReportData = () => {
    if (!reportData) return null;

    switch (activeReport) {
      case "appointmentStats":
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <p>
              Filters:
              {reportData.filters && (
                <>
                  {" "}
                  {reportData.filters.startDate && `From ${reportData.filters.startDate}`}
                  {reportData.filters.endDate && ` to ${reportData.filters.endDate}`}
                  {reportData.filters.employeeID && ` | Employee ID: ${reportData.filters.employeeID}`}
                  {/*reportData.filters.status && ` | Status: ${reportData.filters.status}`*/}
                  </>
              )}
            </p>

            <table>
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Total Appointments</th>
                  <th>Completed</th>
                  <th>Cancelled</th>
                  <th>No-Show</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data && reportData.data.length > 0 ? (
                  reportData.data.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.doctorName}</td>
                      <td>{row.totalAppointments}</td>
                      <td>{row.completed}</td>
                      <td>{row.cancelled}</td>
                      <td>{row.noShow}</td>
                      <td>{row.completionRate}%</td>
                  </tr>
                ))
              ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "1rem" }}>
                      No appointments found for the selected filters.
                    </td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        );

      case "revenue":
        return (
          <div className="report-section" style={{ marginTop: "1rem" }}>
            <h3>{reportData.title || "Revenue Report"}</h3>
            <p>Monthly revenue overview</p>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Invoice Count</th>
                  <th>Total Revenue</th>
                  <th>Average Invoice</th>
                  <th>Paid</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.length > 0 ? (
                reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.month}</td>
                    <td>{row.invoiceCount}</td>
                    <td>${parseFloat(row.totalRevenue || 0).toFixed(2)}</td>
                    <td>${parseFloat(row.averageInvoice || 0).toFixed(2)}</td>
                    <td>${parseFloat(row.paidAmount || 0).toFixed(2)}</td>
                    <td>${parseFloat(row.pendingAmount || 0).toFixed(2)}</td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                      No revenue data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );

      case "employeePerformance":
        return (
          <div className="report-section">
            <h3>{reportData.title}</h3>
            <table>
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Type</th>
                  <th>Specialization</th>
                  <th>Total Revenue</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.employeeName}</td>
                    <td>{row.employeeType}</td>
                    <td>{row.specialization || "-"}</td>
                    <td>{row.totalRevenue}</td>
                    <td>{row.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "patientDemographics":
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

      case "patientsByCondition":
        return (
          <div className="report-section">
            <h3>{reportData.query}</h3>
            <p>
              <strong>Filters Applied:</strong> {" "}
              {reportData.filters.gender && `Gender: ${reportData.filters.gender}, `}
              {reportData.filters.minAge && `Min Age: ${reportData.filters.minAge}, `}
              {reportData.filters.maxAge && `Max Age: ${reportData.filters.maxAge}`}
            </p>
            <p><strong>Total Patients Found:</strong> {reportData.count}</p>

            <table>
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Medical History</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((row, idx) => {
                  const age = row.patientBirthdate
                    ? new Date().getFullYear() - new Date(row.patientBirthdate).getFullYear()
                    : "-";
                
                  return (
                    <tr key={idx}>
                      <td>{row.patientName}</td>
                      <td>{row.email}</td>
                      <td>{row.phone}</td>
                      <td>{row.gender}</td>
                      <td>{age}</td>
                      <td>{row.medHistory}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );

      case "appointmentsByDate":
        return (
          <div className="report-section">
            <h3>{reportData.query}</h3>
            <p><strong>Date Range:</strong> {reportData.filters.startDate} to {reportData.filters.endDate}</p>
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
                    <td>{row.appointmentDate.split("T")[0]}</td>
                    <td>{row.appointmentTime}</td>
                    <td>{row.patientName}</td>
                    <td>{row.doctorName || "-"}</td>
                    <td>{row.appointmentStatus}</td>
                    <td>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "outstandingInvoices":
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
                    <td>{row.dateIssued.split("T")[0]}</td>
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

      case "doctorWorkload":
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
                    <td>{row.specialization || "-"}</td>
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
        return <div className="report-section" style={{ marginTop: "1rem" }}>No report data available.</div>;
    }
  };

  const handleRangeSelect = (range) => {
    setSelectedRange(range);

    const today = new Date();
    let start, end;

    switch (range) {
      case "last7":
        end = today;
        start = new Date();
        start.setDate(start.getDate() - 6);
        break;

      case "thisMonth":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;

      case "lastMonth":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;

      case "thisYear":
        start = new Date(today.getFullYear(), 0, 1);
        end = today;
        break;

      default:
        return;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }

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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          
          {/* APPOINTMENT STATISTICS REPORT */}
          <div className="card">
            <h4>REPORT 1: Appointment Statistics</h4>
            <p>Summary of doctor appointments, completion rate, and status</p>
            {/* Open modal */}
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
              style={{ marginBottom: "1.5rem" }}
            > Generate Report</button>

            {/* Report output */}
            {loading && <p>Loading...</p>}

            {/* Modal popup */}
            {showModal && (
              <div
                className="modal-overlay"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0, 0, 0, 0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  className="modal-content"
                  style={{
                    background: "#fff",
                    padding: "2rem",
                    borderRadius: "10px",
                    width: "450px",
                  }}
                >
                  <h3>Appointment Statistics Report Filters</h3>

                  {/* Filters */}
                  <div className="form-group">
                    <label>Filter by Doctor</label>
                    <select
                      className="form-control"
                      value={filterEmployee}
                      onChange={(e) => setFilterEmployee(e.target.value)}
                    >
                      {/*<option value="">All</option>*/}
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date Range (optional)</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {[
                        { label: "Last 7 days", value: "last7" },
                        { label: "This Month", value: "thisMonth" },
                        { label: "Last Month", value: "lastMonth" },
                        { label: "This Year", value: "thisYear" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={`btn ${selectedRange === item.value ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => handleRangeSelect(item.value)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div
                    style={{
                      marginTop: "1.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowModal(false)}
                      style={{ marginRight: "0.5rem", height: "3rem" }}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => generateReport("appointmentStats")}
                      style={{ height: "3rem" }}
                    >
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/*activeReport === "appointmentStats" && !loading && renderReportData()*/}
          </div>

          {/* REVENUE REPORT */}
          <div className="card">
            <h4>REPORT 2: Revenue by Month</h4>
            <p>Monthly revenue analysis with payment breakdown</p>
            <button 
              onClick={() => generateReport("revenue")}
              className="btn btn-primary"
              disabled={loading}
            >
              Generate Report
            </button>

            {/*activeReport === "revenue" && !loading && renderReportData()*/}
          </div>

          {/* EMPLOYEE PERFORMANCE REPORT */}
          <div className="card">
            <h4>REPORT 3: Employee Performance</h4>
            <p>Staff performance metrics and completion rates</p>
            <button 
              onClick={() => generateReport("employeePerformance")}
              className="btn btn-primary"
              disabled={loading}
            >
              Generate Report
            </button>

            {/*activeReport === "employeePerformance" && !loading && renderReportData()*/}
          </div>

          {/* Patient Demographics Report */}
          <div className="card">
            <h4>REPORT 4: Patient Demographics</h4>
            <p>Patient demographics by gender and age group</p>
            <button 
              onClick={() => generateReport("patientDemographics")}
              className="btn btn-primary"
              disabled={loading}
            >
              Generate Report
            </button>

            {/*activeReport === "patientDemographics" && !loading && renderReportData()*/}
          </div>
        </div>

        <div className="card-header">Data Queries</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
          {/* PATIENTS QUERY */}
          <div className="card">
            <h4>QUERY 1: Patients</h4>
            <p>Find patients within parameters</p>
            <div className="form-group mb-2">
              <label>Gender</label>
              <select
                className="form-control"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group mb-2">
              <label>Age Range</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Min Age"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange({ ...ageRange, min: e.target.value })}
                />
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  placeholder="Max Age"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange({ ...ageRange, max: e.target.value })}
                />
              </div>
            </div>
            <button 
              onClick={() => generateReport("patientsByCondition")}
              className="btn btn-success"
              disabled={loading}
            >
              Search
            </button>
          </div>

          {/* APPOINTMENTS QUERY */}
          <div className="card">
            <h4>QUERY 2: Appointments</h4>
            <p>View appointments by filter</p>

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

            <div className="form-group">
              <label>Doctor</label>
              <select
                className="form-control"
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
              >
                {/*<option value="">All</option>*/}
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                className="form-control"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="No-Show">No-Show</option>
              </select>
            </div>

            <button 
              onClick={() => generateReport("appointmentsByDate")}
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
              onClick={() => generateReport("outstandingInvoices")}
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
              onClick={() => generateReport("doctorWorkload")}
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
          <div ref={resultsRef} style={{ marginTop: "2rem" }}>
            {renderReportData()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
