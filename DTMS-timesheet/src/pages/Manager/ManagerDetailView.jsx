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
    { label: "Clients", path: "clients", tabname: ["clients"] },
    // { label: "Client-POC", path: "pocs", tabname: ["pocs"] },
    { label: "Team Leaders", path: "team-leaders", tabname: ["team-leaders"] },
    { label: "Employees", path: "employees", tabname: ["employees"] },
    // { label: "Users", path: "users", tabname: ["users"] },
    {
      label: "Time Sheet Entry",
      path: "time-sheet-entry",
      tabname: ["time-sheet-entry"],
    },
    {
      label: "Leave requests",
      path: "leave-requests",
      tabname: ["leave-requests"],
    },
    { label: "Attendance", path: "attendance", tabname: ["attendance"] },
    { label: "Comp-off", path: "Compoff", tabname: ["Compoff"] },
    { label: "Reports", path: "reports", tabname: ["reports"] },
    {
      label: "Company Policy",
      path: "company-policy",
      tabname: ["company-policy"],
    },
    ...(user.employee_id === "EMP_00002"
      ? [{ label: "Users", path: "users", tabname: ["users"] }]
      : []),
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
