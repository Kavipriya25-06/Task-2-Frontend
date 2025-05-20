// src\pages\Employee\EmployeeLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";

const EmployeeLayout = () => {
  return (
    <div className="admin-layout">
      <Breadcrumbs />
      <Outlet />
    </div>
  );
};

export default EmployeeLayout;
