// src\pages\RoleSwitcher.jsx

import React from "react";
import { useNavigate } from "react-router-dom";

const RoleSwitcher = ({ selectedRole, setSelectedRole }) => {
  const navigate = useNavigate();

  const handleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    localStorage.setItem("selectedRole", newRole);
    navigate("/home"); // Triggers HomeRedirect based on role
  };

  return (
    <select
      className="profile-dropdown"
      value={selectedRole}
      onChange={handleChange}
    >
      <option value="admin">Admin</option>
      <option value="hr">HR</option>
      <option value="manager">Manager</option>
      <option value="teamlead">Team Lead</option>
      <option value="employee">Employee</option>
    </select>
  );
};

export default RoleSwitcher;
