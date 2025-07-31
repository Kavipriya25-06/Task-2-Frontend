// src\pages\Logout_popup.jsx

import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function LogoutPopup({ onClose }) {
  const { user } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleOverlayClick = (e) => {
    // Only close if they clicked directly on the overlay, not the popup content
    if (e.target.className === "popup-overlay") {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-container">
        <form className="forms">
          <input
            value={`Employee Code : ${user.employee_code || ""}`}
            type="text"
            name="userId"
            placeholder="User ID:"
            required
            readOnly
          />

          <input
            value={`Employee Name : ${user.employee_name || ""}`}
            type="text"
            name="username"
            placeholder="Username:"
            required
            readOnly
          />

          <input
            value={`Email : ${user.email || ""}`}
            type="email"
            name="email"
            placeholder="Email:"
            required
            readOnly
          />

          <div className="logout-section" onClick={handleLogout}>
            <button className="logout-button" onClick={onClose}>
              <span>
                <img src="/DTMS/logouticon.svg" />
              </span>
              <span className="logout">Logout</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
