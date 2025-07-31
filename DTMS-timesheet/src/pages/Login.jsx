// timesheet\src\pages\Login.jsx

import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { showErrorToast, ToastContainerComponent } from "../constants/Toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    const tryLogin = await login(email, password);
    // if (success) {
    //   console.log("User logged in successfully");
    //   // Redirect logic here (e.g., navigate to dashboard)
    //   navigate("/home"); // Redirect to dashboard
    // } else {
    //   alert("Invalid email or password");
    // }
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

  const forgotPassword = async () => {
    navigate("/forgotpassword");
  };

  return (
    <div className="container">
      <div className="login-box">
        <div className="logo-section">
          <div className="logo-container">
            <img
              src="\app2\aero360_logo.png"
              // {\* src="src\assets\Logo.svg" *\}
              alt="Arris Logo"
              className="logo-c"
            />
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
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: "40px" }} // leave space for icon
              />
              <span
                onClick={() => setShowPassword((prev) => !prev)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                // showErrorToast("Contact Admin");
                forgotPassword();
              }}
              className="btn-forgot"
            >
              Forgot Password
            </button>
            <div className="button-login">
              <button type="submit" className="btn-login">
                Log in
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

export default Login;
