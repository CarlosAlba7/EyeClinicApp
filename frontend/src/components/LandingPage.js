import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <h1>Welcome to EyeClinic</h1>
            <p>We're dedicated to helping you see the world clearly!</p>

            <div className="button-group">
                <button onClick={() => navigate("/signup")}>Sign Up</button>
                <button onClick={() => navigate("/login")}>Login</button>
            </div>
        </div>
    );
};

export default LandingPage;