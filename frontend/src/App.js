import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

import LandingPage from "./components/LandingPage";
import PatientSignup from "./components/PatientSignup";
import Login from "./components/Login";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import Patients from "./components/Patients";
import Appointments from "./components/Appointments";
import Employees from "./components/Employees";
import Invoices from "./components/Invoices";
import Reports from "./components/Reports";
import PatientDashboard from "./components/PatientDashboard";
import BookAppointment from "./components/BookAppointment";
import MyAppointments from "./components/MyAppointments";
import ViewDoctors from "./components/ViewDoctors";
import PatientProfile from "./components/PatientProfile";
import Shop from "./components/Shop";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ShopManagement from "./components/ShopManagement";
import DoctorAlerts from "./components/DoctorAlerts";

const getRole = (user) => user?.role || user?.employeeType;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      let parsed = JSON.parse(storedUser);

      if (!parsed.role && parsed.employeeType) {
        parsed.role = parsed.employeeType;
      }

      setUser(parsed);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const role = getRole(user);
  
  return (
    <Router>
      <div className="app">
        {user && <Navigation user={user} setUser={setUser} />}

        <Routes>
          {/* Public Routes */}
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/signup" element={<PatientSignup />} />

          {/* Login Redirect Logic */}
          <Route
            path="/login"
            element={
              user ? (
                user.role === "Patient" ? (
                  <Navigate to="/patient-dashboard" />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <Login setUser={setUser} />
              )
            }
          />

          {/* Admin/Employee Dashboard */}
          <Route
            path="/dashboard"
            element={
              user && user.role !== "Patient" ? (
                <Dashboard user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Patient Dashboard */}
          <Route
            path="/patient-dashboard"
            element={
              user && user.role === "Patient" ? (
                <PatientDashboard user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Patient Portal Routes */}
          <Route
            path="/book"
            element={
              user && user.role === "Patient" ? (
                <BookAppointment user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/patient-appointments"
            element={
              user && user.role === "Patient" ? (
                <MyAppointments user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/view-doctors"
            element={
              user && user.role === "Patient" ? (
                <ViewDoctors user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/patient-profile"
            element={
              user && user.role === "Patient" ? (
                <PatientProfile user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Admin/Staff Features */}
          <Route
            path="/patients"
            element={user ? <Patients user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/appointments"
            element={
              user ? <Appointments user={user} /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/employees"
            element={
              user ? <Employees user={user} /> : <Navigate to="/login" />
            }
          />

          <Route
            path="/invoices"
            element={user ? <Invoices user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/reports"
            element={user ? <Reports user={user} /> : <Navigate to="/login" />}
          />

          {/* Doctor Alerts Route */}
          <Route
            path="/doctor-alerts"
            element={
              user && (user.employeeType === "Doctor" || user.employeeType === "Admin") ? (
                <DoctorAlerts user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* Shop Routes */}
          <Route
            path="/shop"
            element={user ? <Shop user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/cart"
            element={user ? <Cart user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/checkout"
            element={user ? <Checkout user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/shop-management"
            element={
              user && (user.role === "Receptionist" || user.role === "Admin") ? (
                <ShopManagement user={user} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* HOME (root) */}
          <Route
            path="/"
            element={
              user ? (
                user.role === "Patient" ? (
                  <Navigate to="/patient-dashboard" />
                ) : (
                  <Navigate to="/dashboard" />
                )
              ) : (
                <LandingPage />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;