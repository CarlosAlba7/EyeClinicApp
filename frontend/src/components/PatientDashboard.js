import React, { useEffect, useState } from "react";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./PatientDashboard.css";

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      try {
        // FIX: backend only has /auth/me
        const res = await authAPI.getCurrentUser();
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to load patient data:", err);
        navigate("/login");
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  if (loading) return <div className="patient-loading">Loading...</div>;
  if (!profile) return <div className="patient-loading">No profile found</div>;

  return (
    <div className="patient-dashboard">
      <section className="patient-hero">
        <div>
          <h1>
            Welcome back, <span>{profile.firstName}</span>!
          </h1>
          <p>Your personalized eye-care portal</p>
        </div>
      </section>

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

      <section className="patient-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate("/book")}>📅 Book Appointment</button>
          <button onClick={() => navigate("/patient-appointments")}>📖 My Appointments</button>
          <button onClick={() => navigate("/view-doctors")}>👨‍⚕️ View Doctors</button>
          <button onClick={() => navigate("/patient-edit-profile")}>✏️ Edit Profile</button>
        </div>
      </section>
    </div>
  );
}
