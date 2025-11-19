import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./PatientDashboard.css";

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://eyeclinic-backend.vercel.app/api'
  : 'http://localhost:5000/api';

export default function PatientDashboard() {
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('token');
        
        // Load profile
        const profileRes = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(profileRes.data);

        // Load appointments
        const apptsRes = await axios.get(`${API_BASE_URL}/patient-appointments/my`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAppointments(apptsRes.data);
      } catch (err) {
        console.error("Failed to load patient data:", err);
        if (err.response?.status === 401) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  if (loading) return <div className="patient-loading">Loading...</div>;
  if (!profile) return <div className="patient-loading">No profile found</div>;

  // Calculate statistics
  const upcomingAppointments = appointments.filter(
    appt => appt.appointmentStatus === 'Scheduled' && 
    new Date(appt.appointmentDate) >= new Date()
  ).length;

  const completedAppointments = appointments.filter(
    appt => appt.appointmentStatus === 'Completed'
  ).length;

  // Get most recent doctor from appointments
  const recentDoctor = appointments.length > 0 && appointments[0].doctorName 
    ? appointments[0].doctorName 
    : 'None';

  // Get next upcoming appointment
  const nextAppointment = appointments
    .filter(appt => 
      appt.appointmentStatus === 'Scheduled' && 
      new Date(appt.appointmentDate) >= new Date()
    )
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];

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

      {/* Next Appointment Alert */}
      {nextAppointment && (
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>📅 Next Appointment:</strong> {' '}
            {new Date(nextAppointment.appointmentDate).toLocaleDateString()} at {nextAppointment.appointmentTime}
            {nextAppointment.doctorName && ` with ${nextAppointment.doctorName}`}
          </div>
          <button 
            onClick={() => navigate('/patient-appointments')}
            className="btn btn-sm btn-warning"
          >
            View Details
          </button>
        </div>
      )}

      <section className="patient-stats">
        <div className="stat-card">
          <h2>{upcomingAppointments}</h2>
          <p>Upcoming Appointments</p>
        </div>
        <div className="stat-card">
          <h2>{completedAppointments}</h2>
          <p>Completed Appointments</p>
        </div>
        <div className="stat-card">
          <h2>{recentDoctor}</h2>
          <p>Recent Doctor</p>
        </div>
      </section>

      <section className="patient-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate("/book")}>📅 Book Appointment</button>
          <button onClick={() => navigate("/patient-appointments")}>📖 My Appointments</button>
          <button onClick={() => navigate("/view-doctors")}>👨‍⚕️ View Doctors</button>
          <button onClick={() => navigate("/shop")}>🛒 Shop</button>
          <button onClick={() => navigate("/patient-profile")}>✏️ Edit Profile</button>
        </div>
      </section>

      {/* Recent Appointments Section */}
      {appointments.length > 0 && (
        <section style={{ marginTop: '2rem' }}>
          <h2>Recent Appointments</h2>
          <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '1.5rem',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.05)'
          }}>
            {appointments.slice(0, 3).map((appt) => (
              <div key={appt.apptID} style={{
                borderBottom: '1px solid #ecf0f1',
                padding: '1rem 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{new Date(appt.appointmentDate).toLocaleDateString()}</strong> at {appt.appointmentTime}
                  <br />
                  <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                    {appt.doctorName || 'Doctor TBD'} - {appt.reason}
                  </span>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  background: appt.appointmentStatus === 'Scheduled' ? '#d1ecf1' :
                             appt.appointmentStatus === 'Completed' ? '#d4edda' : '#f8d7da',
                  color: appt.appointmentStatus === 'Scheduled' ? '#0c5460' :
                         appt.appointmentStatus === 'Completed' ? '#155724' : '#721c24'
                }}>
                  {appt.appointmentStatus}
                </span>
              </div>
            ))}
            {appointments.length > 3 && (
              <button 
                onClick={() => navigate('/patient-appointments')}
                style={{
                  marginTop: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#3a7bd5',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                View all appointments →
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
