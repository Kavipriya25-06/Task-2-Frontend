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
    <div className="Dashboard">
      <img src="src\assets\Close_circle.png" alt="Denied" className="denied" />
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page</p>
      <p>Please check your credentials and try again</p>
      <h4>Error code: 403 </h4>
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
          onClick={() => navigate("/home")}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Return Home
        </button>
      )}
    </div>
  );
};

export default Dashboard;
