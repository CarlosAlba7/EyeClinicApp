import React, { useState } from "react";
import Patients from "./Patients";

const PatientSignup = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: ""
    });

    const [message, setMessage] = useState(""); // show feedback to user
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        
        try {
            const response = await fetch("/api/patients/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage("Account created successfully!");
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    password: "",
                });
            } else {
                setMessage(`${result.message || "Error creating account"}`);
            }
        } catch (error) {
            console.error("Signup error:", error);
            setMessage("Server error. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="signup-page">
            <h2>Sign Up</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    First Name:
                    <input
                      type="text"
                      name="firstName"
                      onChange={handleChange}
                      value={formData.firstName}
                      required
                    />
                </label>

                <label>
                    Last Name:
                    <input
                      type="text"
                      name="lastName"
                      onChange={handleChange}
                      value={formData.lastName}
                      required
                    />
                </label>

                <label>
                    Email:
                    <input
                      type="email"
                      name="email"
                      onChange={handleChange}
                      value={formData.email}
                      required
                    />
                </label>

                <label>
                    Phone:
                    <input
                      type="tel"
                      name="phone"
                      onChange={handleChange}
                      value={formData.phone}
                      required
                    />
                </label>

                <label>
                    Password:
                    <input
                      type="password"
                      name="password"
                      onChange={handleChange}
                      value={formData.password}
                      required
                    />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                >
                    {loading ? "Creating Account..." : "Sign Up"}
                </button>
            </form>
        </div>
    );
};

export default PatientSignup;