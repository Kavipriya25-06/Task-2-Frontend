import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* This wraps all Admin routes like Dashboard and DetailView */}
      <Breadcrumbs />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
