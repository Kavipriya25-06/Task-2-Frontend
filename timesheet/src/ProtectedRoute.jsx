import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { isDev } from "./constants/devmode";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  // Bypass all protection in development mode
  if (isDev) return children;

  if (!user) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Redirect to home if role not allowed
  }

  return children; // Render the protected component
};

export default ProtectedRoute;
