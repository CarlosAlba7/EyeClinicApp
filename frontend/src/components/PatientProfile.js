import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://eyeclinic-backend.vercel.app/api'
  : 'http://localhost:5000/api';

const PatientProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    middleInit: '',
    lastName: '',
    email: '',
    phone: '',
    patientAddress: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = response.data;
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        middleInit: data.middleInit || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        patientAddress: data.patientAddress || '',
      });
    } catch (error) {
      showMessage('error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // We need to get the patientID first
      await axios.put(
        `${API_BASE_URL}/patients/${profile.patientID}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage('success', 'Profile updated successfully!');
      setEditing(false);
      fetchProfile();
      
      // Update localStorage user info
      const storedUser = JSON.parse(localStorage.getItem('user'));
      storedUser.firstName = formData.firstName;
      storedUser.lastName = formData.lastName;
      storedUser.email = formData.email;
      localStorage.setItem('user', JSON.stringify(storedUser));
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;
  if (!profile) return <div className="loading">Profile not found</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Profile</h1>
        <button onClick={() => navigate('/patient-dashboard')} className="btn btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <div className="card">
        {!editing ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Profile Information</h2>
              <button onClick={() => setEditing(true)} className="btn btn-warning">
                Edit Profile
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <label style={{ fontWeight: '600', color: '#7f8c8d', display: 'block', marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  {profile.firstName} {profile.middleInit && `${profile.middleInit}.`} {profile.lastName}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: '600', color: '#7f8c8d', display: 'block', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  {profile.email}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: '600', color: '#7f8c8d', display: 'block', marginBottom: '0.5rem' }}>
                  Phone
                </label>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  {profile.phone || 'Not provided'}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: '600', color: '#7f8c8d', display: 'block', marginBottom: '0.5rem' }}>
                  Gender
                </label>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  {profile.gender || 'Not provided'}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: '600', color: '#7f8c8d', display: 'block', marginBottom: '0.5rem' }}>
                  Date of Birth
                </label>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  {profile.patientBirthdate ? new Date(profile.patientBirthdate).toLocaleDateString() : 'Not provided'}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: '600', color: '#7f8c8d', display: 'block', marginBottom: '0.5rem' }}>
                  Address
                </label>
                <p style={{ margin: 0, fontSize: '1.1rem' }}>
                  {profile.patientAddress || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Profile</h2>

            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                className="form-control"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Middle Initial</label>
              <input
                type="text"
                name="middleInit"
                className="form-control"
                maxLength="1"
                value={formData.middleInit}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="form-control"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* READ-ONLY FIELDS */}
            <div className="form-group">
              <label>Gender (Cannot be changed)</label>
              <input
                type="text"
                className="form-control"
                value={profile.gender || 'Not set'}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label>Date of Birth (Cannot be changed)</label>
              <input
                type="text"
                className="form-control"
                value={profile.patientBirthdate ? new Date(profile.patientBirthdate).toLocaleDateString() : 'Not set'}
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="patientAddress"
                className="form-control"
                value={formData.patientAddress}
                onChange={handleInputChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PatientProfile;
