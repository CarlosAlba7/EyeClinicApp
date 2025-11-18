import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://eyeclinic-backend.vercel.app/api'
  : 'http://localhost:5000/api';

const ViewDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
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
      setMessage({ type: 'error', text: 'Failed to load doctors' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading doctors...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Our Doctors</h1>
        <button onClick={() => navigate('/patient-dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {doctors.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            No doctors available at the moment.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginTop: '1rem'
        }}>
          {doctors.map((doctor) => (
            <div key={doctor.employeeID} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                margin: '0 auto 1rem'
              }}>
                {doctor.firstName.charAt(0)}{doctor.lastName.charAt(0)}
              </div>
              
              <h3 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#2c3e50' }}>
                Dr. {doctor.firstName} {doctor.lastName}
              </h3>
              
              <p style={{ 
                textAlign: 'center', 
                color: '#667eea', 
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                {doctor.specialization || 'General Ophthalmologist'}
              </p>

              <div style={{ 
                borderTop: '1px solid #ecf0f1', 
                paddingTop: '1rem',
                fontSize: '0.9rem',
                color: '#7f8c8d'
              }}>
                {doctor.yearsExperience && (
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Experience:</strong> {doctor.yearsExperience} years
                  </p>
                )}
                
                {doctor.email && (
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Email:</strong> {doctor.email}
                  </p>
                )}
                
                {doctor.phone && (
                  <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Phone:</strong> {doctor.phone}
                  </p>
                )}
              </div>

              <button 
                onClick={() => navigate('/book')}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewDoctors;