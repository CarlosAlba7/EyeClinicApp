import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">EyeClinic Vision Center</h1>
          <p className="hero-subtitle">
            Providing compassionate, high-quality eye care to help you see life
            clearly.
          </p>

          <div className="hero-buttons">
            <button className="btn primary" onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className="btn secondary"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="hero-image"></div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features">
        <h2>Our Services</h2>

        <div className="feature-grid">
          <div className="feature-card">
            <i className="fas fa-calendar-check feature-icon"></i>
            <h3>Easy Appointments</h3>
            <p>Book appointments with our specialists in seconds.</p>
          </div>

          <div className="feature-card">
            <i className="fas fa-user-md feature-icon"></i>
            <h3>Qualified Doctors</h3>
            <p>Meet experienced ophthalmologists and eye specialists.</p>
          </div>

          <div className="feature-card">
            <i className="fas fa-eye feature-icon"></i>
            <h3>Patient-Centered Care</h3>
            <p>
              We prioritize your comfort, clarity, and long-term vision health.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} EyeClinic Vision Center. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
