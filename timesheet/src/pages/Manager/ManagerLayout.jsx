// src\pages\Manager\ManagerLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";

const ManagerLayout = () => {
  return (
    <div className="admin-layout">
      <Outlet />
    </div>
  );
};

export default ManagerLayout;
