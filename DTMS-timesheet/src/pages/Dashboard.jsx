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
      <img src="\app2\Close_circle.png" alt="Denied" className="denied" />
      <h2>Access Denied</h2>
      {/* <img
        src="\illegal_entry.jpg"
        alt="Denied"
        width={360}
        height={202}
      /> */}
      {/* <h2>Illegal Entry</h2> */}
      <p>You do not have permission to view this page</p>
      <p>Please check your credentials and try again</p>
      <p></p>
      <h4>Error code: 403 </h4>
      {!user && (
        <button onClick={() => navigate("/login")} className="btn-cancel">
          Login
        </button>
      )}
      {user && (
        <button onClick={() => navigate("/home")} className="btn-cancel">
          Return Home
        </button>
      )}
    </div>
  );
};

export default Dashboard;
