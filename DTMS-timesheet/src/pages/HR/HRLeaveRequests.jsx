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
                <th>Attachments</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((leave) => (
                <tr key={leave.leave_taken_id}>
                  <td>{leave.employee?.employee_code}</td>
                  <td>{leave.employee?.employee_name}</td>
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
                      : ""}
                  </td>
                  <td>{leave.reason}</td>

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
    </div>
  );
};

export default HRLeaveRequests;
