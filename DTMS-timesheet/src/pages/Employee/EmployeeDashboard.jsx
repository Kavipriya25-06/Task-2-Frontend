// timesheet\src\pages\Employee\EmployeeDashboard.jsx

import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import {
  Route,
  Router,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tiles = [
    { label: "Time Sheet Entry", path: "detail/time-sheet-entry" },
    { label: "Leave requests", path: "detail/leave-requests" },
    { label: "Attendance", path: "detail/attendance" },
    { label: "Comp-off Request", path: "detail/compoffrequest" },
    { label: "Company Policy", path: "detail/company-policy" },
  ];

  // Current tab from path name
  const currentTab = location.pathname.split("/").slice(-1)[0];
  return (
    <div className="dashboard-tile-container">
      {tiles.map((tile, idx) => (
        <div
          key={idx}
          className={`dashboard-tile ${
            currentTab === tile.path.split("/").slice(-1)[0]
              ? "active-tile"
              : ""
          }`}
          onClick={() => navigate(tile.path)}
        >
          {tile.label}
        </div>
      ))}
    </div>
  );
};

export default EmployeeDashboard;
