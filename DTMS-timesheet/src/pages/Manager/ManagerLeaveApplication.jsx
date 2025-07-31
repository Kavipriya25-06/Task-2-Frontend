// src\pages\Manager\ManagerLeaveApplication.jsx

import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import ManagerLeaveRequestForm from "./ManagerLeaveRequestForm";
import { format } from "date-fns";

const ManagerLeaveApplication = () => {
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
          compOff: employeeSummary.comp_off,
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
      data.sort((a, b) => new Date(b.end_date) - new Date(a.end_date));
      setLeaveRequests(data);
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
      <div>
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

            <table className="leave-requests-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Duration(s)</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason(s)</th>
                  <th>Status</th>
                  <th>Attachment</th>
                </tr>
              </thead>
              <tbody>
                {currentLeaveRequests.map((request, idx) => (
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
                    <td>{request.reason}</td>
                    <td>{request.status}</td>
                    <td>
                      {request.attachments && request.attachments.length > 1 ? (
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
                                const fullFilename = file.file.split("/").pop();
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
                            })()}{" "}
                          </a>
                        </div>
                      ) : (
                        <span style={{ color: "#888" }}>No attachments</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <img
                  src="\DTMS\left.png"
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
                  src="\DTMS\right.png"
                  alt="Previous"
                  style={{ width: 10, height: 12 }}
                />
              </button>
            </div>
          </>
        ) : (
          <ManagerLeaveRequestForm
            leaveType={selectedLeaveType}
            onClose={() => {
              setSelectedLeaveType(null);
              fetchLeaveRequests();
              fetchLeaveSummary();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ManagerLeaveApplication;
