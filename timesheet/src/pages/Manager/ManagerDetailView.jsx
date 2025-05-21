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
    {
      label: "Projects",
      path: "projects",
      tabname: ["projects", "buildings", "tasks"],
    },
    { label: "Team Leaders", path: "team-leaders", tabname: ["team-leaders"] },
    { label: "Employees", path: "employees", tabname: ["employees"] },
    {
      label: "Leave requests",
      path: "leave-requests",
      tabname: ["leave-requests"],
    },
    { label: "Attendance", path: "attendance", tabname: ["attendance"] },
    { label: "Comp-off", path: "compoff request", tabname: ["compoff"] },
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
              className={tab.tabname.includes(currentTab) ? "active" : ""}
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
