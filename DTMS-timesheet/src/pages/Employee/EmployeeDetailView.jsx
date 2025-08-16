// src\pages\Employee\EmployeeDetailView.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const EmployeeDetailView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const currentTab = location.pathname.split("/").slice(1)[2];

  const tabs = [
    { label: "Time Sheet Entry", path: "time-sheet-entry" },
    { label: "Leave requests", path: "leave-requests" },
    { label: "Attendance", path: "attendance" },
    { label: "Comp-off Request", path: "compoffrequest" },
    { label: "Company Policy", path: "company-policy" },
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

export default EmployeeDetailView;
