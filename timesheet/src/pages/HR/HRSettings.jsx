import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";

const HRSettings = () => {
  const [compOffData, setCompOffData] = useState({
    half_day: { min_hours: "", max_hours: "" },
    full_day: { min_hours: "", max_hours: "" },
  });

  const [loading, setLoading] = useState(true);

  const fetchCompOffSettings = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/comp-off/`);
      const data = await response.json();

      let half_day = data.find((d) => d.leave_type === "half_day");
      let full_day = data.find((d) => d.leave_type === "full_day");

      setCompOffData({
        half_day: {
          min_hours: half_day?.min_hours === 0 || half_day?.min_hours === "0.00" ? "" : half_day?.min_hours || "",
          max_hours: half_day?.max_hours === 0 || half_day?.max_hours === "0.00" ? "" : half_day?.max_hours || "",
          id: half_day?.id,
        },
        full_day: {
          min_hours: full_day?.min_hours === 0 || full_day?.min_hours === "0.00" ? "" : full_day?.min_hours || "",
          max_hours: full_day?.max_hours === 0 || full_day?.max_hours === "0.00" ? "" : full_day?.max_hours || "",
          id: full_day?.id,
        },
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching comp-off settings", err);
    }
  };

  useEffect(() => {
    fetchCompOffSettings();
  }, []);

  const handleInputChange = (type, field, value) => {
    // Allow only numbers, limit to 2 digits, and max value of 12
    const sanitized = value.replace(/[^0-9]/g, "").slice(0, 2);
    const numeric = sanitized ? Math.min(parseInt(sanitized, 10), 12) : "";
    setCompOffData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: numeric,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      const halfDayPayload = {
        leave_type: "half_day",
        min_hours: compOffData.half_day.min_hours,
        max_hours: compOffData.half_day.max_hours,
      };

      const fullDayPayload = {
        leave_type: "full_day",
        min_hours: compOffData.full_day.min_hours,
        max_hours: compOffData.full_day.max_hours,
      };

      const halfDayMethod = compOffData.half_day.id ? "PATCH" : "POST";
      const halfDayURL = compOffData.half_day.id
        ? `${config.apiBaseURL}/comp-off/${compOffData.half_day.id}/`
        : `${config.apiBaseURL}/comp-off/`;

      await fetch(halfDayURL, {
        method: halfDayMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(halfDayPayload),
      });

      const fullDayMethod = compOffData.full_day.id ? "PATCH" : "POST";
      const fullDayURL = compOffData.full_day.id
        ? `${config.apiBaseURL}/comp-off/${compOffData.full_day.id}/`
        : `${config.apiBaseURL}/comp-off/`;

      await fetch(fullDayURL, {
        method: fullDayMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullDayPayload),
      });

      alert("Comp Off timings updated successfully!");
    } catch (err) {
      console.error("Error saving comp-off timings", err);
      alert("Failed to update comp-off timings.");
    }
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="tab-container"></div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="comp-off-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Minimum Hours</th>
              <th>Maximum Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Half Day</td>
              <td>
                <input
                  type="text"
                  inputMode="numeric"
                  value={compOffData.half_day.min_hours}
                  onChange={(e) =>
                    handleInputChange("half_day", "min_hours", e.target.value)
                  }
                  placeholder="00"
                />
              </td>
              <td>
                <input
                  type="text"
                  inputMode="numeric"
                  value={compOffData.half_day.max_hours}
                  onChange={(e) =>
                    handleInputChange("half_day", "max_hours", e.target.value)
                  }
                  placeholder="00"
                />
              </td>
            </tr>
            <tr>
              <td>Full Day</td>
              <td>
                <input
                  type="text"
                  inputMode="numeric"
                  value={compOffData.full_day.min_hours}
                  onChange={(e) =>
                    handleInputChange("full_day", "min_hours", e.target.value)
                  }
                  placeholder="00"
                />
              </td>
              <td>
                <input
                  type="text"
                  inputMode="timedelta"
                  value={compOffData.full_day.max_hours}
                  onChange={(e) =>
                    handleInputChange("full_day", "max_hours", e.target.value)
                  }
                  placeholder="00"
                />
              </td>
            </tr>
          </tbody>
        </table>
      )}

      <button className="delete-btn" onClick={handleSubmit}>
        Save Timings
      </button>
    </div>
  );
};

export default HRSettings;
