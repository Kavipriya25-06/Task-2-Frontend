// src\pages\TeamLead\TeamLeadEmployees.jsx

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const TeamLeadEmployees = () => {
  const { user } = useAuth();
  const managerId = user.employee_id;

  const [teamleadData, setTeamleadData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  console.log("User", user);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/org-hierarchy/${user.employee_id}/`
      );
      const data = await response.json();
      setEmployeeData(data);
      setTeamleadData(data.teamleads);
      console.log("Org data", data);
      console.log("Manager data", data.teamleads);
    } catch (err) {
      console.log("Unable to fetch employees", err);
    }
  };

  // Calculate total employees, including team leads and their employees
  const totalEmployees =
    teamleadData.length + // Count of team leads
    teamleadData.reduce(
      (count, teamlead) => count + teamlead.employees.length,
      0
    ); // Add the employees under each team lead

  return (
    <div className="manager-employees">
      <div className="employee-list">
        <h3>Employees: {totalEmployees}</h3>
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Role</th>
              {/* <th>Team Leader</th> */}
            </tr>
          </thead>
          <tbody>
            {teamleadData.map((teamlead) => (
              <tr key={teamlead.teamlead_id}>
                <td>{teamlead.employee_code}</td>
                <td>{teamlead.teamlead_name}</td>
                <td>{teamlead.teamlead_role}</td>
                {/* <td>-</td> */}
              </tr>
            ))}
            {teamleadData.flatMap((teamlead) =>
              teamlead.employees.map((employee) => (
                <tr key={employee.employee_id}>
                  <td>{employee.employee_code}</td>
                  <td>{employee.employee_name}</td>
                  <td>{teamlead.teamlead_role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamLeadEmployees;
