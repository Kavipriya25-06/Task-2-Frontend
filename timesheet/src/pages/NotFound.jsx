// timesheet\src\pages\Dashboard.jsx

import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="Dashboard">
      {/* <img src="\Close_circle.png" alt="Denied" className="denied" /> */}
      {/* <h2>Access Denied</h2> */}
      {/* <img
        src="\illegal_entry.jpg"
        alt="Denied"
        width={360}
        height={202}
      /> */}
      {/* <h2>Illegal Entry</h2> */}
      <p className="notfound">404</p>
      {/* <p>Oops!</p> */}
      <h1>Oops!</h1>
      {/* <p></p> */}
      <p>The page you are looking for, does not exist!</p>
      <p></p>

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

export default NotFound;
