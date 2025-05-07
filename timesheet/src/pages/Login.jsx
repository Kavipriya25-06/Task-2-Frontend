// timesheet\src\pages\Login.jsx

import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      console.log("User logged in successfully");
      // Redirect logic here (e.g., navigate to dashboard)
      navigate("/home"); // Redirect to dashboard
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <div className="logo-section">
          <div className="logo-container">
            <img src="src/assets/Arris logo.jpg" alt="Arris Logo" className="logo-c" />
          </div>
        </div>

        <div className="login-form-section">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
             <button type="button" className="btn-forgot">
                Forgot Password
              </button>

            <div className="button-group">
              <button type="submit" className="btn-login">
                Sign in
              </button>
            </div>
          </form>
          <p>Not a user? Contact Admin</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
