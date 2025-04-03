// timesheet\src\pages\Admin\AdminDetailView.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, Outlet, useLocation } from "react-router-dom";

const AdminDetailView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // current tab from pathname

  const currentTab = location.pathname.split("/").slice(1)[2];
  // console.log(
  //   "Current tab",
  //   currentTab,
  //   location.pathname,
  //   location.pathname.split("/").slice(1)[2]
  // );

  const tabs = [
    { label: "Users", path: "users" },
    // { label: "Assign Role", path: "assign-role" },
    { label: "Reports", path: "reports" },
    { label: "Holidays", path: "holidays" },
  ];

  return (
    <div className="admin-page">
      <div className="main-content">
        {/* Left Nav Bar */}

        {/* <nav className="sidebar">
          <button onClick={() => navigate("users")} className="active">
            Users
          </button>
          <button onClick={() => navigate("assign-role")}>Assign Role</button>
          <button onClick={() => navigate("reports")}>Reports</button>
          <button onClick={() => navigate("holidays")}>Holidays</button>
        </nav> */}
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

export default AdminDetailView;
