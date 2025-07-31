// src\pages\ForgotPassword.jsx

import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
  ToastContainerComponent,
} from "../constants/Toastify";
import config from "../config";
import SendOtpForm from "./SendOtpForm";
import ResetPasswordForm from "./ResetPasswordForm";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // SendOTP.jsx
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${config.apiBaseURL}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        showSuccessToast(data.message); // Success case
        setIsOtpSent(true); // Switch to OTP entry form
      } else if (res.status === 404) {
        showErrorToast("User not found: " + data.error);
      } else if (res.status === 429) {
        showErrorToast("Wait: " + data.error);
      } else if (res.status === 500) {
        showErrorToast("Server error: " + data.error);
      } else {
        showErrorToast(
          "Unexpected error: " + (data.error || "Please try again.")
        );
      }
      // setEmail("");
      // alert(data.message || data.error);
    } catch (error) {
      showErrorToast("Network error: " + error.message);
    }
  };

  // ResetPassword.jsx
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${config.apiBaseURL}/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      // alert(data.message || data.error);

      if (res.ok) {
        showSuccessToast(data.message + " Login to continue"); // Success case
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
      setEmail("");
      setPassword("");
      setOtp("");
    } catch (error) {
      alert("Network error: " + error.message);
    }
  };

  // return (
  //   <div className="container">
  //     <div className="login-box">
  //       <div className="logo-section">
  //         <div className="logo-container">
  //           <img
  //             src="\arrislogo.png"
  //             // {\* src="src\assets\Logo.svg" *\}
  //             alt="Arris Logo"
  //             className="logo-c"
  //           />
  //         </div>
  //       </div>

  //       <div className="login-form-section">
  //         <h2>Forgot password?</h2>
  //         {!isOtpSent ? (
  //           <form onSubmit={handleSendOtp}>
  //             <p>Enter the Email associated with your account</p>
  //             <label>Email</label>
  //             <input
  //               type="email"
  //               value={email}
  //               onChange={(e) => setEmail(e.target.value)}
  //               required
  //             />
  //             <div className="button-group">
  //               <button type="submit" className="btn-login">
  //                 Send OTP
  //               </button>
  //             </div>
  //           </form>
  //         ) : (
  //           <form onSubmit={handleResetPassword}>
  //             <p>Enter OTP and new password</p>
  //             <label>OTP</label>
  //             <input
  //               type="text"
  //               value={otp}
  //               onChange={(e) => setOtp(e.target.value)}
  //               required
  //             />
  //             <label>New Password</label>
  //             <input
  //               type="password"
  //               value={password}
  //               onChange={(e) => setPassword(e.target.value)}
  //               required
  //             />
  //             <div className="button-group">
  //               <button type="submit" className="btn-login">
  //                 Reset Password
  //               </button>
  //             </div>
  //           </form>
  //         )}
  //         <p>
  //           Not a user?{" "}
  //           <a
  //             className="btn-contact"
  //             href="mailto:hr@arrisltd.com?subject=Request%20for%20Login%20Credentials&body=Dear%20Team,%0A%0AI%20hope%20this%20message%20finds%20you%20well.%0A%0AI%20am%20writing%20to%20request%20login%20credentials%20for%20my%20account.%20Please%20provide%20me%20with%20the%20necessary%20access%20at%20your%20earliest%20convenience.%0A%0AThank%20you%20for%20your%20assistance.%0A%0ABest%20regards,%0A%5BYour%20Name%5D"
  //           >
  //             Contact Admin
  //           </a>
  //         </p>
  //         <p>
  //           Already a user?{" "}
  //           <a
  //             className="btn-contact"
  //             onClick={() => {
  //               navigate("/login");
  //             }}
  //           >
  //             Login
  //           </a>
  //         </p>
  //       </div>
  //     </div>
  //     <ToastContainerComponent />
  //   </div>
  // );

  return (
    <div className="container">
      <div className="login-box">
        <div className="logo-section">
          <div className="logo-container">
            <img
              src="\app2\arrislogo.png"
              // {\* src="src\assets\Logo.svg" *\}
              alt="Arris Logo"
              className="logo-c"
            />
          </div>
        </div>
        <div className="login-form-section">
          {!email ? (
            <SendOtpForm onOtpSent={setEmail} />
          ) : (
            <ResetPasswordForm email={email} />
          )}
          <p>
            Not a user?{" "}
            <a
              className="btn-contact"
              href="mailto:hr@arrisltd.com?subject=Request%20for%20Login%20Credentials&body=Dear%20Team,%0A%0AI%20hope%20this%20message%20finds%20you%20well.%0A%0AI%20am%20writing%20to%20request%20login%20credentials%20for%20my%20account.%20Please%20provide%20me%20with%20the%20necessary%20access%20at%20your%20earliest%20convenience.%0A%0AThank%20you%20for%20your%20assistance.%0A%0ABest%20regards,%0A%5BYour%20Name%5D"
            >
              Contact Admin
            </a>
          </p>
          <p>
            Already a user?{" "}
            <a
              className="btn-contact"
              onClick={() => {
                navigate("/login");
              }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ForgotPassword;
