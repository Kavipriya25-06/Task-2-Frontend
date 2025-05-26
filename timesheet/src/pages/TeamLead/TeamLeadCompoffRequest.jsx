import React, { useEffect, useState } from "react";
import config from "../../config";
import { format } from "date-fns";
import { useAuth } from "../../AuthContext"; //  Added for employee_id

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const TeamLeadCompoffRequest = () => {
  const { user } = useAuth(); //  Get employee_id
  const [compOffData, setCompOffData] = useState([]);

  useEffect(() => {
    if (user?.employee_id) {
      fetchCompOffData(user.employee_id);
    }
  }, [user]);

  const fetchCompOffData = async (employeeId) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/comp-off-view/employee/${employeeId}/`
      );
      const data = await response.json();
      setCompOffData(data);
    } catch (error) {
      console.error("Failed to fetch comp-off data", error);
    }
  };

  const handleApply = async (id) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/comp-off-request/${id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "applied" }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to apply comp-off");
      }

      showSuccessToast("Comp-off for "+user.date+" appiled successfully");
      fetchCompOffData(user.employee_id); // refresh
    } catch (error) {
      console.error("Error applying comp-off", error);
    }
  };

  return (
    <div className="leaves-container">
      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        Comp-off Request
      </h3>

      <table className="leaves-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Duration</th>
            <th>Project</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {compOffData.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No comp-off records available.
              </td>
            </tr>
          ) : (
            compOffData.map((entry) => (
              <tr key={entry.compoff_request_id}>
                <td>{format(new Date(entry.date), "dd.MM.yyyy")}</td>
                <td>{entry.duration}</td>
                <td>
                  {/* You can customize how project name is shown below */}
                  {entry.timesheets?.[0]?.task_assign?.building_assign
                    ?.project_assign?.project?.project_title || "--"}
                </td>
                <td>{format(new Date(entry.expiry_date), "dd.MM.yyyy")}</td>
                <td>{entry.status}</td>
                <td>
                  {entry.status.toLowerCase() === "eligible" && (
                    <button
                      className="apply-button"
                      onClick={() => handleApply(entry.compoff_request_id)}
                    >
                      Apply
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeamLeadCompoffRequest;
