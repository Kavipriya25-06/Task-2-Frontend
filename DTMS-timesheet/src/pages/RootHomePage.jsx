// timesheet\src\pages\Dashboard.jsx

import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const RootHomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="Dashboard">
      <img src="\app2\roadblock.png" alt="RoadBlock" className="roadblock" />
      <h2>Nothing to see here</h2>

      <p>This page may be available when in Production</p>
      <p>Please come back later when in Production</p>
      <p></p>
      <h4>Error code: 503 </h4>
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

export default RootHomePage;
