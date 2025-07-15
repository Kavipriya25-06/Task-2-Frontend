// src\pages\TeamLead\TeamLeadDetailView.jsx

import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const TeamLeadDetailView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split("/").slice(1)[2];

  // const tabs = [
  //   { label: "Projects", path: "projects" },
  //   { label: "Time Sheet Entry", path: "time-sheet-entry" },
  //   { label: "Employees", path: "employees" },
  //   { label: "Leave requests", path: "leave-requests" },
  //   { label: "Attendance", path: "attendance" },
  // ];

  const tabs = [
    {
      label: "Projects",
      path: "projects",
      tabname: ["projects", "buildings", "tasks"],
    },
    {
      label: "Time Sheet Entry",
      path: "time-sheet-entry",
      tabname: ["time-sheet-entry"],
    },
    { label: "Employees", path: "employees", tabname: ["employees"] },
    {
      label: "Leave requests",
      path: "leave-requests",
      tabname: ["leave-requests"],
    },
    { label: "Attendance", path: "attendance", tabname: ["attendance"] },
    {
      label: "Comp-off Request",
      path: "compoffrequest",
      tabname: ["compoffrequest"],
    },
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

export default TeamLeadDetailView;
