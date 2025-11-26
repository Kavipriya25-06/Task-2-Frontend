// src\pages\HR\HRLeaveRequests.jsx

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

const HRLeaveRequests = () => {
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

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    filterLeaveRequests();
  }, [leaveRequests, activeTab]);

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState(null);

  const openLeaveModal = async (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);

    // reset old balance state
    setLeaveBalance(null);
    setBalanceError(null);
    setBalanceLoading(true);

    try {
      const employeeId = leave.employee?.employee_id;
      if (!employeeId) throw new Error("Employee ID missing");

      // year from leave start_date, fallback to current year
      const leaveYear = leave.start_date
        ? new Date(leave.start_date).getFullYear()
        : new Date().getFullYear();

      // current month (1–12)

      const currentMonth = leave.start_date
        ? new Date(leave.start_date).getMonth() + 1
        : new Date().getMonth() + 1;
      // const currentMonth = new Date().getMonth() + 1;

      const url = `${config.apiBaseURL}/leave/opening-monthly/${employeeId}/${leaveYear}/?month=${currentMonth}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch leave balance");

      const data = await res.json();
      setLeaveBalance(data);
    } catch (err) {
      console.error("Balance fetch error:", err);
      setBalanceError(err.message || "Error fetching leave balance");
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

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/leave-request/`);
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
                <th>Last Name</th>
                <th>Duration</th>
                <th>Start date</th>
                <th>End date</th>
                <th>Comp-Off date</th>
                <th>Leave type</th>
                <th>Reason</th>
                <th>Attachments</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: "center" }}>
                    No {tabLabels[activeTab]} Leave records available.
                  </td>
                </tr>
              ) : (
                currentRows.map((leave) => (
                  <tr
                    key={leave.leave_taken_id}
                    className="leave-row"
                    onClick={() => openLeaveModal(leave)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{leave.employee?.employee_code}</td>
                    <td>{leave.employee?.employee_name}</td>
                    <td>{leave.employee?.last_name}</td>
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
                      {leave.comp_off_date
                        ? format(new Date(leave.comp_off_date), "dd-MMM-yyyy")
                        : "-"}
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
                    <td onClick={(e) => e.stopPropagation()}>
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
                ))
              )}
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
      {/* Leave Details Modal (works for all tabs) */}
      {isModalOpen && selectedLeave && (
        <div className="modal-overlay" onClick={closeLeaveModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave Request Details</h3>
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
                  <strong>Name:</strong> {selectedLeave.employee?.employee_name}{" "}
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
                  <strong>Duration:</strong> {selectedLeave.duration}
                </div>

                <div>
                  <strong>Start Date:</strong>{" "}
                  {selectedLeave.start_date
                    ? format(new Date(selectedLeave.start_date), "dd-MMM-yyyy")
                    : "-"}
                </div>

                <div>
                  <strong>End Date:</strong>{" "}
                  {selectedLeave.end_date
                    ? format(new Date(selectedLeave.end_date), "dd-MMM-yyyy")
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

                {/* NEW: Resumption Date */}
                <div>
                  <strong>Resumption Date:</strong>{" "}
                  {selectedLeave.resumption_date
                    ? format(
                        new Date(selectedLeave.resumption_date),
                        "dd-MMM-yyyy"
                      )
                    : "-"}
                </div>

                {/* NEW: Created At */}
                <div>
                  <strong>Created At:</strong>{" "}
                  {selectedLeave.created_at
                    ? format(
                        new Date(selectedLeave.created_at),
                        "dd-MMM-yyyy, hh:mm a"
                      )
                    : "-"}
                </div>

                {/* NEW: Updated At */}
                <div>
                  <strong>Updated At:</strong>{" "}
                  {selectedLeave.updated_at
                    ? format(
                        new Date(selectedLeave.updated_at),
                        "dd-MMM-yyyy, hh:mm a"
                      )
                    : "-"}
                </div>

                {/* NEW: Approved By */}
                <div>
                  <strong>
                    {activeTab === 1
                      ? "Approved By:"
                      : activeTab === 2
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

                {activeTab === 2 && (
                  <div>
                    <strong>Rejected reason:</strong>{" "}
                    {selectedLeave.rejection_reason || "-"}
                  </div>
                )}
              </div>

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
              {/* Leave Balance Section */}
              <div className="modal-balance">
                <strong>Leave Balance (Current Month):</strong>

                {balanceLoading && <p>Loading balance...</p>}

                {balanceError && <p style={{ color: "red" }}>{balanceError}</p>}

                {!balanceLoading && !balanceError && leaveBalance && (
                  <div className="balance-grid">
                    <div>
                      <span>Casual Leave Remaining:</span>
                      <b>{leaveBalance.casual_leave_remaining}</b>
                    </div>
                    <div>
                      <span>Sick Leave Remaining:</span>
                      <b>{leaveBalance.sick_leave_remaining}</b>
                    </div>
                    {/* <div>
                      <span>Earned Leave Remaining:</span>
                      <b>{leaveBalance.earned_leave_remaining}</b>
                    </div> */}
                    <div>
                      <span>Comp-Off Remaining:</span>
                      <b>{leaveBalance.comp_off_remaining}</b>
                    </div>
                    {/* <div>
                      <span>LOP Availed:</span>
                      <b>{leaveBalance.lop_availed}</b>
                    </div> */}
                  </div>
                )}

                {!balanceLoading && !balanceError && !leaveBalance && (
                  <p>No balance data available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainerComponent />
    </div>
  );
};

export default HRLeaveRequests;
