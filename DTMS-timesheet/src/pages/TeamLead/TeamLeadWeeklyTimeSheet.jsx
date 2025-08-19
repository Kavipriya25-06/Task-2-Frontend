// src\pages\TeamLead\TeamLeadWeeklyTimeSheet.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import config from "../../config";

const TeamLeadWeeklyTimeSheetEntry = () => {
  const { date } = useParams(); // Format: YYYY-MM-DD
  const navigate = useNavigate();
  const { user } = useAuth();
  const employee_id = user.employee_id;

  const [displayRows, setDisplayRows] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]);

  const [taskOptions, setTaskOptions] = useState([]);
  // const [maxAllowedHours, setMaxAllowedHours] = useState(40);
  const [existingRows, setExistingRows] = useState([]);

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const [taskRows, setTaskRows] = useState([
    {
      date: "",
      project: "",
      building: "",
      task: "",
      hours: "",
      start_time: "",
      end_time: "",
      days: Array(7).fill(false),
    },
  ]);
  // const [rows, setRows] = useState([{ project: "", building: "", task: "", hours: "" ,start_time:"", end_time:""}]);
  const [attendanceDetails, setAttendanceDetails] = useState({
    in_time: "--:--",
    out_time: "--:--",
    total_duration: "0.00",
  });

  console.log("The employee id is", { employee_id });
  console.log("the date is ", date);

  const [rows, setRows] = useState([
    { date: "", project: "", building: "", task: "", hours: "" },
  ]);
  const [totalLoggedHours, setTotalLoggedHours] = useState(0);

  const getWeekRange = (inputDateStr) => {
    const inputDate = new Date(inputDateStr);
    const day = inputDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(inputDate);
    monday.setDate(inputDate.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const toISO = (d) => d.toISOString().slice(0, 10);
    return {
      startOfWeek: toISO(monday),
      endOfWeek: toISO(sunday),
    };
  };

  const { startOfWeek, endOfWeek } = getWeekRange(date);

  //  Fetch total logged hours from biometric-weekly-task API
  useEffect(() => {
    if (!employee_id || !date) return;

    const fetchWeeklyBiometricData = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/biometric-weekly-task/${employee_id}/?today=${date}`
        );
        const data = await response.json();

        console.log("Weekly biometric data:", data);

        if (!Array.isArray(data) || data.length === 0) {
          console.warn("No biometric records found.");
          setTotalLoggedHours(0);
          return;
        }

        //  Step 1: Group by date and get latest modified_on per date
        const latestPerDateMap = {};

        data.forEach((record) => {
          const dateKey = record.date;
          const existing = latestPerDateMap[dateKey];

          if (
            !existing ||
            new Date(record.modified_on) > new Date(existing.modified_on)
          ) {
            latestPerDateMap[dateKey] = record;
          }
        });

        //  Step 2: Sum only latest records per date
        let totalHours = 0;
        Object.values(latestPerDateMap).forEach((record) => {
          const duration = parseFloat(record.total_duration || "0");
          totalHours += isNaN(duration) ? 0 : duration;
        });

        console.log("Calculated total logged hours:", totalHours);
        setTotalLoggedHours(totalHours);
      } catch (error) {
        console.error("Failed to fetch biometric weekly data:", error);
        setTotalLoggedHours(0);
      }
    };

    fetchWeeklyBiometricData();
  }, [employee_id, date]);

  //  Fetch biometric-daily-task data
  useEffect(() => {
    const fetchBiometricTaskData = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/biometric-weekly-task/${employee_id}/?today=${date}`
        );
        const data = await response.json();
        console.log("Biometric task data:", data);

        if (data && data.length > 0) {
          // Step 1: Pick the latest modified_on record
          let latestRecord = data[0];
          data.forEach((record) => {
            if (
              new Date(record.modified_on) > new Date(latestRecord.modified_on)
            ) {
              latestRecord = record;
            }
          });

          // Step 2: Set In-time, Out-time, Total Hours
          setAttendanceDetails({
            in_time: latestRecord.in_time || "--:--",
            out_time: latestRecord.out_time || "--:--",
            total_duration: latestRecord.total_duration || "0.00",
          });

          let allTimesheets = [];

          data.forEach((record) => {
            if (record.timesheets && record.timesheets.length > 0) {
              record.timesheets.forEach((ts) => {
                allTimesheets.push({
                  date: ts.date,
                  timesheet_id: ts.timesheet_id,
                  project:
                    ts.task_assign?.building_assign?.project_assign?.project
                      ?.project_title || "",
                  building:
                    ts.task_assign?.building_assign?.building?.building_title ||
                    "",
                  task: ts.task_assign?.task?.task_title || "",
                  hours: parseFloat(ts.task_hours || "0").toString(),
                  start_time: ts.start_time || "",
                  end_time: ts.end_time || "",
                });
              });
            }
          });
          setDisplayRows(allTimesheets);
          // setRows(timesheetRows);
        } else {
          console.warn("No biometric data found for this date.");
          setRows([
            {
              date: "",
              project: "",
              building: "",
              task: "",
              hours: "",
              start_time: "",
              end_time: "",
            },
          ]);
          setAttendanceDetails({
            in_time: "--:--",
            out_time: "--:--",
            total_duration: "0.00",
          });
        }
      } catch (error) {
        console.error("Failed to fetch biometric task data:", error);
        setRows([
          {
            date: "",
            project: "",
            building: "",
            task: "",
            hours: "",
            start_time: "",
            end_time: "",
          },
        ]);
        setAttendanceDetails({
          in_time: "--:--",
          out_time: "--:--",
          total_duration: "0.00",
        });
      }
    };

    fetchBiometricTaskData();
  }, [employee_id, date]);

  useEffect(() => {
    const fetchTaskOptions = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/tasks-by-employee/${employee_id}/`
        );
        const data = await response.json();

        const formatted = data.map((item) => ({
          task_assign_id: item.task_assign_id,
          task_title: item.task.task_title,
          project_title:
            item.building_assign.project_assign.project.project_title,
          building_title: item.building_assign.building?.building_title || "",
        }));

        setTaskOptions(formatted);
      } catch (error) {
        console.error("Failed to load task options:", error);
      }
    };

    if (employee_id) {
      fetchTaskOptions();
    }
  }, [employee_id]);

  const handleDisplayRowChange = (index, field, value) => {
    const updated = [...displayRows];
    updated[index][field] = value;

    // Auto-calculate hours if start_time or end_time changes
    if (field === "start_time" || field === "end_time") {
      const start = updated[index].start_time;
      const end = updated[index].end_time;

      if (start && end) {
        const parseTime = (timeStr) => {
          const [hours = 0, minutes = 0] = timeStr.split(":").map(Number);
          return hours * 3600 + minutes * 60;
        };
        const startSeconds = parseTime(start);
        const endSeconds = parseTime(end);
        let diffSeconds = endSeconds - startSeconds;
        if (diffSeconds < 0) diffSeconds = 0;
        updated[index].hours = (diffSeconds / 3600).toFixed(2);
      }
    }

    setDisplayRows(updated);

    // Track edited rows for PATCH
    if (!updatedRows.includes(updated[index])) {
      setUpdatedRows([...updatedRows, updated[index]]);
    }
  };

  const handleNewRowChange = (index, field, value) => {
    const updated = [...newRows];
    updated[index][field] = value;

    if (field === "task") {
      const selected = taskOptions.find((t) => t.task_title === value);
      if (selected) {
        updated[index].task = selected.task_title;
        updated[index].task_assign_id = selected.task_assign_id;
        updated[index].project = selected.project_title;
        updated[index].building = selected.building_title;
      }
    }

    // Auto-calculate hours if start_time or end_time changes
    if (field === "start_time" || field === "end_time") {
      const start = updated[index].start_time;
      const end = updated[index].end_time;

      if (start && end) {
        const parseTime = (timeStr) => {
          const [hours = 0, minutes = 0] = timeStr.split(":").map(Number);
          return hours * 3600 + minutes * 60;
        };
        const startSeconds = parseTime(start);
        const endSeconds = parseTime(end);
        let diffSeconds = endSeconds - startSeconds;
        if (diffSeconds < 0) diffSeconds = 0;
        updated[index].hours = (diffSeconds / 3600).toFixed(2);
      }
    }

    setNewRows(updated);
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // const handleAddRow = () => {
  //   setNewRows([
  //     ...newRows,
  //     {
  //       project: "",
  //       building: "",
  //       task: "",
  //       hours: "",
  //       start_time: "",
  //       end_time: "",
  //     },
  //   ]);
  // };

  //  console.log("Task assign id",row.task_assign_id);

  // const handleSubmit = async () => {
  //   try {
  //     // ---------------- PATCH updated existing rows ----------------
  //     for (let row of updatedRows) {
  //       const { start_time, end_time } = validateTimes(row);
  //       const payload = {
  //         employee: employee_id,
  //         date: date,
  //         project: row.project,
  //         building: row.building,
  //         task_assign: row.task_assign_id,
  //         task_hours: parseFloat(row.hours || 0),
  //         start_time,
  //         end_time,
  //       };

  //       const response = await fetch(
  //         `${config.apiBaseURL}/timesheet/${row.timesheet_id}/`,
  //         {
  //           method: "PATCH",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(payload),
  //         }
  //       );

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         console.error("Failed to PATCH row:", errorData);
  //         alert(`Failed to update task "${row.task}".`);
  //         return;
  //       }
  //     }

  //     // ---------------- POST new rows ----------------
  //     for (let row of newRows) {
  //       const { start_time, end_time } = validateTimes(row);
  //       const payload = {
  //         employee: employee_id,
  //         date: date,
  //         project: row.project,
  //         building: row.building,
  //         task_assign: row.task_assign_id,
  //         task_hours: parseFloat(row.hours || 0),
  //         start_time,
  //         end_time,
  //         submitted: true,
  //       };

  //       const response = await fetch(`${config.apiBaseURL}/timesheet/`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       });

  //       if (!response.ok) {
  //         const errorData = await response.json();
  //         console.error("Failed to POST new row:", errorData);
  //         alert(`Failed to submit new task "${row.task}".`);
  //         return;
  //       }
  //     }

  //     alert("All timesheet rows saved successfully!");
  //     // Optionally refresh data here
  //   } catch (error) {
  //     console.error("Submission failed:", error);
  //     alert(error);
  //   }
  // };

  const validateTimes = (row) => {
    const start = row.start_time;
    const end = row.end_time;

    if (!start || !end) {
      throw new Error(
        `Please enter both start and end time for task "${row.task}".`
      );
    }

    const parseTime = (timeStr) => {
      const [hours = 0, minutes = 0] = timeStr.split(":").map(Number);
      return hours * 3600 + minutes * 60;
    };

    const startSeconds = parseTime(start);
    const endSeconds = parseTime(end);

    const intimeParts = attendanceDetails.in_time.split(":").map(Number);
    const intimeSeconds =
      (intimeParts[0] || 0) * 3600 + (intimeParts[1] || 0) * 60;

    if (startSeconds < intimeSeconds) {
      throw new Error(
        `Task "${row.task}" Start Time (${start}) cannot be before Intime (${attendanceDetails.in_time}).`
      );
    }

    if (endSeconds <= startSeconds) {
      throw new Error(`Task "${row.task}" End Time must be after Start Time.`);
    }

    if (parseFloat(totalAssignedHours) > maxAllowedHours) {
      throw new Error(
        `Total assigned hours exceed logged hours (${maxAllowedHours}).`
      );
    }

    // Prepare final time strings
    return {
      start_time: start.includes(":00") ? start : start + ":00",
      end_time: end.includes(":00") ? end : end + ":00",
    };
  };

  // Calculate total assigned hours
  const totalAssignedHours = [...displayRows, ...newRows].reduce(
    (sum, row) => sum + parseFloat(row.hours || 0),
    0
  );

  const maxAllowedHours = parseFloat(attendanceDetails.total_duration || 0);

  // const handleAddRow = () => {
  //   setRows([...rows, { project: "", building: "", task: "", hours: "" }]);
  // };

  const formatToHoursMinutes = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${paddedHours}:${paddedMinutes}`;
  };

  return (
    <div className="weekly-timesheet-container">
      <h3>Weekly Timesheet</h3>
      <div className="timesheet-info">
        <p>Start Date: {startOfWeek}</p>
        <p>End Date: {endOfWeek}</p>
        <p>Total logged hours: {formatToHoursMinutes(totalLoggedHours)} hrs</p>
      </div>

      <table className="timesheet-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Project name</th>
            <th>Sub-Divisions</th>
            <th>Tasks</th>
            {/* <th>Start Time</th>
            <th>End Time</th> */}
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {/* Display fetched (existing) rows */}
          {displayRows.map((row, index) => (
            <tr key={"display-" + index}>
              <td>{row.date}</td>
              <td>
                <span>{row.project}</span>
              </td>
              <td>
                <span>{row.building}</span>
              </td>
              <td>
                <span>{row.task}</span>
              </td>
              {/* <td>
                <span>{row.start_time?.slice(0, 5)}</span>
              </td>
              <td>
                <span>{row.end_time?.slice(0, 5)}</span>
              </td> */}
              <td>
                <span>{`${formatToHoursMinutes(row.hours)} hrs`}</span>
              </td>
            </tr>
          ))}

          {/* Display new (user added) rows */}
          {newRows.map((row, index) => (
            <tr key={"new-" + index}>
              <td>
                <input
                  type="text"
                  placeholder="Enter project"
                  value={row.project}
                  onChange={(e) =>
                    handleNewRowChange(index, "project", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Enter building"
                  value={row.building}
                  onChange={(e) =>
                    handleNewRowChange(index, "building", e.target.value)
                  }
                />
              </td>
              <td>
                <select
                  value={row.task}
                  onChange={(e) =>
                    handleNewRowChange(index, "task", e.target.value)
                  }
                >
                  <option value="">Select task</option>
                  {taskOptions.map((task) => (
                    <option key={task.task_assign_id} value={task.task_title}>
                      {task.task_title}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="time"
                  value={row.start_time ? row.start_time.slice(0, 5) : ""}
                  onChange={(e) =>
                    handleNewRowChange(index, "start_time", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="time"
                  value={row.end_time ? row.end_time.slice(0, 5) : ""}
                  onChange={(e) =>
                    handleNewRowChange(index, "end_time", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Hours"
                  value={row.hours}
                  onChange={(e) =>
                    handleNewRowChange(index, "hours", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
          {displayRows.length === 0 && newRows.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No Timesheet entries.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* <button>
        <div
          style={{ fontSize: "24px", cursor: "pointer" }}
          onClick={handleAddRow}
        >
          +
        </div>
      </button> */}

      {/* <div className="button-container">
        <button
          className="save-button2"
          onClick={handleSubmit}
          disabled={totalAssignedHours > maxAllowedHours}
        >
          Save
        </button>
        <button className="submit-button2" onClick={handleSubmit}>
          Submit
        </button>
      </div> */}
    </div>
  );
};

export default TeamLeadWeeklyTimeSheetEntry;
