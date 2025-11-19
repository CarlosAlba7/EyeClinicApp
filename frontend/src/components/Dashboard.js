import React, { useState, useEffect } from "react";
import {
  patientAPI,
  appointmentAPI,
  employeeAPI,
  invoiceAPI,
} from "../services/api";

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    totalEmployees: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [patients, appointments, todayAppts, employees, invoices] =
        await Promise.all([
          patientAPI.getAll(),
          appointmentAPI.getAll(),
          appointmentAPI.getAll({ date: today }),
          employeeAPI.getAll(),
          invoiceAPI.getAll({ status: "Pending" }),
        ]);

      setStats({
        totalPatients: patients.data.length,
        totalAppointments: appointments.data.length,
        todayAppointments: todayAppts.data.length,
        totalEmployees: employees.data.length,
        pendingInvoices: invoices.data.length,
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
          {(user.employeeType === "Admin" ||
            user.employeeType === "Receptionist") && (
            <a href="/invoices" className="btn btn-warning">
              View Invoices
            </a>
          )}
          <a href="/reports" className="btn btn-secondary">
            Generate Reports
          </a>
          <a href="/shop" className="btn btn-primary">
            Shop
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
