// timesheet\src\pages\Dashboard.jsx

import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome to Timesheet Management system</h2>
      {!user && (
        <button
          onClick={() => navigate("/login")}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Login
        </button>
      )}
      {user && (
        <button
          onClick={handleLogout}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Dashboard;
