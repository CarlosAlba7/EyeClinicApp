import React, { useState } from "react";
import "./PatientSignup.css";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const PatientSignup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    middleInit: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    patientBirthdate: "",
    patientAddress: "",
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authAPI.signup(formData);
      setMessage("Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Patient Account</h2>
        <p className="subtitle">
          Join <strong>EyeClinic</strong> and book appointments with ease.
        </p>

        {message && <div className="alert">{message}</div>}

        <form onSubmit={handleSubmit}>
          {/* FIRST + MIDDLE + LAST NAME ROW */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name <span class="required-star">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ maxWidth: '80px' }}>
              <label>MI</label>
              <input
                type="text"
                name="middleInit"
                value={formData.middleInit}
                onChange={handleChange}
                maxLength="1"
                placeholder="A"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label>Last Name <span class="required-star">*</span></label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
                className="form-control"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label>Email Address <span class="required-star">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="form-control"
            />
          </div>

          {/* PHONE */}
          <div className="form-group">
            <label>Phone <span class="required-star">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="123-456-7890"
              className="form-control"
            />
          </div>

          {/* GENDER + BIRTHDATE ROW */}
          <div className="form-row">
            <div className="form-group">
              <label>Gender <span class="required-star">*</span></label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date of Birth <span class="required-star">*</span></label>
              <input
                type="date"
                name="patientBirthdate"
                value={formData.patientBirthdate}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="patientAddress"
              value={formData.patientAddress}
              onChange={handleChange}
              placeholder="123 Main St, City, State"
              className="form-control"
            />
          </div>

          {/* PASSWORD WITH TOGGLE */}
          <div className="form-group">
            <label>Password <span class="required-star">*</span></label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
                className="form-control"
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button className="btn-primary" type="submit">
            Sign Up
          </button>

          <div className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </div>
        </form>
      </div>
    </div>
  );
};


export default PatientSignup;


