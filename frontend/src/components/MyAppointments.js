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
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: '', message: '', onConfirm: null });
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

  const handleCancel = (apptID) => {
    setConfirmDialog({
      show: true,
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment?',
      onConfirm: async () => {
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
        setConfirmDialog({ show: false, title: '', message: '', onConfirm: null });
      }
    });
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Extract just the date part (YYYY-MM-DD) and format it
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
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
                <th>Type</th>
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
                    <td>{formatDate(appt.appointmentDate)}</td>
                    <td>{appt.appointmentTime}</td>
                    <td>{appt.doctorName || 'Not Assigned'}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          backgroundColor:
                            appt.appointmentType === 'Emergency' ? '#dc3545' :
                            appt.appointmentType === 'Checkup' ? '#17a2b8' : '#6c757d',
                          color: '#fff',
                          fontWeight: appt.appointmentType === 'Emergency' ? '700' : '500',
                        }}
                      >
                        {appt.appointmentType === 'Emergency' && '🚨 '}
                        {appt.appointmentType || 'Normal'}
                      </span>
                    </td>
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
                      {appt.appointmentStatus === 'Completed' && (
                        <button
                          onClick={() => handleViewDetails(appt)}
                          className="btn btn-sm btn-primary"
                        >
                          View Details
                        </button>
                      )}
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

      {showDetailsModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Appointment Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="btn-close">×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50' }}>
                  Appointment Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                  <strong>Date:</strong>
                  <span>{formatDate(selectedAppointment.appointmentDate)}</span>

                  <strong>Time:</strong>
                  <span>{selectedAppointment.appointmentTime}</span>

                  <strong>Doctor:</strong>
                  <span>{selectedAppointment.doctorName || 'Not Assigned'}</span>

                  <strong>Type:</strong>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor:
                      selectedAppointment.appointmentType === 'Emergency' ? '#dc3545' :
                      selectedAppointment.appointmentType === 'Checkup' ? '#17a2b8' : '#6c757d',
                    color: '#fff',
                    fontWeight: selectedAppointment.appointmentType === 'Emergency' ? '700' : '500',
                    display: 'inline-block'
                  }}>
                    {selectedAppointment.appointmentType === 'Emergency' && '🚨 '}
                    {selectedAppointment.appointmentType || 'Normal'}
                  </span>

                  <strong>Reason:</strong>
                  <span>{selectedAppointment.reason || '-'}</span>

                  <strong>Status:</strong>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}>
                    {selectedAppointment.appointmentStatus}
                  </span>
                </div>
              </div>

              {selectedAppointment.doctorNotes && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50' }}>
                    Doctor's Notes
                  </h3>
                  <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '1rem',
                    lineHeight: '1.6'
                  }}>
                    {selectedAppointment.doctorNotes}
                  </div>
                </div>
              )}

              {selectedAppointment.requiresSpecialist && (
                <div style={{
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{
                    marginTop: 0,
                    marginBottom: '0.5rem',
                    color: '#856404',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ Specialist Referral Required
                  </h3>
                  <p style={{ margin: 0, color: '#856404' }}>
                    <strong>Recommended Specialist:</strong> {selectedAppointment.specialistType}
                  </p>
                  <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.9rem',
                    color: '#856404'
                  }}>
                    Please contact our office to schedule an appointment with the recommended specialist.
                  </p>
                </div>
              )}

              {!selectedAppointment.doctorNotes && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#7f8c8d',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: 0 }}>
                    No additional notes were recorded for this appointment.
                  </p>
                </div>
              )}

              <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDialog.show && (
        <div className="modal-overlay" onClick={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>{confirmDialog.title}</h2>
              <button onClick={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: null })} className="btn-close">×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>{confirmDialog.message}</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmDialog({ show: false, title: '', message: '', onConfirm: null })}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="btn btn-danger"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;