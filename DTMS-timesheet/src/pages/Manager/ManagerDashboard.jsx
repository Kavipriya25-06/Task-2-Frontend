// src\pages\Manager\ManagerDashboard.jsx

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
import ManagerHierarchyChart from "../Org/ManagerHierarchyChart";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tiles = [
    { label: "Projects", path: "detail/projects" },
    { label: "Team Leaders", path: "detail/team-leaders" },
    { label: "Employees", path: "detail/employees" },
    { label: "Time Sheet Entry", path: "detail/time-sheet-entry" },

    { label: "Leave requests", path: "detail/leave-requests" },
    { label: "Attendance", path: "detail/attendance" },
    { label: "Comp-off", path: "detail/Compoff" },
    { label: "Reports", path: "detail/reports" },
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

export default ManagerDashboard;
