import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* This wraps all Admin routes like Dashboard and DetailView */}
      <Outlet />
    </div>
  );
};

export default AdminLayout;
