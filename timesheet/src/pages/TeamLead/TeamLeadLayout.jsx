// src\pages\TeamLead\TeamLeadLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";

const TeamLeadLayout = () => {
  return (
    <div className="admin-layout">
      <Breadcrumbs />
      <Outlet />
    </div>
  );
};

export default TeamLeadLayout;
