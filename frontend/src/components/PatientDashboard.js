import React, { useEffect, useState } from "react";
import { patientPortalAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./PatientDashboard.css";

export default function PatientDashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await patientPortalAPI.getProfile();
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load patient data:", err);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) return <div className="patient-loading">Loading...</div>;

  return (
    <div className="patient-dashboard">
      {/* HERO SECTION */}
      <section className="patient-hero">
        <div>
          <h1>
            Welcome back, <span>{profile.firstName}</span>!
          </h1>
          <p>Your personalized eye-care portal</p>
        </div>
      </section>

      {/* SUMMARY STATS */}
      <section className="patient-stats">
        <div className="stat-card">
          <h2>0</h2>
          <p>Upcoming Appointments</p>
        </div>
        <div className="stat-card">
          <h2>0</h2>
          <p>Completed Appointments</p>
        </div>
        <div className="stat-card">
          <h2>None</h2>
          <p>Assigned Doctor</p>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="patient-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate("/book")}>📅 Book Appointment</button>

          <button onClick={() => navigate("/patient-appointments")}>
            📖 My Appointments
          </button>

          <button onClick={() => navigate("/view-doctors")}>
            👨‍⚕️ View Doctors
          </button>

          <button onClick={() => navigate("/patient-edit-profile")}>
            ✏️ Edit Profile
          </button>
        </div>
      </section>

      {/* DOCTOR GRID */}
      <section className="patient-doctors">
        <h2>Available Doctors</h2>

        <div className="doctor-grid">
          <div className="doctor-card">
            <h3>Dr. John Doctor</h3>
            <p>Ophthalmology</p>
            <button className="book-btn">Book Now</button>
          </div>

          <div className="doctor-card">
            <h3>Dr. Sarah Vision</h3>
            <p>Retina Specialist</p>
            <button className="book-btn">Book Now</button>
          </div>

          <div className="doctor-card">
            <h3>Dr. Emily Focus</h3>
            <p>Cornea Specialist</p>
            <button className="book-btn">Book Now</button>
          </div>
        </div>
      </section>
    </div>
  );
}
