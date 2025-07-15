import React, { useState } from "react";
import {
  showErrorToast,
  showSuccessToast,
  ToastContainerComponent,
} from "../constants/Toastify";
import config from "../config";

const SendOtpForm = ({ onOtpSent }) => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendCooldown = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await fetch(`${config.apiBaseURL}/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        showSuccessToast(data.message);
        setTimeout(() => {
          onOtpSent(email);
        }, 2000); // 2 seconds delay before switching to next step
        startResendCooldown();
      } else if (res.status === 404) {
        showErrorToast("User not found: " + data.error);
      } else if (res.status === 429) {
        showErrorToast(data.error);
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
    setIsSending(false);
  };

  return (
    <form onSubmit={handleSendOtp}>
      <h3>Forgot Password</h3>
      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="button-login">
        <button
          type="submit"
          className="btn-login"
          disabled={isSending || resendTimer > 0}
        >
          {isSending ? (
            <>
              <span className="spinner-otp" /> Sending...
            </>
          ) : resendTimer > 0 ? (
            `Wait ${resendTimer}s`
          ) : (
            "Send OTP"
          )}
        </button>
      </div>
    </form>
  );
};

export default SendOtpForm;
