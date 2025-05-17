// src\pages\Manager\ManagerLeaveRequests.jsx

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";


const ManagerLeaveRequests = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);
  const tabLabels = ["Pending", "Approved", "Rejected"];
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 2;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredLeaveRequests.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredLeaveRequests.length / rowsPerPage);


  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    filterLeaveRequests();
  }, [leaveRequests, activeTab]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/leave-request/${user.employee_id}/`
      );
      const data = await response.json();
      setLeaveRequests(data);
    } catch (err) {
      console.log("Unable to fetch leave requests", err);
    }
  };

  const filterLeaveRequests = () => {
    const statusFilter = tabLabels[activeTab].toLowerCase();
    const filteredData = leaveRequests.filter(
      (leave) => leave.status.toLowerCase() === statusFilter) .sort((a, b) => new Date(b.end_date) - new Date(a.end_date)
    );
    setFilteredLeaveRequests(filteredData);
  };

  const handleApprove = async (leave_taken_id) => {
    // e.preventDefault();
    const leaveUpdate = {
      status: "approved",
      approved_by: user.employee_id,
    };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/leaves-taken/${leave_taken_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leaveUpdate),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
      }

      fetchLeaveRequests();
      console.log("Leave approved successfully");
    } catch (error) {
      console.error("Error updating user", error);
    }
  };
  const handleReject = async (leave_taken_id) => {
    const leaveUpdate = {
      status: "rejected",
      approved_by: user.employee_id,
    };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/leaves-taken/${leave_taken_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leaveUpdate),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating leave: ${response.statusText}`);
      }

      console.log("Leave rejected successfully");
      fetchLeaveRequests(); // Refresh the leave requests after rejection
    } catch (error) {
      console.error("Error rejecting leave", error);
    }
  };

  return (
    <div className="leaves-container">
      {/* Leave Application Button - Top Right */}
      <div className="leave-application-topbar">
        <button
          onClick={() => navigate("Leaveapplication")}
          className="leave-application-button"
        >
          Leave Application
        </button>
      </div>

      <div className="leaves-tab">
        {tabLabels.map((label, index) => (
          <button
            key={label}
            onClick={() => {
              setActiveTab(index);
              // filterLeaveRequests();
            }}
            className={activeTab === index ? "button active" : "button"}
          >
            {label}
          </button>
        ))}
      </div>
      <div>
        <table className="leaves-table">
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Duration</th>
              <th>Start date</th>
              <th>End date</th>
              <th>Leave type</th>
              <th>Reason</th>
              {activeTab === 0 && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((leave) => (
              <tr key={leave.leave_taken_id}>
                <td>{leave.employee.employee_code}</td>
                <td>{leave.employee.employee_name}</td>
                <td>{leave.duration}</td>
                <td>
                  {leave.start_date
                    ? format(new Date(leave.start_date), "dd-MMM-yyyy")
                    : ""}
                </td>
                <td>
                  {leave.end_date
                    ? format(new Date(leave.end_date), "dd-MMM-yyyy")
                    : ""}
                </td>
                <td>{leave.leave_type}</td>
                <td>{leave.reason}</td>
                {activeTab === 0 && (
                  <td>
                    <img
                      src="\src\assets\approve.png"
                      alt="approve button"
                      className="leavebutton"
                      onClick={() => handleApprove(leave.leave_taken_id)}
                    />
                    <img
                      src="\src\assets\reject.png"
                      alt="reject button"
                      className="leavebutton"
                      onClick={() => handleReject(leave.leave_taken_id)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

export default ManagerLeaveRequests;
