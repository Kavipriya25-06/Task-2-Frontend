/// src\pages\HR\HRSettings.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import EditableTimeField from "../../constants/EditableTimeField";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const HRSettings = () => {
  const [compOffData, setCompOffData] = useState({
    half_day: { min_hours: "", max_hours: "" },
    full_day: { min_hours: "", max_hours: "" },
  });
  const [compOffExpiry, setCompOffExpiry] = useState({
    id: "",
    days_to_expire: "",
    name: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchCompOffSettings = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/comp-off/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch with status ${response.status}`);
      }
      const data = await response.json();

      const formatDecimalToTime = (dec) => {
        if (!dec) return "";
        const hours = Math.floor(dec);
        const minutes = Math.round((dec - hours) * 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}`;
      };

      let half_day = data.find((d) => d.leave_type === "half_day");
      let full_day = data.find((d) => d.leave_type === "full_day");

      setCompOffData({
        half_day: {
          min_hours: formatDecimalToTime(half_day?.min_hours) || "",
          max_hours: formatDecimalToTime(half_day?.max_hours) || "",
          id: half_day?.id,
        },
        full_day: {
          min_hours: formatDecimalToTime(full_day?.min_hours) || "",
          max_hours: formatDecimalToTime(full_day?.max_hours) || "",
          id: full_day?.id,
        },
      });

      setLoading(false);
    } catch (err) {
      console.error("Error fetching comp-off settings", err);
    }
  };

  const fetchCompOffExpiry = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/comp-off-expiry/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch with status ${response.status}`);
      }
      const data = await response.json();
      let expiry = data.find((d) => d.name === "expiry");
      setCompOffExpiry(expiry);
      // console.log("Comp off expiry", expiry);
    } catch (error) {
      console.error("Error fetching comp-off settings", error);
    }
  };

  useEffect(() => {
    fetchCompOffSettings();
    fetchCompOffExpiry();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompOffExpiry((prev) => ({ ...prev, [name]: value }));
    // console.log("Form data", compOffExpiry);
  };

  const handleInputChange = (type, field, value) => {
    setCompOffData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };

  const timeToDecimal = (timeStr) => {
    if (!timeStr || !timeStr.includes(":")) return 0;
    const [hh, mm] = timeStr.split(":").map(Number);
    return parseFloat((hh + mm / 60).toFixed(2));
  };

  const handleSubmit = async () => {
    try {
      const halfMin = timeToDecimal(compOffData.half_day.min_hours);
      const halfMax = timeToDecimal(compOffData.half_day.max_hours);
      const fullMin = timeToDecimal(compOffData.full_day.min_hours);
      const fullMax = timeToDecimal(compOffData.full_day.max_hours);
      const expiry_days = parseFloat(compOffExpiry.days_to_expire || 0);

      if (halfMin >= halfMax) {
        showErrorToast(
          "For Half Day, Minimum hours should be less than Maximum hours."
        );
        return;
      }

      if (fullMin <= halfMax) {
        showErrorToast(
          "Full Day Minimum hours should be greater than Half Day Maximum hours."
        );
        return;
      }

      if (fullMin >= fullMax) {
        showErrorToast(
          "For Full Day, Minimum hours should be less than Maximum hours."
        );
        return;
      }

      // Payloads
      const halfDayPayload = {
        leave_type: "half_day",
        min_hours: halfMin,
        max_hours: halfMax,
      };

      const fullDayPayload = {
        leave_type: "full_day",
        min_hours: fullMin,
        max_hours: fullMax,
      };

      const expiryPayload = {
        days_to_expire: expiry_days,
        name: "expiry",
      };

      // Half Day
      const halfDayMethod = compOffData.half_day.id ? "PATCH" : "POST";
      const halfDayURL = compOffData.half_day.id
        ? `${config.apiBaseURL}/comp-off/${compOffData.half_day.id}/`
        : `${config.apiBaseURL}/comp-off/`;

      await fetch(halfDayURL, {
        method: halfDayMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(halfDayPayload),
      });

      // Full Day
      const fullDayMethod = compOffData.full_day.id ? "PATCH" : "POST";
      const fullDayURL = compOffData.full_day.id
        ? `${config.apiBaseURL}/comp-off/${compOffData.full_day.id}/`
        : `${config.apiBaseURL}/comp-off/`;

      await fetch(fullDayURL, {
        method: fullDayMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullDayPayload),
      });

      // Expiry Day
      const expiryMethod = compOffExpiry.id ? "PATCH" : "POST";
      const expiryURL = compOffExpiry.id
        ? `${config.apiBaseURL}/comp-off-expiry/${compOffExpiry.id}/`
        : `${config.apiBaseURL}/comp-off-expiry/`;

      await fetch(expiryURL, {
        method: expiryMethod,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expiryPayload),
      });

      showSuccessToast("Comp Off timings updated successfully!");
    } catch (err) {
      console.error("Error saving comp-off timings", err);
      showErrorToast("Failed to update comp-off timings.");
    }
  };

  return (
    <div className="settings-container">
      <h2>Comp off Settings</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
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
                  <EditableTimeField
                    value={compOffData.half_day.min_hours}
                    onChange={(val) =>
                      handleInputChange("half_day", "min_hours", val)
                    }
                  />
                </td>
                <td>
                  <EditableTimeField
                    value={compOffData.half_day.max_hours}
                    onChange={(val) =>
                      handleInputChange("half_day", "max_hours", val)
                    }
                  />
                </td>
              </tr>
              <tr>
                <td>Full Day</td>
                <td>
                  <EditableTimeField
                    value={compOffData.full_day.min_hours}
                    onChange={(val) =>
                      handleInputChange("full_day", "min_hours", val)
                    }
                  />
                </td>
                <td>
                  <EditableTimeField
                    value={compOffData.full_day.max_hours}
                    onChange={(val) =>
                      handleInputChange("full_day", "max_hours", val)
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div
            className="project-form-group-small"
            style={{ marginTop: "40px", marginBottom: "40px" }}
          >
            <label>Days to expire</label>
            <input
              type="number"
              min="1"
              name="days_to_expire"
              className="estd"
              style={{ width: "20%", marginTop: "10px" }}
              value={compOffExpiry?.days_to_expire || "0"}
              onChange={handleChange}
            />
          </div>
        </div>
      )}

      <button className="delete-btn" onClick={handleSubmit}>
        Save
        {/* Timings */}
      </button>
      <ToastContainerComponent />
    </div>
  );
};

export default HRSettings;
