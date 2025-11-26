// src\components\LeaveRequests.jsx

import { useEffect, useState } from "react";

import { useAuth } from "../AuthContext";
import config from "../config";
import confirm from "../constants/ConfirmDialog";
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

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [leaveBalance, setLeaveBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

  const openLeaveModal = async (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);

    setLeaveBalance(null);
    setBalanceError(null);
    setBalanceLoading(true);

    try {
      const employeeId = leave?.employee?.employee_id;
      if (!employeeId) throw new Error("Employee ID missing");

      // year from start_date
      const leaveYear = leave?.start_date
        ? new Date(leave.start_date).getFullYear()
        : new Date().getFullYear();

      // current month (1–12)
      const currentMonth = new Date().getMonth() + 1;

      const url = `${config.apiBaseURL}/leave/opening-monthly/${employeeId}/${leaveYear}/?month=${currentMonth}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch leave balance");

      const data = await res.json();
      setLeaveBalance(data);
    } catch (err) {
      console.error(err);
      setBalanceError(err.message || "Balance fetch error");
    } finally {
      setBalanceLoading(false);
    }
  };

  const closeLeaveModal = () => {
    setSelectedLeave(null);
    setIsModalOpen(false);
    setLeaveBalance(null);
    setBalanceError(null);
    setBalanceLoading(false);
  };

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

  const handleRevoke = async (leave_taken_id) => {
    const confirmPatch = await confirm({
      message: `Are you sure you want to revoke this leave ?`,
    });
    if (!confirmPatch) return;
    setIsSending(true);
    try {
      const res = await fetch(
        `${config.apiBaseURL}/leaves-taken/${leave_taken_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "pending" }),
        }
      );

      if (!res.ok) throw new Error("Revoke failed");

      showSuccessToast("Leave revoked and moved to pending");
      fetchLeaveRequests();
      fetchLeaveSummary();
      closeLeaveModal();
    } catch (err) {
      console.error(err);
      showErrorToast("Error revoking leave");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (
    leave_taken_id,
    leaveTypeKey,
    duration,
    employee_id,
    compoff_request_id
  ) => {
    const confirmPatch = await confirm({
      message: `Are you sure you want to delete this leave ?`,
    });
    if (!confirmPatch) return;
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
      closeLeaveModal();
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
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No Leaves taken.
                    </td>
                  </tr>
                ) : (
                  currentLeaveRequests.map((request, idx) => (
                    <tr
                      key={request.leave_taken_id}
                      className="leave-row"
                      onClick={() => openLeaveModal(request)}
                      style={{ cursor: "pointer" }}
                    >
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
                        {/* {request.status === "pending" ? (
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
                        )} */}
                        {request.status}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
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
            {isModalOpen && selectedLeave && (
              <div className="modal-overlay" onClick={closeLeaveModal}>
                <div
                  className="modal-card"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <h3>Leave Details</h3>
                    <button className="modal-close" onClick={closeLeaveModal}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="modal-grid">
                      <div>
                        <strong>Employee Code:</strong>{" "}
                        {selectedLeave.employee?.employee_code}
                      </div>
                      <div>
                        <strong>Name:</strong>{" "}
                        {selectedLeave.employee?.employee_name}{" "}
                        {selectedLeave.employee?.last_name}
                      </div>

                      <div>
                        <strong>Leave Type:</strong>{" "}
                        {selectedLeave.leave_type === "earned_leave"
                          ? "Earned Leave"
                          : selectedLeave.leave_type === "comp_off"
                          ? "Comp Off"
                          : selectedLeave.leave_type === "casual_leave"
                          ? "Casual Leave"
                          : selectedLeave.leave_type === "sick_leave"
                          ? "Sick Leave"
                          : selectedLeave.leave_type === "lop"
                          ? "LOP"
                          : ""}
                      </div>

                      <div>
                        <strong>Status:</strong> {selectedLeave.status}
                      </div>
                      <div>
                        <strong>Duration:</strong> {selectedLeave.duration}
                      </div>

                      <div>
                        <strong>Start Date:</strong>{" "}
                        {selectedLeave.start_date
                          ? format(
                              new Date(selectedLeave.start_date),
                              "dd-MMM-yyyy"
                            )
                          : "-"}
                      </div>

                      <div>
                        <strong>End Date:</strong>{" "}
                        {selectedLeave.end_date
                          ? format(
                              new Date(selectedLeave.end_date),
                              "dd-MMM-yyyy"
                            )
                          : "-"}
                      </div>

                      <div>
                        <strong>Comp-Off Date:</strong>{" "}
                        {selectedLeave.comp_off_date
                          ? format(
                              new Date(selectedLeave.comp_off_date),
                              "dd-MMM-yyyy"
                            )
                          : "-"}
                      </div>

                      <div>
                        <strong>Resumption Date:</strong>{" "}
                        {selectedLeave.resumption_date
                          ? format(
                              new Date(selectedLeave.resumption_date),
                              "dd-MMM-yyyy"
                            )
                          : "-"}
                      </div>

                      <div>
                        <strong>Created At:</strong>{" "}
                        {selectedLeave.created_at
                          ? format(
                              new Date(selectedLeave.created_at),
                              "dd-MMM-yyyy, hh:mm a"
                            )
                          : "-"}
                      </div>

                      <div>
                        <strong>Updated At:</strong>{" "}
                        {selectedLeave.updated_at
                          ? format(
                              new Date(selectedLeave.updated_at),
                              "dd-MMM-yyyy, hh:mm a"
                            )
                          : "-"}
                      </div>

                      <div>
                        <strong>
                          {selectedLeave.status === "approved"
                            ? "Approved By:"
                            : selectedLeave.status === "rejected"
                            ? "Rejected by"
                            : "Pending approval"}
                        </strong>{" "}
                        {selectedLeave.approved_by
                          ? `${selectedLeave.approved_by.employee_name} ${selectedLeave.approved_by.last_name} (${selectedLeave.approved_by.employee_code})`
                          : "-"}
                      </div>

                      <div className="modal-reason">
                        <strong>Reason:</strong>
                        <p>{selectedLeave.reason || "-"}</p>
                      </div>

                      {selectedLeave.status === "rejected" && (
                        <div>
                          <strong>Rejected reason:</strong>{" "}
                          {selectedLeave.rejection_reason || "-"}
                        </div>
                      )}
                    </div>

                    {/* Attachments */}
                    <div className="modal-attachments">
                      <strong>Attachments:</strong>
                      <ul>
                        {selectedLeave.attachments &&
                        selectedLeave.attachments.length > 0 ? (
                          selectedLeave.attachments.map((file) => {
                            const fullFilename = file.file.split("/").pop();
                            const match = fullFilename.match(
                              /^(.+?)_[a-zA-Z0-9]+\.(\w+)$/
                            );
                            const filename = match
                              ? `${match[1]}.${match[2]}`
                              : fullFilename;

                            return (
                              <li key={file.id}>
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
                          <li>No attachments</li>
                        )}
                      </ul>
                    </div>

                    {/* Leave Balance */}
                    {/* <div className="modal-balance">
                      <strong>Leave Balance (Current Month):</strong>

                      {balanceLoading && <p>Loading balance...</p>}
                      {balanceError && (
                        <p style={{ color: "red" }}>{balanceError}</p>
                      )}

                      {!balanceLoading && !balanceError && leaveBalance && (
                        <div className="balance-grid">
                          <div>
                            <span>Casual Remaining:</span>
                            <b>{leaveBalance.casual_leave_remaining}</b>
                          </div>
                          <div>
                            <span>Sick Remaining:</span>
                            <b>{leaveBalance.sick_leave_remaining}</b>
                          </div>
                          <div>
                            <span>Earned Remaining:</span>
                            <b>{leaveBalance.earned_leave_remaining}</b>
                          </div>
                          <div>
                            <span>Comp-Off Remaining:</span>
                            <b>{leaveBalance.comp_off_remaining}</b>
                          </div>
                          <div>
                            <span>LOP Availed:</span>
                            <b>{leaveBalance.lop_availed}</b>
                          </div>
                        </div>
                      )}
                    </div> */}
                  </div>

                  {/* Footer Actions */}
                  <div className="modal-footer">
                    {/* Pending => Delete */}
                    {selectedLeave.status === "pending" && (
                      <button
                        className="reject-btn"
                        disabled={isSending}
                        onClick={() =>
                          handleDelete(
                            selectedLeave.leave_taken_id,
                            selectedLeave.leave_type,
                            selectedLeave.duration,
                            selectedLeave.employee?.employee_id, // FIXED
                            selectedLeave.comp_off // compoff_request_id
                          )
                        }
                      >
                        Delete
                      </button>
                    )}

                    {/* Approved => Revoke */}
                    {selectedLeave.status === "approved" && (
                      <button
                        className="approve-btn"
                        disabled={isSending}
                        onClick={() =>
                          handleRevoke(selectedLeave.leave_taken_id)
                        }
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

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
