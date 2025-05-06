// timesheet\src\pages\Admin\AdminDashboard.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import {
  Route,
  Router,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tiles = [
    { label: "Users", path: "detail/users" },
    // { label: "Assign Role", path: "detail/assign-role" },
    // { label: "Reports", path: "detail/reports" },
    // { label: "Holidays", path: "detail/holidays" },
  ];

  // Current tab from path name
  const currentTab = location.pathname.split("/").slice(-1)[0];

  return (
    <div>
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
      {/* <Routes>
        <Route path="/admin/users" element={<AdminDetailView />}></Route>
      </Routes> */}
    </div>
  );
};

export default AdminDashboard;
