// src\pages\Employee\EmployeeLeaveRequests.jsx

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import EmployeeLeaveRequestForm from "./EmployeeLeaveRequestForm";

const EmployeeLeaveRequests = () => {
 const { user } = useAuth();
  const [leaveSummary, setLeaveSummary] = useState({
    sick: 0,
    casual: 0,
    compOff: 0,
    earned: 0,
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);

  useEffect(() => {
    fetchLeaveSummary();
    fetchLeaveRequests();
  }, []);

  const fetchLeaveSummary = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/leaves-available/`);
      const data = await response.json();

      // Find summary for the logged-in employee
      const employeeSummary = data.find(item => item.employee === user.employee_id);
      // console.log("employee leave", employeeSummary);
      if (employeeSummary) {
        setLeaveSummary({
          sick: employeeSummary.sick_leave,
          casual: employeeSummary.casual_leave,
          compoff: employeeSummary.comp_off,
          earned: employeeSummary.earned_leave,
        });
      }
    } catch (err) {
      console.error("Error fetching leave summary", err);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/leave/requests?user=${user.id}`);
      const data = await response.json();
      setLeaveRequests(data);
    } catch (err) {
      console.error("Error fetching leave requests", err);
    }
  };

  return (
    <div className="team-lead-container">
      <h2 className="team-lead-title">Leave Application</h2>

       {/* Conditionally Render Form or Summary + Table */}
       {!selectedLeaveType ? (
        <>
      {/* Leave Summary Boxes */}
      <div className="leave-summary-container">
        {["Sick", "Casual", "Comp off", "Earned"].map((type, idx) => {
          const key = type.toLowerCase().replace(" ", "");
          return (
            <div key={idx} className="leave-summary-box" onClick={() => setSelectedLeaveType(type)} // Set clicked leave type
            style={{ cursor: "pointer" }}>
              <div>{type}</div>
              <div className="leave-summary-count">
                {leaveSummary[key] ?? 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Conditionally Render Form */}
      {/* {selectedLeaveType && (
        <TeamLeadLeaveRequestForm
          leaveType={selectedLeaveType}
          onClose={() => setSelectedLeaveType(null)}
        />
      )} */}

      {/* Leave Requests Table */}
      <table className="leave-requests-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Duration(s)</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason(s)</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((request, idx) => (
            <tr key={idx}>
              <td>{request.type}</td>
              <td>{request.duration}</td>
              <td>{request.start_date}</td>
              <td>{request.end_date}</td>
              <td>{request.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
       </>
      ) : (
        <EmployeeLeaveRequestForm
          leaveType={selectedLeaveType}
          onClose={() => setSelectedLeaveType(null)} // Go back to boxes + table when closed
        />
      )}

    </div>
  );
};

export default EmployeeLeaveRequests;
