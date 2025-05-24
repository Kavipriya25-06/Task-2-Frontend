import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import TeamLeadLeaveRequestForm from "./TeamLeadLeaveRequestForm";
import { format } from "date-fns";

const TeamLeadLeaveRequests = () => {
  const { user } = useAuth();
  const [leaveAttachments, setLeaveAttachments] = useState({});

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
  const currentLeaveRequests = leaveRequests.slice(
    indexOfFirstRow,
    indexOfLastRow
  );
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

      // Fetch attachments per leave_taken_id
      const attachmentsByLeave = {};

      await Promise.all(
        data.map(async (request) => {
          const leaveId = request.leave_taken_id; // or request.id if backend returns "id"
          if (leaveId) {
            try {
              const res = await fetch(
                `${config.apiBaseURL}/attachments/leavestaken/${leaveId}/`
              );
              if (res.ok) {
                const files = await res.json();
                attachmentsByLeave[leaveId] = files;
              }
            } catch (err) {
              console.error(`Failed to fetch attachment for ${leaveId}`, err);
            }
          }
        })
      );

      setLeaveAttachments(attachmentsByLeave);
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
      <div>
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
                      {leaveAttachments[request.leave_taken_id]?.length > 0 ? (
                        leaveAttachments[request.leave_taken_id].map(
                          (fileObj, i) => (
                            <a
                              key={i}
                              href={`${config.apiBaseURL}${fileObj.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "block" }}
                            >
                              View
                            </a>
                          )
                        )
                      ) : (
                        <span>No File</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <TeamLeadLeaveRequestForm
            leaveType={selectedLeaveType}
            onClose={() => setSelectedLeaveType(null)} // Go back to boxes + table when closed
          />
        )}
      </div>
      {/* <div className="pagination-controls">
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
      </div> */}
    </div>
  );
};

export default TeamLeadLeaveRequests;
