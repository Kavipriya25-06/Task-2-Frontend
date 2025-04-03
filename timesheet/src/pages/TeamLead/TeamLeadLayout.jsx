// src\pages\TeamLead\TeamLeadLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";

const TeamLeadLayout = () => {
  return (
    <div className="admin-layout">
      <Outlet />
    </div>
  );
};

export default TeamLeadLayout;
