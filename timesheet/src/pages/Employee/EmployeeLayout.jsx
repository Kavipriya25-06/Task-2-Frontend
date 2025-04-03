// src\pages\Employee\EmployeeLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";

const EmployeeLayout = () => {
  return (
    <div className="admin-layout">
      <Outlet />
    </div>
  );
};

export default EmployeeLayout;
