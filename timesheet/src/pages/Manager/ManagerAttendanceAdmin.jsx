// // src\pages\Manager\ManagerAttendance.jsx

import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const ManagerAttendanceAdmin = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [attendanceAdminData, setAttendanceAdminData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Start with current week
  const [totalHours, setTotalHours] = useState({});
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const initialAttendanceState = {
    employee: "",
    shift: "",
    start_date: "",
    end_date: "",
    in_time: "",
    out_time: "",
    work_duration: "",
    ot: "0",
    total_duration: "",
    status: "Present",
    remarks: "",
    holiday: false,
  };

  const [newAttendance, setNewAttendance] = useState(initialAttendanceState);

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
        `${config.apiBaseURL}/weekly-attendance/${user.employee_id}/?today=${weekDays[0].mapdate}`
      );
      const data = await response.json();
      console.log("Attendance data", data);
      setAttendanceData(data);
      calculateTotalHours(data);
    } catch (err) {
      console.error("Unable to fetch attendance data", err);
    }
  };

  const fetchAttendanceAdmin = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/attendance-admin/${user.employee_id}/`
      );
      const data = await response.json();
      console.log("Attendance data", data);
      setAttendanceAdminData(data);
      groupAttendanceData(data);
      if (response.ok) {
        groupAttendanceData(data); // Group the data when it's fetched
      } else {
        showErrorToast("Failed to fetch attendance data");
      }
    } catch (err) {
      console.error("Unable to fetch attendance data", err);
    }
  };

  // Group the attendance data by group_id
  const groupAttendanceData = (data) => {
    const grouped = {};
    data.forEach((item) => {
      const groupKey = item.group_id || item.biometric_id; // Use biometric_id as key if no group
      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          records: [],
          isExpanded: item.group_id ? false : true, // Expand standalone by default
          isGrouped: !!item.group_id,
        };
      }
      grouped[groupKey].records.push(item);
    });
    setGroupedData(grouped);
    console.log("Grouped data", grouped);
  };

  // Toggle expanded/collapsed state for a group
  const toggleGroup = (groupId) => {
    setGroupedData((prev) => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        isExpanded: !prev[groupId].isExpanded,
      },
    }));
  };

  const handleAddAttendance = async (e) => {
    e.preventDefault();
    setIsSending(true);

    const payload = {
      ...newAttendance,
      modified_by: user.employee_id,
      modified_on: new Date().toISOString(),
    };

    if (payload.end_date < payload.start_date) {
      showWarningToast("Enter valid End date.");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/attendance-upload/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showSuccessToast("Attendance added!");
        setShowAddPopup(false);
        setNewAttendance(initialAttendanceState); // Reset form
        fetchAttendanceAdmin(); // Refresh the list
      } else {
        const data = await response.json();
        showErrorToast("Failed to add attendance: " + data.error);
      }
    } catch (err) {
      console.error("Error adding attendance:", err);
    } finally {
      setIsSending(false);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/emp-details/${user.employee_id}/`
      );
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
      const totalDuration = parseFloat(attendance.work_duration);
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
    fetchAttendanceAdmin();
  }, [user]);

  useEffect(() => {
    if (newAttendance.in_time && newAttendance.out_time) {
      const [inHours, inMinutes] = newAttendance.in_time.split(":").map(Number);
      const [outHours, outMinutes] = newAttendance.out_time
        .split(":")
        .map(Number);

      // Parse OT in HH:MM format
      let otMinutes = 0;
      if (newAttendance.ot && newAttendance.ot.includes(":")) {
        const [otHrs, otMins] = newAttendance.ot.split(":").map(Number);
        otMinutes = (otHrs || 0) * 60 + (otMins || 0);
      } else {
        otMinutes = parseFloat(newAttendance.ot || 0) * 60; // fallback for decimal OT
      }

      let start = new Date(0, 0, 0, inHours, inMinutes);
      let end = new Date(0, 0, 0, outHours, outMinutes);

      if (end < start) {
        // handle overnight shifts
        end.setDate(end.getDate() + 1);
      }

      const diffMs = end - start;
      const diffHrs = (diffMs / 1000 / 60 / 60).toFixed(2);

      const ot = parseFloat(newAttendance.ot || 0);
      const totalDuration = (parseFloat(diffHrs) + ot).toFixed(2);

      const diffHrsDecimal = diffMs / 1000 / 60 / 60;

      // Work Duration in HH:MM
      const workHours = Math.floor(diffHrsDecimal);
      const workMinutes = Math.round((diffHrsDecimal - workHours) * 60);
      const workDurationFormatted = `${workHours}:${workMinutes
        .toString()
        .padStart(2, "0")}`;

      // OT is assumed to be entered in HH:MM or in decimal, adjust accordingly
      const otDecimal = otMinutes / 60;

      const totalDecimal = diffHrsDecimal + otDecimal;

      const totalHours = Math.floor(totalDecimal);
      const totalMinutes = Math.round((totalDecimal - totalHours) * 60);
      const totalDurationFormatted = `${totalHours}:${totalMinutes
        .toString()
        .padStart(2, "0")}`;

      setNewAttendance((prev) => ({
        ...prev,
        // work_duration: workDurationFormatted,
        // total_duration: totalDurationFormatted,
        work_duration: diffHrsDecimal.toFixed(2), // Decimal for payload
        total_duration: totalDecimal.toFixed(2), // Decimal for payload
        work_duration_display: workDurationFormatted, // HH:MM for UI
        total_duration_display: totalDurationFormatted,
      }));
    }
  }, [newAttendance.in_time, newAttendance.out_time, newAttendance.ot]);

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <h2>Attendance Admin</h2>
        <button onClick={() => setShowAddPopup(true)} className="btn-save">
          + Add Attendance
        </button>
      </div>

      <div>
        <table className="holiday-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Modified On</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([groupId, group]) => {
              const firstRecord = group.records[0];
              const hasGroupId = !!firstRecord.group_id;
              const isGrouped = hasGroupId && group.records.length > 1;
              // const isGrouped = group.isGrouped || group.records.length > 1;

              if (!isGrouped) {
                return (
                  <tr key={firstRecord.biometric_id}>
                    <td>{firstRecord.employee_name}</td>
                    <td>
                      {new Date(firstRecord.date).toLocaleDateString("en-IN")}
                    </td>
                    <td>{firstRecord.in_time}</td>
                    <td>{firstRecord.out_time}</td>
                    <td>{firstRecord.status}</td>
                    <td>
                      {new Date(firstRecord.modified_on).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>
                  </tr>
                );
              }

              return (
                <React.Fragment key={groupId}>
                  {/* Group Header Row */}
                  <tr
                    onClick={() => toggleGroup(groupId)}
                    style={{
                      cursor: "pointer",
                      fontWeight: "bold",
                      backgroundColor: "#f5f5f5",
                    }}
                  >
                    <td>
                      <span>
                        <span style={{ marginRight: "8px" }}>
                          {group.isExpanded ? "▼" : "▶"}
                        </span>
                        {firstRecord.employee_name} — {group.records.length}{" "}
                        records
                      </span>
                    </td>
                    <td>
                      {new Date(firstRecord.date).toLocaleDateString("en-IN")}
                    </td>
                    <td>{firstRecord.in_time}</td>
                    <td>{firstRecord.out_time}</td>
                    <td>{firstRecord.status}</td>
                    <td>
                      {new Date(firstRecord.modified_on).toLocaleDateString(
                        "en-IN"
                      )}
                    </td>
                  </tr>

                  {/* Expanded Rows – inline with same table */}
                  {group.isExpanded &&
                    group.records.slice(1).map((att) => (
                      <tr key={att.biometric_id}>
                        <td>{att.employee_name}</td>
                        <td>
                          {new Date(att.date).toLocaleDateString("en-IN")}
                        </td>
                        <td>{att.in_time}</td>
                        <td>{att.out_time}</td>
                        <td>{att.status}</td>
                        <td>
                          {new Date(att.modified_on).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {showAddPopup && (
          <div className="att-popup">
            <h3>Add Attendance Record</h3>
            <form onSubmit={handleAddAttendance}>
              <label>Employee</label>
              <select
                value={newAttendance.employee}
                onChange={(e) => {
                  const selectedEmp = employeeData.find(
                    (emp) => emp.employee_id === e.target.value
                  );
                  setNewAttendance({
                    ...newAttendance,
                    employee: selectedEmp.employee_id,
                    employee_code: selectedEmp.employee_code,
                    employee_name: selectedEmp.employee_name,
                  });
                }}
              >
                <option value="">Select Employee</option>
                {employeeData.map((emp) => (
                  <option key={emp.employee_id} value={[emp.employee_id]}>
                    {emp.employee_name}
                  </option>
                ))}
              </select>

              <label>Shift</label>
              <select
                value={newAttendance.shift}
                onChange={(e) =>
                  setNewAttendance({ ...newAttendance, shift: e.target.value })
                }
              >
                <option value="">Select Shift</option>
                <option value="Morning">Morning</option>
                <option value="Night">Night</option>
              </select>

              <label>Start Date</label>

              <div className="date-input-container">
                <DatePicker
                  selected={newAttendance.start_date}
                  onChange={(date) =>
                    setNewAttendance({
                      ...newAttendance,
                      start_date: format(date, "yyyy-MM-dd"),
                    })
                  }
                  dateFormat="dd-MMM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                {/* Font Awesome Calendar Icon */}
              </div>
              <label>End Date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={newAttendance.end_date}
                  onChange={(date) =>
                    setNewAttendance({
                      ...newAttendance,
                      end_date: format(date, "yyyy-MM-dd"),
                    })
                  }
                  dateFormat="dd-MMM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                {/* Font Awesome Calendar Icon */}
              </div>
              {/* <input
                type="date"
                value={newAttendance.date}
                onChange={(e) =>
                  setNewAttendance({ ...newAttendance, date: e.target.value })
                }
              /> */}

              <label>In Time</label>
              <input
                type="time"
                value={newAttendance.in_time}
                onChange={(e) =>
                  setNewAttendance({
                    ...newAttendance,
                    in_time: e.target.value,
                  })
                }
              />

              <label>Out Time</label>
              <input
                type="time"
                value={newAttendance.out_time}
                onChange={(e) =>
                  setNewAttendance({
                    ...newAttendance,
                    out_time: e.target.value,
                  })
                }
              />

              <label>Work Duration</label>
              <input
                type="text"
                value={newAttendance.work_duration_display || ""}
                readOnly
              />

              <label>OT</label>
              <input
                type="number"
                value={newAttendance.ot}
                defaultValue={0}
                onChange={(e) =>
                  setNewAttendance({ ...newAttendance, ot: e.target.value })
                }
              />

              <label>Total Duration</label>
              <input
                type="text"
                value={newAttendance.total_duration_display || ""}
                readOnly
              />

              <label>Status</label>
              <select
                value={newAttendance.status}
                onChange={(e) =>
                  setNewAttendance({ ...newAttendance, status: e.target.value })
                }
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="WFH">WFH</option>
                <option value="OD">OD</option>
                <option value="Deputation">Deputation</option>
              </select>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  marginBottom: "10px",
                  marginTop: "20px",
                }}
              >
                <span>Include Holidays</span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={newAttendance.holiday}
                    onChange={(e) =>
                      setNewAttendance({
                        ...newAttendance,
                        holiday: e.target.checked,
                      })
                    }
                    className="toggle-input"
                  />
                  <span className="toggle-slider" />
                </div>
              </label>

              <label>Remarks</label>
              <textarea
                value={newAttendance.remarks}
                onChange={(e) =>
                  setNewAttendance({
                    ...newAttendance,
                    remarks: e.target.value,
                  })
                }
              />
              <div className="btn-container">
                <button
                  type="submit"
                  className="btn-save"
                  disabled={isSending}
                  style={{ pointerEvents: isSending ? "none" : "auto" }}
                >
                  {isSending ? (
                    <>
                      <span className="spinner-otp" /> Updating...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
                <button
                  onClick={() => setShowAddPopup(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerAttendanceAdmin;
