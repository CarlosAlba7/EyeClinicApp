import React, { useState, useEffect } from "react";
import {
  patientAPI,
  appointmentAPI,
  employeeAPI,
  invoiceAPI,
  doctorAlertsAPI,
  shopAPI,
} from "../services/api";

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalEmployees: 0,
    pendingInvoices: 0,
    unreadAlerts: 0,
    lowStockAlerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Fetch alerts count only for doctors and admins
      const isDoctor = user.employeeType === 'Doctor' || user.employeeType === 'Admin';
      const isReceptionist = user.employeeType === 'Receptionist' || user.employeeType === 'Admin';

      const promises = [
        patientAPI.getAll(),
        appointmentAPI.getAll(),
        appointmentAPI.getAll({ date: today }),
        employeeAPI.getAll(),
        invoiceAPI.getAll({ status: "Pending" }),
      ];

      if (isDoctor) {
        promises.push(doctorAlertsAPI.getUnreadCount());
      }

      if (isReceptionist) {
        promises.push(shopAPI.getLowStockNotifications());
      }

      const results = await Promise.all(promises);

      let lowStockCount = 0;
      let unreadAlertsCount = 0;
      let patients, appointments, todayAppts, employees, invoices;

      if (isDoctor && isReceptionist) {
        // Admin case - has both doctor alerts and low stock alerts
        [patients, appointments, todayAppts, employees, invoices] = results;
        const alertsData = results[5];
        const lowStockData = results[6];
        unreadAlertsCount = alertsData ? alertsData.data.unreadCount : 0;
        lowStockCount = lowStockData ? lowStockData.data.length : 0;
      } else if (isDoctor) {
        // Doctor only
        [patients, appointments, todayAppts, employees, invoices] = results;
        const alertsData = results[5];
        unreadAlertsCount = alertsData ? alertsData.data.unreadCount : 0;
      } else if (isReceptionist) {
        // Receptionist only
        [patients, appointments, todayAppts, employees, invoices] = results;
        const lowStockData = results[5];
        lowStockCount = lowStockData ? lowStockData.data.length : 0;
      } else {
        // Other roles
        [patients, appointments, todayAppts, employees, invoices] = results;
      }

      setStats({
        totalPatients: patients.data.length,
        totalAppointments: appointments.data.length,
        todayAppointments: todayAppts.data.length,
        totalEmployees: employees.data.length,
        pendingInvoices: invoices.data.length,
        unreadAlerts: unreadAlertsCount,
        lowStockAlerts: lowStockCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="card">
        <h3>
          Welcome, {user.firstName} {user.lastName}!
        </h3>
        <p>Role: {user.employeeType || user.role}</p>
      </div>

      <div className="dashboard-grid">
        <div
          className="dashboard-card"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
        >
          <h3>{stats.totalPatients}</h3>
          <p>Total Patients</p>
        </div>

        <div
          className="dashboard-card"
          style={{
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          }}
        >
          <h3>{stats.totalAppointments}</h3>
          <p>Total Appointments</p>
        </div>

        <div
          className="dashboard-card"
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          }}
        >
          <h3>{stats.todayAppointments}</h3>
          <p>Today's Appointments</p>
        </div>

        {user.employeeType === "Admin" && (
          <div
            className="dashboard-card"
            style={{
              background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            }}
          >
            <h3>{stats.totalEmployees}</h3>
            <p>Total Employees</p>
          </div>
        )}

        {(user.employeeType === "Admin" ||
          user.employeeType === "Receptionist") && (
          <div
            className="dashboard-card"
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            }}
          >
            <h3>{stats.pendingInvoices}</h3>
            <p>Pending Invoices</p>
          </div>
        )}

        {(user.employeeType === "Doctor") && (
          <div
            className="dashboard-card"
            style={{
              background: stats.unreadAlerts > 0
                ? "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)"
                : "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
              cursor: "pointer",
              position: "relative",
              animation: stats.unreadAlerts > 0 ? "pulse 2s infinite" : "none",
            }}
            onClick={() => (window.location.href = "/doctor-alerts")}
          >
            {stats.unreadAlerts > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "2rem",
                }}
              >
                🚨
              </div>
            )}
            <h3>{stats.unreadAlerts}</h3>
            <p>{stats.unreadAlerts > 0 ? "Unread Alerts!" : "No Alerts"}</p>
          </div>
        )}

        {(user.employeeType === "Receptionist" || user.employeeType === "Admin") && (
          <div
            className="dashboard-card"
            style={{
              background: stats.lowStockAlerts > 0
                ? "linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)"
                : "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
              cursor: "pointer",
              position: "relative",
              animation: stats.lowStockAlerts > 0 ? "pulse 2s infinite" : "none",
            }}
            onClick={() => (window.location.href = "/shop-management")}
          >
            {stats.lowStockAlerts > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  fontSize: "2rem",
                }}
              >
                📦
              </div>
            )}
            <h3>{stats.lowStockAlerts}</h3>
            <p>{stats.lowStockAlerts > 0 ? "Low Stock Items!" : "Stock OK"}</p>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">Quick Actions</div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <a href="/patients" className="btn btn-primary">
            View Patients
          </a>
          <a href="/appointments" className="btn btn-success">
            Manage Appointments
          </a>
          {(user.employeeType === "Doctor") && (
            <a
              href="/doctor-alerts"
              className={`btn ${stats.unreadAlerts > 0 ? "btn-danger" : "btn-info"}`}
              style={{
                position: "relative",
                fontWeight: stats.unreadAlerts > 0 ? "700" : "normal",
              }}
            >
              {stats.unreadAlerts > 0 ? "🚨 " : ""}
              View Alerts
              {stats.unreadAlerts > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "#fff",
                    color: "#dc3545",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    border: "2px solid #dc3545",
                  }}
                >
                  {stats.unreadAlerts}
                </span>
              )}
            </a>
          )}
          {(user.employeeType === "Receptionist" || user.employeeType === "Admin") && (
            <a
              href="/shop-management"
              className={`btn ${stats.lowStockAlerts > 0 ? "btn-danger" : "btn-info"}`}
              style={{
                position: "relative",
                fontWeight: stats.lowStockAlerts > 0 ? "700" : "normal",
              }}
            >
              {stats.lowStockAlerts > 0 ? "📦 " : ""}
              View Stock Alerts
              {stats.lowStockAlerts > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    backgroundColor: "#fff",
                    color: "#dc3545",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "700",
                    border: "2px solid #dc3545",
                  }}
                >
                  {stats.lowStockAlerts}
                </span>
              )}
            </a>
          )}
          {user.employeeType === "Admin" && (
            <>
              <a href="/reports" className="btn btn-secondary">
                Generate Reports
              </a>
              <a href="/employee-management" className="btn btn-info">
                Manage Employees
              </a>
            </>
          )}
          <a href="/shop" className="btn btn-primary">
            Shop
          </a>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.02);
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
