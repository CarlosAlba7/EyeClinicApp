import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAlertsAPI } from '../services/api';

const DoctorAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await doctorAlertsAPI.getMyAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleMarkAsRead = async (alertID) => {
    try {
      await doctorAlertsAPI.markAsRead(alertID);
      showMessage('success', 'Alert marked as read');
      fetchAlerts();
    } catch (error) {
      showMessage('error', 'Failed to mark alert as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await doctorAlertsAPI.markAllAsRead();
      showMessage('success', 'All alerts marked as read');
      fetchAlerts();
    } catch (error) {
      showMessage('error', 'Failed to mark all alerts as read');
    }
  };

  const handleDelete = async (alertID) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      await doctorAlertsAPI.deleteAlert(alertID);
      showMessage('success', 'Alert deleted');
      fetchAlerts();
    } catch (error) {
      showMessage('error', 'Failed to delete alert');
    }
  };

  const handleGoToAppointment = (apptID) => {
    navigate(`/appointments?highlight=${apptID}`);
  };

  const getAlertStyle = (alertType) => {
    switch (alertType) {
      case 'EMERGENCY':
        return {
          bg: '#dc3545',
          color: '#fff',
          border: '2px solid #bd2130',
          icon: '🚨',
        };
      case 'URGENT':
        return {
          bg: '#ffc107',
          color: '#000',
          border: '2px solid #e0a800',
          icon: '⚠️',
        };
      default:
        return {
          bg: '#17a2b8',
          color: '#fff',
          border: '2px solid #138496',
          icon: 'ℹ️',
        };
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !alert.isRead;
    if (filterType === 'emergency') return alert.alertType === 'EMERGENCY';
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.isRead).length;
  const emergencyCount = alerts.filter((a) => a.alertType === 'EMERGENCY' && !a.isRead).length;

  if (loading) return <div className="loading">Loading alerts...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>
          Doctor Alerts
          {unreadCount > 0 && (
            <span
              style={{
                marginLeft: '1rem',
                backgroundColor: '#dc3545',
                color: '#fff',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600',
              }}
            >
              {unreadCount} Unread
            </span>
          )}
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
              Mark All as Read
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            Back to Dashboard
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {emergencyCount > 0 && (
        <div
          style={{
            backgroundColor: '#dc3545',
            color: '#fff',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            animation: 'pulse 2s infinite',
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🚨</span>
          <span>You have {emergencyCount} EMERGENCY alert{emergencyCount > 1 ? 's' : ''} requiring immediate attention!</span>
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '600' }}>Filter:</label>
          <select
            className="form-control"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Alerts ({alerts.length})</option>
            <option value="unread">Unread ({unreadCount})</option>
            <option value="emergency">Emergency ({alerts.filter(a => a.alertType === 'EMERGENCY').length})</option>
          </select>
        </div>
      </div>

      {filteredAlerts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
          <h3>No alerts to display</h3>
          <p>
            {filterType === 'unread'
              ? 'You have no unread alerts.'
              : filterType === 'emergency'
              ? 'You have no emergency alerts.'
              : 'All clear! No alerts at this time.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredAlerts.map((alert) => {
            const style = getAlertStyle(alert.alertType);
            return (
              <div
                key={alert.alertID}
                style={{
                  backgroundColor: alert.isRead ? '#f8f9fa' : '#fff',
                  border: alert.isRead ? '1px solid #dee2e6' : style.border,
                  borderLeft: `6px solid ${style.bg}`,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  opacity: alert.isRead ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{style.icon}</span>
                      <span
                        style={{
                          backgroundColor: style.bg,
                          color: style.color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {alert.alertType}
                      </span>
                      {!alert.isRead && (
                        <span
                          style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                          }}
                        >
                          NEW
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '1rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
                      <strong>{alert.alertMessage}</strong>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '0.5rem',
                        fontSize: '0.95rem',
                        color: '#495057',
                      }}
                    >
                      <strong>Patient:</strong>
                      <span>{alert.patientName}</span>

                      <strong>Contact:</strong>
                      <span>
                        {alert.patientPhone} | {alert.patientEmail}
                      </span>

                      <strong>Status:</strong>
                      <span
                        style={{
                          color:
                            alert.appointmentStatus === 'Scheduled'
                              ? '#28a745'
                              : alert.appointmentStatus === 'Completed'
                              ? '#6c757d'
                              : '#dc3545',
                          fontWeight: '600',
                        }}
                      >
                        {alert.appointmentStatus}
                      </span>

                      <strong>Created:</strong>
                      <span>{new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleGoToAppointment(alert.apptID)}
                      className="btn btn-sm btn-primary"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      View Appointment
                    </button>
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert.alertID)}
                        className="btn btn-sm btn-success"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(alert.alertID)}
                      className="btn btn-sm btn-danger"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
};

export default DoctorAlerts;
