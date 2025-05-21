import React, { useState, useEffect } from "react";
import config from "../../config";
import { format } from "date-fns";

const ManagerCompoff = () => {
  const tabLabels = ["Pending", "Approved", "Rejected"];
  const [activeTab, setActiveTab] = useState(0);
  const [compOffRequests, setCompOffRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    fetchCompOffRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [compOffRequests, activeTab]);

  const fetchCompOffRequests = async () => {
    try {
      // const response = await fetch(`${config.apiBaseURL}/compoff-requests/`);
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

      {/* Table Content */}
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
                <tr key={req.id}>
                  <td>{req.employee?.employee_code || "--"}</td>
                  <td>{req.employee?.employee_name || "--"}</td>
                  <td>
                    {req.date ? format(new Date(req.date), "dd-MMM-yyyy") : ""}
                  </td>
                  <td>{req.reason || "--"}</td>
                  <td>{req.status}</td>
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
