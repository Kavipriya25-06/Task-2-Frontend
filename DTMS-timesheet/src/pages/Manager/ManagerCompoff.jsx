// src\pages\Manager\ManagerCompoff.jsx

import React, { useState, useEffect } from "react";
import config from "../../config";
import { format } from "date-fns";
import { useAuth } from "../../AuthContext";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const ManagerCompoff = () => {
  const { user } = useAuth(); // Get logged-in manager details
  const tabLabels = ["Applied", "Approved", "Rejected"];
  const [activeTab, setActiveTab] = useState(0);
  const [compOffRequests, setCompOffRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    if (user?.employee_id) {
      fetchCompOffRequests(user.employee_id);
    }
  }, [user]);

  useEffect(() => {
    filterRequests();
  }, [compOffRequests, activeTab]);

  const fetchCompOffRequests = async (managerId) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/comp-off-manager-view/manager/${managerId}/`
      );
      const data = await response.json();
      setCompOffRequests(data);
    } catch (error) {
      console.error("Error fetching comp-off requests", error);
    }
  };

  const filterRequests = () => {
    const statusFilter = tabLabels[activeTab].toLowerCase();
    const filtered = compOffRequests.filter(
      (req) => req.status.toLowerCase() === statusFilter
    );
    setFilteredRequests(filtered);
  };

  const handleStatusUpdate = async (id, newStatus, employeeId) => {
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

      // Step 2: If approved, also update comp_off leave
      if (newStatus.toLowerCase() === "approved") {
        const leaveURL = `${config.apiBaseURL}/leaves-available/by_employee/${employeeId}/`;

        // Fetch current leave availability
        const leaveRes = await fetch(leaveURL);
        const leaveData = await leaveRes.json();

        const currentCompOff = parseFloat(leaveData.comp_off || 0);
        const updatedCompOff = currentCompOff + 1;

        // PATCH with updated comp_off
        await fetch(leaveURL, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comp_off: updatedCompOff }),
        });

        showSuccessToast("Comp-Off request approved.");
      } else if (newStatus.toLowerCase() === "rejected") {
        showSuccessToast("Comp-Off request rejected.");
      }

      // Step 3: Refresh table
      fetchCompOffRequests(user.employee_id);
    } catch (error) {
      console.error("Error updating comp-off status", error);
      alert("Something went wrong while updating status.");
    }
  };

  return (
    <div className="leaves-container">
      {/* Tabs */}
      <div className="leaves-tab">
        {tabLabels.map((label, index) => (
          <button
            key={label}
            onClick={() => setActiveTab(index)}
            className={activeTab === index ? "button active" : "button"}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div>
        <table className="leaves-table">
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Date</th>
              <th>Number of Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No {tabLabels[activeTab]} comp-off requests.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.compoff_request_id}>
                  <td>{req.employee?.employee_code || "--"}</td>
                  <td>{req.employee?.employee_name || "--"}</td>
                  <td>
                    {req.date
                      ? format(new Date(req.date), "dd-MMM-yyyy")
                      : "--"}
                  </td>
                  <td>{req.timesheet_count}</td>
                  <td>
                    {req.status.toLowerCase() === "applied" ? (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() =>
                            handleStatusUpdate(
                              req.compoff_request_id,
                              "approved",
                              req.employee?.employee_id
                            )
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() =>
                            handleStatusUpdate(
                              req.compoff_request_id,
                              "rejected",
                              req.employee?.employee_id
                            )
                          }
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      req.status
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerCompoff;
