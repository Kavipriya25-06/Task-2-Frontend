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
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentLeaveRequests = leaveRequests.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(leaveRequests.length / rowsPerPage);

  useEffect(() => {
    fetchLeaveSummary();
    fetchLeaveRequests();
  }, []);

  const fetchLeaveSummary = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/leaves-available/by_employee/${user.employee_id}/`
      );
      const data = await response.json();

      // Find summary for the logged-in employee
      const employeeSummary = data;
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
      const response = await fetch(
        `${config.apiBaseURL}/leaves-taken/by_employee/${user.employee_id}/`
      );
      const data = await response.json();
      setLeaveRequests(data);
      console.log("Leave requests", data);
    } catch (err) {
      console.error("Error fetching leave requests", err);
    }
  };

  const keyMap = {
    Sick: "sick",
    Casual: "casual",
    "Comp off": "compOff",
    Earned: "earned",
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
              const key = keyMap[type];
              return (
                <div
                  key={idx}
                  className="leave-summary-box"
                  onClick={() => setSelectedLeaveType(type)} // Set clicked leave type
                  style={{ cursor: "pointer" }}
                >
                  <div>{type}</div>
                  <div className="leave-summary-count">
                    {leaveSummary[key] ?? 0}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leave Requests Table */}
          <table className="leave-requests-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Duration(s)</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason(s)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            {currentLeaveRequests.map((request, idx) => (
              <tr key={idx}>
                <td>{request.leave_type}</td>
                <td>{request.duration}</td>
                <td>{request.start_date}</td>
                <td>{request.end_date}</td>
                <td>{request.reason}</td>
                <td>{request.status}</td>
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
            <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmployeeLeaveRequests;
