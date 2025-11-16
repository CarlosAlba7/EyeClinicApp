import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">
          <h2 className="logo">EyeClinic</h2>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button
            className="nav-btn-outline"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>Clear Vision, Better Life</h1>
          <p>
            Expert eye care, modern technology, and compassionate professionals
            dedicated to your vision.
          </p>

          <div className="hero-buttons">
            <button className="btn primary" onClick={() => navigate("/login")}>
              Login
            </button>
            <button
              className="btn secondary"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* FLOATING CTA BUTTON */}
      <button className="floating-cta" onClick={() => navigate("/login")}>
        Book Appointment
      </button>

      {/* SERVICES SECTION */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-grid">
          <div className="service-card fade-in">
            <i className="fas fa-calendar-check"></i>
            <h3>Easy Appointments</h3>
            <p>Schedule consultations with specialists quickly and easily.</p>
          </div>
          <div className="service-card fade-in delay-1">
            <i className="fas fa-user-md"></i>
            <h3>Expert Doctors</h3>
            <p>Meet licensed ophthalmologists with years of experience.</p>
          </div>
          <div className="service-card fade-in delay-2">
            <i className="fas fa-eye"></i>
            <h3>Vision Care</h3>
            <p>
              Comprehensive exams, diagnosis, treatment, and eye health
              monitoring.
            </p>
          </div>
        </div>
      </section>

      {/* MEET OUR DOCTORS */}
      <section className="doctors">
        <h2>Meet Our Specialists</h2>
        <div className="doctor-grid">
          <div className="doctor-card fade-up">
            <img
              src="https://images.unsplash.com/photo-1584466990375-7a0fabf76daa?auto=format&fit=crop&w=600&q=60"
              alt="doctor"
            />
            <h3>Dr. Sarah Thompson</h3>
            <p>Senior Ophthalmologist</p>
          </div>

          <div className="doctor-card fade-up delay-1">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=60"
              alt="doctor"
            />
            <h3>Dr. Michael Reyes</h3>
            <p>Eye Surgeon</p>
          </div>

          <div className="doctor-card fade-up delay-2">
            <img
              src="https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=60"
              alt="doctor"
            />
            <h3>Dr. Lisa Carter</h3>
            <p>Pediatric Eye Specialist</p>
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
