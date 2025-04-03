// src/pages/HomeRedirect.jsx
import { useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate, Navigate } from "react-router-dom";

const HomeRedirect = ({ selectedRole }) => {
  switch (selectedRole) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "hr":
      return <Navigate to="/hr" replace />;
    case "manager":
      return <Navigate to="/manager" replace />;
    case "teamlead":
      return <Navigate to="/teamlead" replace />;
    case "employee":
      return <Navigate to="/employee" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default HomeRedirect;
