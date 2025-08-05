// src\pages\Manager\ManagerLeaveRequests.jsx

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAttachmentManager } from "../../constants/useAttachmentManager";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const ManagerLeaveRequests = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredLeaveRequests, setFilteredLeaveRequests] = useState([]);
  const tabLabels = ["Pending", "Approved", "Rejected"];
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredLeaveRequests.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalPages = Math.ceil(filteredLeaveRequests.length / rowsPerPage);
  const { attachments, setAttachments } = useAttachmentManager([]);
  const [isSending, setIsSending] = useState(false);

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
      console.log("Leave requests", data);
    } catch (err) {
      console.log("Unable to fetch leave requests", err);
    }
  };

  const filterLeaveRequests = () => {
    const statusFilter = tabLabels[activeTab].toLowerCase();
    const filteredData = leaveRequests
      .filter((leave) => leave.status.toLowerCase() === statusFilter)
      .sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
    setFilteredLeaveRequests(filteredData);
    setCurrentPage(1);
  };

  const handleApprove = async (leave_taken_id) => {
    // e.preventDefault();
    const leaveUpdate = {
      status: "approved",
      approved_by: user.employee_id,
    };
    setIsSending(true);

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
      showSuccessToast("Leave approved successfully");
    } catch (error) {
      console.error("Error updating user", error);
      showErrorToast("Error updating user", error);
    } finally {
      setIsSending(false);
    }
  };
  const handleReject = async (
    leave_taken_id,
    leaveTypeKey,
    duration,
    employee_id
  ) => {
    setIsSending(true);
    const leaveUpdate = {
      status: "rejected",
      approved_by: user.employee_id,
    };

    const balanceUpdate = {
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
      showSuccessToast("Leave rejected successfully");
      await patchLeaveAvailability(leaveTypeKey, duration, employee_id);
      fetchLeaveRequests(); // Refresh the leave requests after rejection
    } catch (error) {
      console.error("Error rejecting leave", error);
      showErrorToast("Error rejecting leave", error);
    } finally {
      setIsSending(false);
    }
  };

  const patchLeaveAvailability = async (
    leaveTypeKey,
    duration,
    employee_id
  ) => {
    const patchURL = `${config.apiBaseURL}/leaves-available/by_employee/${employee_id}/`;

    try {
      // Step 1: Fetch current available leave
      const res = await fetch(patchURL);
      const currentData = await res.json();

      const currentLeave = parseFloat(currentData[leaveTypeKey] || 0);
      const newLeaveBalance = currentLeave + parseFloat(duration);

      // Step 2: Patch with updated value
      const patchRes = await fetch(patchURL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [leaveTypeKey]: newLeaveBalance }),
      });

      if (!patchRes.ok) {
        const err = await patchRes.json();
        console.error("Leave availability update failed:", err);
      }
    } catch (err) {
      console.error("Error patching leave availability:", err);
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
        <div className="leaves-table-container">
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
                <th style={{ width: "120px" }}>Attachments</th>
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
                  <td>
                    {leave.leave_type === "earned_leave"
                      ? "Earned Leave"
                      : leave.leave_type === "comp_off"
                      ? "Comp Off"
                      : leave.leave_type === "casual_leave"
                      ? "Casual Leave"
                      : leave.leave_type === "sick_leave"
                      ? "Sick Leave"
                      : leave.leave_type === "lop"
                      ? "LOP"
                      : ""}
                  </td>
                  <td>{leave.reason}</td>
                  {activeTab === 0 && (
                    <td>
                      <img
                        src="/approve.png"
                        alt="approve button"
                        className="leavebutton"
                        onClick={() => handleApprove(leave.leave_taken_id)}
                        disabled={isSending}
                      />
                      <img
                        src="/reject.png"
                        alt="reject button"
                        className="leavebutton"
                        onClick={() =>
                          handleReject(
                            leave.leave_taken_id,
                            leave.leave_type,
                            leave.duration,
                            leave.employee.employee_id
                          )
                        }
                        disabled={isSending}
                      />
                    </td>
                  )}
                  <td>
                    <ul className="attachments-list">
                      {/* Existing attachments */}
                      {leave.attachments && leave.attachments.length > 0 ? (
                        leave.attachments?.map((file) => {
                          const fullFilename = file.file.split("/").pop();
                          const match = fullFilename.match(
                            /^(.+?)_[a-zA-Z0-9]+\.(\w+)$/
                          );
                          const filename = match
                            ? `${match[1]}.${match[2]}`
                            : fullFilename;

                          return (
                            <li key={file.id} className="attachment-item">
                              <a
                                href={config.apiBaseURL + file.file}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {filename}
                              </a>
                            </li>
                          );
                        })
                      ) : (
                        <li className="no-attachment">No attachments</li>
                      )}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <img
            src="/left.png"
            alt="Previous"
            style={{ width: 10, height: 12 }}
          />
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          <img
            src="/right.png"
            alt="Previous"
            style={{ width: 10, height: 12 }}
          />
        </button>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerLeaveRequests;
