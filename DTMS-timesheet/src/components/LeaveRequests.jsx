// src\components\LeaveRequests.jsx

import { useEffect, useState } from "react";

import { useAuth } from "../AuthContext";
import config from "../config";

import LeaveRequestForm from "./LeaveRequestForm";
import { format, parse } from "date-fns";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../constants/Toastify";

const LeaveRequests = () => {
  const { user } = useAuth();

  const [leaveSummary, setLeaveSummary] = useState({
    sick: 0,
    casual: 0,
    compOff: 0,
    // earned: 0,
    lop: 0,
  });
  const [isSending, setIsSending] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentLeaveRequests = leaveRequests.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
  const totalPages = Math.ceil(leaveRequests.length / rowsPerPage);
  const [showDropdowns, setShowDropdowns] = useState({});

  useEffect(() => {
    fetchLeaveSummary();
    fetchLeaveRequests();
  }, []);

  const fetchLeaveSummary = async () => {
    const year = new Date().getFullYear();
    try {
      const response = await fetch(
        `${config.apiBaseURL}/leaves-available-lop/${user.employee_id}/?year=${year}`
      );
      const data = await response.json();

      // Find summary for the logged-in employee
      const employeeSummary = data;
      // console.log("employee leave", employeeSummary);
      if (employeeSummary) {
        setLeaveSummary({
          sick: employeeSummary.sick_leave,
          casual: employeeSummary.casual_leave,
          compOff: employeeSummary.comp_off,
          // earned: employeeSummary.earned_leave,
          lop: employeeSummary.lop,
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
      data.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
      setLeaveRequests(data);
    } catch (err) {
      console.error("Error fetching leave requests", err);
    }
  };

  const handleDelete = async (
    leave_taken_id,
    leaveTypeKey,
    duration,
    employee_id,
    compoff_request_id
  ) => {
    setIsSending(true);

    try {
      const response = await fetch(
        `${config.apiBaseURL}/leaves-taken/${leave_taken_id}/`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating leave: ${response.statusText}`);
      }

      console.log("Leave rejected successfully");
      showSuccessToast("Leave deleted successfully");
      await patchLeaveAvailability(leaveTypeKey, duration, employee_id);
      if (leaveTypeKey === "comp_off" && compoff_request_id) {
        await handleStatusUpdate(compoff_request_id, "approved");
      }
      fetchLeaveRequests(); // Refresh the leave requests after rejection
      fetchLeaveSummary();
    } catch (error) {
      console.error("Error rejecting leave", error);
      showErrorToast("Error deleting leave", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setIsSending(true);
    try {
      // Step 1: PATCH status of comp-off request
      const statusResponse = await fetch(
        `${config.apiBaseURL}/comp-off-request/${id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!statusResponse.ok) {
        showErrorToast("Failed to update comp-off request status");
        return;
      }
    } catch (error) {
      console.error("Error updating comp-off status", error);
      alert("Something went wrong while updating status.");
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

  const keyMap = {
    Sick: "sick",
    Casual: "casual",
    "Comp off": "compOff",
    // Earned: "earned",
    LOP: "lop",
  };

  return (
    <div className="team-lead-container">
      <h2 className="team-lead-title">Leave Application</h2>

      {/* Conditionally Render Form or Summary + Table */}
      <div>
        {!selectedLeaveType ? (
          <>
            {/* Leave Summary Boxes */}
            <div className="leave-summary-container">
              {["Sick", "Casual", "Comp off", "LOP"].map((type, idx) => {
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
                      {parseFloat(leaveSummary[key]).toFixed(1) ?? 0}
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
                  <th>Comp-Off Date</th>
                  <th>Reason(s)</th>
                  <th>Status</th>
                  <th>Attachment</th>
                </tr>
              </thead>
              <tbody>
                {currentLeaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No Leaves taken.
                    </td>
                  </tr>
                ) : (
                  currentLeaveRequests.map((request, idx) => (
                    <tr key={idx}>
                      <td>
                        {request.leave_type === "earned_leave"
                          ? "Earned Leave"
                          : request.leave_type === "comp_off"
                          ? "Comp Off"
                          : request.leave_type === "casual_leave"
                          ? "Casual Leave"
                          : request.leave_type === "sick_leave"
                          ? "Sick Leave"
                          : request.leave_type === "lop"
                          ? "LOP"
                          : ""}
                      </td>
                      <td>{request.duration}</td>
                      <td>
                        {request.start_date
                          ? format(new Date(request.start_date), "dd-MMM-yyyy")
                          : ""}
                      </td>
                      <td>
                        {request.end_date
                          ? format(new Date(request.end_date), "dd-MMM-yyyy")
                          : ""}
                      </td>
                      <td>
                        {request.comp_off_date
                          ? format(
                              new Date(request.comp_off_date),
                              "dd-MMM-yyyy"
                            )
                          : "-"}
                      </td>
                      <td>{request.reason}</td>
                      <td>
                        {request.status === "pending" ? (
                          <span>
                            {request.status}
                            <i
                              className="fas fa-trash-alt"
                              onClick={() =>
                                handleDelete(
                                  request.leave_taken_id,
                                  request.leave_type,
                                  request.duration,
                                  request.employee,
                                  request.comp_off
                                )
                              }
                              style={{ cursor: "pointer", marginLeft: "5px" }}
                              disabled={isSending}
                            ></i>
                          </span>
                        ) : (
                          request.status
                        )}
                      </td>
                      <td>
                        {request.attachments &&
                        request.attachments.length > 1 ? (
                          <div>
                            {!showDropdowns[request.id] ? (
                              <button
                                onClick={() =>
                                  setShowDropdowns((prev) => ({
                                    ...prev,
                                    [request.id]: true,
                                  }))
                                }
                                className="view-attachments-button"
                              >
                                View Attachments
                                {/* ({request.attachments.length}) */}
                              </button>
                            ) : (
                              <select
                                onChange={(e) => {
                                  const url = e.target.value;
                                  if (url) window.open(url, "_blank");
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: "10px",
                                  border: "1px solid #ccc",
                                  backgroundColor: "#f9f9f9",
                                  fontSize: "13px",
                                }}
                              >
                                {request.attachments.map((file) => {
                                  const fullFilename = file.file
                                    .split("/")
                                    .pop();
                                  const match = fullFilename.match(
                                    /^(.+?)_[a-zA-Z0-9]+\.(\w+)$/
                                  );
                                  const filename = match
                                    ? `${match[1]}.${match[2]}`
                                    : fullFilename;
                                  return (
                                    <option
                                      key={file.id}
                                      value={config.apiBaseURL + file.file}
                                    >
                                      {filename}
                                    </option>
                                  );
                                })}
                              </select>
                            )}
                          </div>
                        ) : request.attachments &&
                          request.attachments.length === 1 ? (
                          <div className="attachment-items">
                            <a
                              href={
                                config.apiBaseURL + request.attachments[0].file
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="attachment-items"
                              style={{ color: "black" }}
                            >
                              {(() => {
                                const fullFilename = request.attachments[0].file
                                  .split("/")
                                  .pop();
                                const match = fullFilename.match(
                                  /^(.+?)_[a-zA-Z0-9]+\.(\w+)$/
                                );
                                return match
                                  ? `${match[1]}.${match[2]}`
                                  : fullFilename;
                              })()}
                            </a>
                          </div>
                        ) : (
                          <span style={{ color: "#888" }}>No attachments</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <img
                  src="/app2/left.png"
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
                  src="/app2/right.png"
                  alt="Previous"
                  style={{ width: 10, height: 12 }}
                />
              </button>
            </div>
            <ToastContainerComponent />
          </>
        ) : (
          <LeaveRequestForm
            leaveType={selectedLeaveType}
            onClose={() => {
              setSelectedLeaveType(null);
              fetchLeaveRequests();
              fetchLeaveSummary();
            }} // Go back to boxes + table when closed
          />
        )}
      </div>
    </div>
  );
};

export default LeaveRequests;
