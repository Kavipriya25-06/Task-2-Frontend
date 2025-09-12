// // src\pages\Manager\ManagerAttendance.jsx

import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const AddAttendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Start with current week
  const [totalHours, setTotalHours] = useState({});
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editCtx, setEditCtx] = useState(null);

  const openEditor = (emp, day, attendance) => {
    setEditCtx({ emp, day, attendance });
    setEditOpen(true);
  };
  const closeEditor = () => setEditOpen(false);

  const navigate = useNavigate();

  // Returns decimal hours (e.g., 9.00) from "HH:MM" to "HH:MM".
  // Handles overnight (e.g., 22:00 -> 06:00 = 8.00).
  const diffHoursDecimal = (inHHMM, outHHMM) => {
    if (!inHHMM || !outHHMM) return null;
    const [ih, im] = inHHMM.split(":").map(Number);
    const [oh, om] = outHHMM.split(":").map(Number);
    let start = ih * 60 + im;
    let end = oh * 60 + om;
    if (end < start) end += 24 * 60; // cross-midnight
    return +((end - start) / 60).toFixed(2);
  };

  /////

  // --- Display-only cell that opens the popup ---
  const TimeCell = ({ emp, day, attendance, onOpen }) => {
    const labelIn = attendance?.in_time
      ? attendance.in_time.slice(0, 5)
      : "--:--";
    const labelOut = attendance?.out_time
      ? attendance.out_time.slice(0, 5)
      : "--:--";

    return (
      <td
        key={day.key}
        onClick={() => onOpen(emp, day, attendance)}
        style={{
          padding: 6,
          minWidth: 140,
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
        title="Click to edit In/Out"
      >
        {labelIn} &nbsp;–&nbsp; {labelOut}
      </td>
    );
  };

  // --- Centered modal with In/Out time + Save/Cancel ---
  const TimeEditModal = ({
    open,
    onClose,
    emp,
    day,
    attendance,
    user,
    onSaved,
  }) => {
    const [inTime, setInTime] = React.useState("");
    const [outTime, setOutTime] = React.useState("");
    const [saving, setSaving] = React.useState(false);

    React.useEffect(() => {
      if (!open) return;
      setInTime(attendance?.in_time?.slice(0, 5) || "");
      setOutTime(attendance?.out_time?.slice(0, 5) || "");
    }, [
      open,
      attendance?.biometric_id,
      attendance?.in_time,
      attendance?.out_time,
    ]);

    // esc to close
    React.useEffect(() => {
      if (!open) return;
      const onKey = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const toHHMMSS = (v) => (v ? (v.length === 5 ? `${v}:00` : v) : null);

    const save = async () => {
      if (!inTime) {
        showWarningToast("In time is required.");
        return;
      }
      setSaving(true);
      try {
        const bodyBase = {
          modified_by: user?.employee_id,
        };

        // Compute duration only if OUT is present
        const worked = diffHoursDecimal(inTime, outTime);
        // Back-end uses Decimal fields; strings like "9.00" are safe for DRF
        const durationPayload =
          worked != null
            ? {
                work_duration: worked.toFixed(2),
                total_duration: worked.toFixed(2),
              }
            : {};

        let url, method, payload;

        if (attendance?.biometric_id) {
          // PATCH existing
          url = `${config.apiBaseURL}/biometric-data/${attendance.biometric_id}/`;
          method = "PATCH";
          payload = {
            ...bodyBase,
            in_time: toHHMMSS(inTime),
            out_time: outTime ? toHHMMSS(outTime) : null,
            ...durationPayload,
          };
        } else {
          // POST new (in_time required; out_time optional)
          url = `${config.apiBaseURL}/biometric-data/`;
          method = "POST";
          payload = {
            ...bodyBase,
            employee: emp.employee_id,
            date: day.mapdate, // YYYY-MM-DD
            in_time: toHHMMSS(inTime),
            ...(outTime ? { out_time: toHHMMSS(outTime) } : {}),
            status: "Present",
            ...(emp.employee_code ? { employee_code: emp.employee_code } : {}),
            ...(emp.employee_name ? { employee_name: emp.employee_name } : {}),
            ...durationPayload,
          };
        }

        const resp = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          const msg = await resp.text();
          showErrorToast(msg || `Save failed (${method})`);
          throw new Error(msg || "Save failed");
        }
        const saved = await resp.json();
        onSaved(saved);
        showSuccessToast(
          `Saved ${emp?.employee_name || "employee"} • ${day?.mapdate}`
        );
        onClose();
        fetchAttendanceData();
      } catch (e) {
        console.error(e);
        // error toast already shown above for non-OK; keep a fallback here:
        if (!String(e.message || "").includes("Save failed")) {
          showErrorToast("Could not save time. Please check API inputs.");
        }
      } finally {
        setSaving(false);
      }
    };

    if (!open) return null;

    return (
      <div style={modalBackdrop}>
        <div style={modalCard}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            {emp?.employee_name} • {day?.weekday} ({day?.date})
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "64px 1fr",
              gap: 10,
              alignItems: "center",
            }}
          >
            <label>In</label>
            <input
              type="time"
              step="60"
              value={inTime}
              onChange={(e) => setInTime(e.target.value)}
              style={timeInput}
            />
            <label>Out</label>
            <input
              type="time"
              step="60"
              value={outTime}
              onChange={(e) => setOutTime(e.target.value)}
              style={timeInput}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 16,
            }}
          >
            <button onClick={onClose} disabled={saving} style={btnGhost}>
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving || !inTime}
              style={btnPrimary}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* --- tiny styles --- */
  const modalBackdrop = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  };
  const modalCard = {
    background: "#fff",
    color: "#111",
    width: 360,
    borderRadius: 10,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  };
  const timeInput = { width: "100%", padding: "6px 8px", fontSize: 14 };
  const btnPrimary = {
    padding: "6px 12px",
    fontWeight: 600,
    borderRadius: 6,
    border: "1px solid #005",
    background: "#0a58ff",
    color: "#fff",
  };
  const btnGhost = {
    padding: "6px 12px",
    fontWeight: 600,
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#fff",
  };

  /////

  // Get the start and end date of the week
  const getWeekDates = (date) => {
    const startDate = new Date(date);
    const endDate = new Date(date);

    startDate.setDate(startDate.getDate() + (1 - startDate.getDay())); // Set to Monday
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay())); // Set to Sunday

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so adding 1
      const day = d.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
    };

    let weekDays = [];
    let start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      let day = new Date(start); // date object
      day.setDate(start.getDate() + i);
      weekDays.push({
        weekday: day.toLocaleString("en-us", { weekday: "short" }),
        date: day.toLocaleString("en-GB", { month: "2-digit", day: "2-digit" }),
        key: day.toISOString(), // Unique key based on date
        mapdate: formatDate(day),
      });
    }
    console.log("Day keys", weekDays[0]);

    return { startDate, endDate, weekDays };
  };

  const { startDate, endDate, weekDays } = getWeekDates(currentWeek);

  // Fetch Attendance Data for the week
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/weekly-attendance/?today=${weekDays[0].mapdate}`
      );
      const data = await response.json();
      console.log("Raw attendance data:", data);

      // Step 1: Group by employee + date and pick latest
      const latestRecords = {};

      data.forEach((record) => {
        const key = `${record.employee}_${record.date}`;
        // If no entry yet OR this record has newer modified_on, replace it
        if (
          !latestRecords[key] ||
          new Date(record.modified_on) >
            new Date(latestRecords[key].modified_on)
        ) {
          latestRecords[key] = record;
        }
      });

      // Step 2: Convert back to array
      const filteredData = Object.values(latestRecords);
      console.log("Filtered latest attendance data:", filteredData);

      setAttendanceData(filteredData);
      calculateTotalHours(filteredData);
    } catch (err) {
      console.error("Unable to fetch attendance data", err);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/emp-details/`);
      const data = await response.json();
      console.log("User data", data);
      setEmployeeData(data);
    } catch (err) {
      console.error("Unable to fetch attendance data", err);
    }
  };

  // Calculate total hours for each employee
  const calculateTotalHours = (data) => {
    let hours = {};
    data.forEach((attendance) => {
      const totalDuration = parseFloat(attendance.total_duration || "0"); // use total_duration
      hours[attendance.employee] =
        (hours[attendance.employee] || 0) + totalDuration;
    });
    setTotalHours(hours);
  };

  // Navigate to previous or next week
  const handleWeekChange = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + direction * 7); // Move by 7 days
    setCurrentWeek(newDate);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [currentWeek]);

  useEffect(() => {
    fetchEmployee();
  }, [user]);

  const formatToHHMM = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${paddedMinutes}`;
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="week-navigation">
          <button onClick={() => handleWeekChange(-1)}>&lt;</button>
          <h3>
            {startDate.toLocaleDateString("en-GB")} -{" "}
            {endDate.toLocaleDateString("en-GB")}
          </h3>
          <button onClick={() => handleWeekChange(1)}> &gt;</button>
        </div>
        <div style={{ margin: "10px 0", textAlign: "center" }}>
          <input
            type="text"
            placeholder="Search employee by name..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="search-bar"
            style={{
              width: "300px",
              fontSize: "14px",
            }}
          />
        </div>
      </div>

      <div className="table-scroll-container">
        <table className="attend-table">
          <thead>
            <tr>
              <th>Employee</th>
              {weekDays.map((day) => (
                <th
                  key={day.key}
                  style={{
                    color: day.weekday === "Sun" ? "orange" : "inherit",
                    cursor: "pointer",
                  }}
                >
                  {day.weekday} ({day.date})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employeeData
              .filter((emp) =>
                emp.employee_name
                  .toLowerCase()
                  .includes(employeeSearch.toLowerCase())
              )
              .map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_name}</td>
                  {/* For each day of the week, check if attendance data exists */}
                  {weekDays.map((day) => {
                    // Find the attendance record for this employee on this specific day
                    const attendance = attendanceData.find(
                      (a) =>
                        a.employee === emp.employee_id && a.date === day.mapdate
                    );

                    return (
                      <TimeCell
                        key={day.key}
                        emp={emp}
                        day={day}
                        attendance={attendance}
                        onOpen={openEditor}
                      />
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <TimeEditModal
        open={editOpen}
        onClose={closeEditor}
        emp={editCtx?.emp}
        day={editCtx?.day}
        attendance={editCtx?.attendance}
        user={user}
        onSaved={(saved) => {
          setAttendanceData((prev) => {
            const idx = prev.findIndex(
              (r) => r.biometric_id === saved.biometric_id
            );
            return idx >= 0
              ? Object.assign([...prev], { [idx]: saved })
              : [...prev, saved];
          });
        }}
      />
      <ToastContainerComponent />
    </div>
  );
};

export default AddAttendance;
