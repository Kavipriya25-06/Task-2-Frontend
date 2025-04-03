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

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="employee-table-wrapper">
      <h2 className="employee-title">Employee Details</h2>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Reporting Manager</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.employee_id}>
              <td>{emp.employee_name}</td>
              <td>{emp.department}</td>
              <td>{emp.designation}</td>
              <td>{emp.reporting_manager || "-"}</td>
              <td>
                <button
                  className="edit-icon-btn"
                  onClick={() =>
                    navigate(
                      `/hr/detail/employee-details/edit-employee/${emp.employee_id}`
                    )
                  }
                  title="Edit Employee"
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="table-footer">
        <button
          className="add-user-btn"
          onClick={() => navigate("/hr/detail/employee-details/add-employee")}
        >
          Add Employee
        </button>
      </div>
    </div>
  );
};

export default EmployeeList;
