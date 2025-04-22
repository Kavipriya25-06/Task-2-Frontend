// src/pages/HR/EmployeeList.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { FaEdit } from "react-icons/fa";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/employees/`);
      const data = await response.json();
      setEmployees(data);
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

  return (
    <div className="employee-table-wrapper">
      <div className="user-header">
        <h2 className="employee-title">Employee Details</h2>
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
          {employees.map((emp) => (
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
