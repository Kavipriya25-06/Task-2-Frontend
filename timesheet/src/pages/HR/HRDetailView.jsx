// src/pages/HR/HRDetailView.jsx

import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const HRDetailView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split("/").slice(1)[2];
  // const tabs = [
  //   { label: "Employees Details", path: "employee-details" },
  //   { label: "Holidays", path: "holidays" },
  // ];

  const tabs = [
    { label: "Employee Details", path: "employee-details" },
    { label: "Holidays", path: "holidays" },

  ];

  return (
    <div className="admin-page">
      <div className="main-content">
        <nav className="sidebar">

        {/* {tabs.map((tab, idx) => ( */}
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

        <section className="table-section">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default HRDetailView;
