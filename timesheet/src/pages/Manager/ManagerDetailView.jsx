// src\pages\Manager\ManagerDetailView.jsx

import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const ManagerDetailView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split("/").slice(1)[2];

  const tabs = [
    { label: "Projects", path: "projects" },
    { label: "Team Leaders", path: "team-leaders" },
    { label: "Employees", path: "employees" },
    { label: "Leave requests", path: "leave-requests" },
    { label: "Attendance", path: "attendance" },
  ];

  return (
    <div className="admin-page">
      <div className="main-content">
        {/* Left Nav Bar */}
        <nav className="sidebar">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => navigate(tab.path)}
              className={currentTab === tab.path ? "active" : ""}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Middle Table Section */}
        <section className="table-section">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default ManagerDetailView;
