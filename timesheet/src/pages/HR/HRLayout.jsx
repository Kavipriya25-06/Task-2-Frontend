// src/pages/HR/HRLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";

const HRLayout = () => {
  return (
    // <div className="hr-page">
    //   <div className="top-bar">
    //     <div className="top-bar-left">HR</div>
    //     <div className="top-bar-right">
    //       <select className="user-role-dropdown">
    //         <option value="hr">HR</option>
    //       </select>
    //     </div>
    //   </div>
    //   <main className="main-content">
    //     <Outlet />
    //   </main>
    // </div>
    <div className="admin-layout">
      <Breadcrumbs />
      <Outlet />
    </div>
  );
};

export default HRLayout;
