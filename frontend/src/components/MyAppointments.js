import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://eyeclinic-backend.vercel.app/api'
  : 'http://localhost:5000/api';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/patient-appointments/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
    } catch (error) {
      showMessage('error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleCancel = async (apptID) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/patient-appointments/cancel/${apptID}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showMessage('success', 'Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      showMessage('error', 'Failed to cancel appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return { bg: '#d1ecf1', color: '#0c5460' };
      case 'Completed':
        return { bg: '#d4edda', color: '#155724' };
      case 'Cancelled':
        return { bg: '#f8d7da', color: '#721c24' };
      case 'No-Show':
        return { bg: '#fff3cd', color: '#856404' };
      default:
        return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  if (loading) return <div className="loading">Loading appointments...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Appointments</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/book')} className="btn btn-primary">
            Book New Appointment
          </button>
          <button onClick={() => navigate('/patient-dashboard')} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {appointments.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            You have no appointments scheduled. 
            <button 
              onClick={() => navigate('/book')} 
              className="btn btn-primary"
              style={{ marginLeft: '1rem' }}
            >
              Book your first appointment
            </button>
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Appointment ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => {
                const statusStyle = getStatusColor(appt.appointmentStatus);
                return (
                  <tr key={appt.apptID}>
                    <td>{appt.apptID}</td>
                    <td>{new Date(appt.appointmentDate).toLocaleDateString()}</td>
                    <td>{appt.appointmentTime}</td>
                    <td>{appt.doctorName || 'Not Assigned'}</td>
                    <td>{appt.reason || '-'}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          fontWeight: '500',
                        }}
                      >
                        {appt.appointmentStatus}
                      </span>
                    </td>
                    <td>
                      {appt.appointmentStatus === 'Scheduled' && (
                        <button
                          onClick={() => handleCancel(appt.apptID)}
                          className="btn btn-sm btn-danger"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;