import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        Eye Clinic System
      </Link>
      <div className="navbar-menu">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/patients">Patients</Link>
        <Link to="/appointments">Appointments</Link>
        {(user?.employeeType === 'Admin' || user?.employeeType === 'Receptionist') && (
          <Link to="/invoices">Invoices</Link>
        )}
        {user?.employeeType === 'Admin' && (
          <Link to="/employees">Employees</Link>
        )}
        <Link to="/reports">Reports</Link>
      </div>
      <div className="navbar-user">
        <span>
          {user?.firstName} {user?.lastName} ({user?.employeeType})
        </span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
