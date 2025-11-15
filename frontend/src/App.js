import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import LandingPage from "./components/LandingPage";
import PatientSignup from "./components/PatientSignup";
import Login from './components/Login';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import Employees from './components/Employees';
import Invoices from './components/Invoices';
import Reports from './components/Reports';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        {user && <Navigation user={user} setUser={setUser} />}

        
        <Routes>
          <Route 
            path="/landingpage"
            element={<LandingPage />}
          />

          <Route 
            path="/signup"
            element={<PatientSignup />}
          />
              
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />} 
          />
          
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/patients" 
            element={user ? <Patients user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/appointments" 
            element={user ? <Appointments user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/employees" 
            element={user ? <Employees user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/invoices" 
            element={user ? <Invoices user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/reports" 
            element={user ? <Reports user={user} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/landingpage"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
