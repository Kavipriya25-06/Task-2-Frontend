// src/pages/HR/HRDetailView.jsx

import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const HRDetailView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTab = location.pathname.split("/").slice(1)[2];

  return (
    <div className="admin-page">
      <div className="main-content">
        <nav className="sidebar">
          <button
            onClick={() => navigate("employee-details")}
            className={currentTab === "employee-details" ? "active" : ""}
          >
            Employees Details
          </button>
        </nav>

        <section className="table-section">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default HRDetailView;
