// src\pages\Manager\ManagerLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";

const ManagerLayout = () => {
  return (
    <div className="admin-layout">
      <Breadcrumbs />
      <Outlet />
    </div>
  );
};

export default ManagerLayout;
