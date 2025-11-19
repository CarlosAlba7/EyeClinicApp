import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const handleHome = () => {
    // Navigate to the appropriate dashboard based on user role
    if (user?.role === 'Patient') {
      navigate('/patient-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">Eye Clinic System</span>

      <div className="navbar-user">
        <button
          onClick={handleHome}
          className="btn-home"
          style={{
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            marginRight: '0.5rem',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
          Home
        </button>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

