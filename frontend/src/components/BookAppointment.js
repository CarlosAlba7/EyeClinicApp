import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://eyeclinic-backend.vercel.app/api'
  : 'http://localhost:5000/api';

const BookAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    employeeID: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    appointmentType: 'Normal',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/employees`, {
        params: { type: 'Doctor' },
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data);
    } catch (error) {
      showMessage('error', 'Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${API_BASE_URL}/patient-appointments/book`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage('success', 'Appointment booked successfully!');
      
      // Reset form
      setFormData({
        employeeID: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        appointmentType: 'Normal',
      });

      // Redirect after 2 seconds
      setTimeout(() => navigate('/patient-appointments'), 2000);
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to book appointment');
    }
  };

  if (loading) return <div className="loading">Loading doctors...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Book Appointment</h1>
        <button onClick={() => navigate('/patient-dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Doctor <span class="required-star">*</span></label>
            <select
              name="employeeID"
              className="form-control"
              value={formData.employeeID}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose a doctor...</option>
              {doctors.map((doctor) => (
                <option key={doctor.employeeID} value={doctor.employeeID}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization || 'General'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Appointment Date <span class="required-star">*</span></label>
            <input
              type="date"
              name="appointmentDate"
              className="form-control"
              value={formData.appointmentDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label>Appointment Time <span class="required-star">*</span></label>
            <input
              type="time"
              name="appointmentTime"
              className="form-control"
              value={formData.appointmentTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Appointment Type <span class="required-star">*</span></label>
            <select
              name="appointmentType"
              className="form-control"
              value={formData.appointmentType}
              onChange={handleInputChange}
              required
            >
              <option value="Normal">Normal Appointment</option>
              <option value="Checkup">Regular Checkup</option>
              <option value="Emergency">Emergency</option>
            </select>
            {formData.appointmentType === 'Emergency' && (
              <small style={{ color: '#dc3545', display: 'block', marginTop: '0.5rem' }}>
                ⚠️ Emergency appointments will be prioritized and your assigned doctor will be immediately notified.
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Reason for Visit <span class="required-star">*</span></label>
            <textarea
              name="reason"
              className="form-control"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Describe your symptoms or reason for visit..."
              rows="4"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              className={`btn ${formData.appointmentType === 'Emergency' ? 'btn-danger' : 'btn-primary'}`}
            >
              {formData.appointmentType === 'Emergency' ? '🚨 Book Emergency Appointment' : 'Book Appointment'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/patient-dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
