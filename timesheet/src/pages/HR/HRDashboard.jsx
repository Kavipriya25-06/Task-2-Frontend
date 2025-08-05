// timesheet\src\pages\HR\HRDashboard.jsx

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

const HRDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tiles = [
    { label: "Employees Details", path: "detail/employee-details" },
    { label: "Holidays", path: "detail/holidays" },
    { label: "Settings", path: "detail/settings" },
    { label: "Leave requests", path: "detail/leave-requests" },
    { label: "Attendance", path: "detail/attendance" },
    { label: "Reports", path: "detail/reports" },
    { label: "Leave Balance", path: "detail/leave-balance" },
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

export default HRDashboard;
