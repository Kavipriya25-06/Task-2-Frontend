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
  const [visibleEmployees, setVisibleEmployees] = useState(10);
  const [isLoadingMoreEmployees, setIsLoadingMoreEmployees] = useState(false);
  const [hasMoreEmployees, setHasMoreEmployees] = useState(true);

  console.log("User", user);

  useEffect(() => {
    fetchEmployee();
  }, []);

  useEffect(() => {
    if (visibleEmployees >= teamleadData.length) {
      setHasMoreEmployees(false);
    }
  }, [visibleEmployees, teamleadData.length]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      !isLoadingMoreEmployees &&
      hasMoreEmployees
    ) {
      setIsLoadingMoreEmployees(true);
      setTimeout(() => {
        const nextVisible = visibleEmployees + 10;
        if (nextVisible >= teamleadData.length) {
          setVisibleEmployees(teamleadData.length);
          setHasMoreEmployees(false);
        } else {
          setVisibleEmployees(nextVisible);
        }
        setIsLoadingMoreEmployees(false);
      }, 1000); // 1 second loading simulation
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/all-employee-hierarchy/${user.employee_id}/`
      );
      const data = await response.json();
      setEmployeeData(data);
      setTeamleadData(data.teamleads);
      setVisibleEmployees(10); // Reset visible count
      setHasMoreEmployees((data.teamleads || []).length > 10);

      console.log("Org data", data);
      console.log("Manager data", data.teamleads);
    } catch (err) {
      console.log("Unable to fetch employees", err);
    }
  };

  // Calculate total employees, including team leads and their employees
  const totalEmployees = teamleadData.length; // + // Count of team leads

  return (
    <div className="manager-employees">
      <div className="employee-list">
        <h3>Employees: {totalEmployees}</h3>
        <div
          className="table-wrapper"
          onScroll={handleScroll}
          style={{
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Last Name</th>
                <th>Designation</th>
                <th>Reporting To</th>
              </tr>
            </thead>
            <tbody>
              {teamleadData.slice(0, visibleEmployees).map((teamlead) => (
                <tr key={teamlead.teamlead_id}>
                  <td>{teamlead.employee_code}</td>
                  <td>{teamlead.teamlead_name}</td>
                  <td>{teamlead.last_name}</td>
                  <td>{teamlead.teamlead_role}</td>
                  <td>{teamlead.reporting_to || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoadingMoreEmployees && (
            <div
              className="loading-message"
              style={{ textAlign: "center", padding: "10px" }}
            >
              Loading...
              {/* <div className="spinner"></div> */}
            </div>
          )}
          {!hasMoreEmployees && (
            <div
              className="no-message"
              style={{ textAlign: "center", padding: "10px", color: "#999" }}
            >
              No more data
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamLeadEmployees;
