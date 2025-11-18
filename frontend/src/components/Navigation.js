import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = ({ setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <span className="navbar-brand">Eye Clinic System</span>

      <div className="navbar-user">
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

