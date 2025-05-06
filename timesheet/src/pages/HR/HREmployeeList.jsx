// src/pages/HR/EmployeeList.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { FaEdit } from "react-icons/fa";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/employees/`);
      const data = await response.json();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleAddClick = () => {
    navigate(`add-employee`);
  };

  const handleEditClick = (employee_id) => {
    navigate(`edit-employee/${employee_id}`);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Search filter logic
  useEffect(() => {
    const lowerSearch = searchText.toLowerCase();
    const filtered = employees.filter((u) => {
      const code = u.employee_code?.toLowerCase() || "";
      const name = u.employee_name?.toLowerCase() || "";
      const email = u.reporting_manager?.toLowerCase() || "";
      return (
        code.includes(lowerSearch) ||
        name.includes(lowerSearch) ||
        email.includes(lowerSearch)
      );
    });
    setFilteredEmployees(filtered);
  }, [searchText, employees]);

  return (
    <div className="employee-table-wrapper">
      <div className="user-header">
        <h2 className="employee-title">Employee Details</h2>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search by code, name, or reporting manager"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-bar"
          />
        </div>
        <button className="add-user-btn" onClick={() => handleAddClick()}>
          Add Employee
        </button>
      </div>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee Code</th>
            <th>Employee Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Reporting Manager</th>
          </tr>
        </thead>
        <tbody>
          {filteredEmployees.map((emp) => (
            <tr key={emp.employee_id}>
              <td
                onClick={() => handleEditClick(emp.employee_id)}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {emp.employee_code}
              </td>
              <td>{emp.employee_name}</td>
              <td>{emp.department}</td>
              <td>{emp.designation}</td>
              <td>{emp.reporting_manager || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
