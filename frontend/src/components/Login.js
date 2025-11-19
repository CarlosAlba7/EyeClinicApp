import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      if (!user.role && user.employeeType) {
        user.role = user.employeeType;
      }

      // Store token + user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set global state
      setUser(user);

      // Redirect based on role
      if (user.role === "Patient") {
        navigate("/patient-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <button className="brand-btn" onClick={() => navigate("/")}>
        Eye Clinic
      </button>
      <div className="login-card">
        <h2>Eye Clinic Management System</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/*<div
          style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#7f8c8d" }}
        >
          <p>
            <strong>Demo Credentials:</strong>
          </p>
          <p>Admin: admin@eyeclinic.com / password123</p>
          <p>Doctor: doctor@eyeclinic.com / password123</p>
          <p>Receptionist: receptionist@eyeclinic.com / password123</p>
        </div>*/}
      </div>
    </div>
  );
};

export default Login;
