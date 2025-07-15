import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../constants/Toastify";
import config from "../config";
import { validatePasswordStrength } from "./utils";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPasswordForm = ({ email }) => {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validatePasswordStrength(password)) {
      showErrorToast(
        "Password must be at least 8 characters, 1 uppercase letter and 1 number."
      );
      return;
    }

    if (password !== confirmPassword) {
      showErrorToast("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${config.apiBaseURL}/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showSuccessToast(data.message + " Login to continue"); // Success case
        setTimeout(() => {
          navigate("/login");
        }, 2000); // waits for 2 seconds (2000ms)
      } else if (res.status === 404) {
        showErrorToast("User not found: " + data.error);
      } else if (res.status === 400) {
        showErrorToast("Error: " + data.error);
      } else if (res.status === 500) {
        showErrorToast("Server error: " + data.error);
      } else {
        showErrorToast(
          "Unexpected error: " + (data.error || "Please try again.")
        );
      }
    } catch (error) {
      showErrorToast("Network error: " + error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleResetPassword}>
      <h3>Reset Password</h3>
      <label>OTP</label>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />
      <label>New Password</label>
      <div style={{ position: "relative" }}>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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
      <label>Confirm Password</label>
      <div style={{ position: "relative" }}>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <span
          onClick={() => setConfirmShowPassword((prev) => !prev)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
        >
          {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
        </span>
      </div>
      {password !== confirmPassword && (
        <span className="error-message">Passwords don't match</span>
      )}
      <div className="button-login">
        <button type="submit" className="btn-login" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-otp" /> Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
