// timesheet\src\pages\Login.jsx

import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { showErrorToast, ToastContainerComponent } from "../constants/Toastify";
import config from "../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    const tryLogin = await login(email, password);

    if (tryLogin === "logged") {
      console.log("User logged in successfully");
      // Redirect logic here (e.g., navigate to dashboard)
      navigate("/home"); // Redirect to dashboard
    } else if (tryLogin === "inactive") {
      showErrorToast("User is inactive, contact Admin");
    } else if (tryLogin === "passwordinvalid") {
      showErrorToast("Password is incorrect");
    } else if (tryLogin === "invalid") {
      showErrorToast("Invalid email or password");
    } else if (tryLogin === "nouser") {
      showErrorToast("User does not exist, contact Admin");
    }
  };

  // SendOTP.jsx
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const res = await fetch(`${config.apiBaseURL}/send-otp/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  // ResetPassword.jsx
  const handleResetPassword = async () => {
    const res = await fetch(`${config.apiBaseURL}/reset-password/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, password }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  return (
    <div className="container">
      <div className="login-box">
        <div className="logo-section">
          <div className="logo-container">
            <img
              src="\arrislogo.png"
              // {\* src="src\assets\Logo.svg" *\}
              alt="Arris Logo"
              className="logo-c"
            />
          </div>
        </div>

        <div className="login-form-section">
          <h2>Forgot password?</h2>
          <form onSubmit={handleSendOtp}>
            <p>Enter the Email associated with your account</p>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="button-group">
              <button type="submit" className="btn-login">
                Send OTP
              </button>
            </div>
          </form>
          <p>
            Not a user?{" "}
            <a
              className="btn-contact"
              href="mailto:hr@arrisltd.com?subject=Request%20for%20Login%20Credentials&body=Dear%20Team,%0A%0AI%20hope%20this%20message%20finds%20you%20well.%0A%0AI%20am%20writing%20to%20request%20login%20credentials%20for%20my%20account.%20Please%20provide%20me%20with%20the%20necessary%20access%20at%20your%20earliest%20convenience.%0A%0AThank%20you%20for%20your%20assistance.%0A%0ABest%20regards,%0A%5BYour%20Name%5D"
            >
              Contact Admin
            </a>
          </p>
        </div>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ForgotPassword;
