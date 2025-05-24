// src/pages/HR/HRLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";

const HRLayout = () => {
  return (
    <div className="admin-layout">
      <Breadcrumbs />
      <Outlet />
    </div>
  );
};

export default HRLayout;
