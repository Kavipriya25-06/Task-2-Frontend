import React, { useEffect, useState } from "react";
import config from "../../config"; // adjust if needed
import { format } from "date-fns";

const EmployeeCompoffRequest = () => {
  const [compOffData, setCompOffData] = useState([]);

  useEffect(() => {
    fetchCompOffData();
  }, []);

  const fetchCompOffData = async () => {
    try {
      const response = await fetch(
        // `${config.apiBaseURL}/comp-off-eligibility/`
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
        // `${config.apiBaseURL}/comp-off-apply/${id}/`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to apply comp-off");
      }

      alert("Comp-off applied successfully!");
      fetchCompOffData(); // refresh
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
              <tr key={entry.id}>
                <td>{format(new Date(entry.date), "dd.MM.yyyy")}</td>
                <td>{entry.duration}</td>
                <td>{entry.project_name}</td>
                <td>{format(new Date(entry.expiry_date), "dd.MM.yyyy")}</td>
                <td>{entry.status}</td>
                <td>
                  {entry.status.toLowerCase() === "eligible" && (
                    <button
                      className="apply-button"
                      onClick={() => handleApply(entry.id)}
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

export default EmployeeCompoffRequest;
