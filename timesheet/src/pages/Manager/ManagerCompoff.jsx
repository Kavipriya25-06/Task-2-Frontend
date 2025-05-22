import React, { useState, useEffect } from "react";
import config from "../../config";
import { format } from "date-fns";
import { useAuth } from "../../AuthContext";

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

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/comp-off-request/${id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (response.ok) {
        fetchCompOffRequests(user.employee_id); // refresh
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating comp-off status", error);
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
                              "approved"
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
                              "rejected"
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
    </div>
  );
};

export default ManagerCompoff;
