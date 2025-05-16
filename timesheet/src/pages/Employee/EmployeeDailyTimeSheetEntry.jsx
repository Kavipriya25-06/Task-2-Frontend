import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { FaEdit } from "react-icons/fa";
import config from "../../config";
import Breadcrumbs from "../../components/Breadcrumbs";

const EmployeeDailyTimeSheetEntry = () => {
  const { date } = useParams(); // Format: YYYY-MM-DD
  const navigate = useNavigate();
  const { user } = useAuth();
  const employee_id = user.employee_id;

  // console.log(employee_id)

  const [displayRows, setDisplayRows] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]);

  const [taskOptions, setTaskOptions] = useState([]);

  const [rows, setRows] = useState([
    {
      project: "",
      building: "",
      task: "",
      hours: "",
      start_time: "",
      end_time: "",
    },
  ]);
  const [attendanceDetails, setAttendanceDetails] = useState({
    in_time: "--:--",
    out_time: "--:--",
    total_duration: "0.00",
  });

  //  Fetch biometric-daily-task data
  useEffect(() => {
    const fetchBiometricTaskData = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/biometric-daily-task/${employee_id}/?today=${date}`
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

          // Step 3: Build Timesheet Rows
          let timesheetRows = [];
          if (latestRecord.timesheets && latestRecord.timesheets.length > 0) {
            let fetchedRows = latestRecord.timesheets.map((ts) => ({
              timesheet_id: ts.id, // VERY IMPORTANT: keep the ID for PATCHing
              project:
                ts.task_assign?.building_assign?.project_assign?.project
                  ?.project_title || "",
              building:
                ts.task_assign?.building_assign?.building?.building_title || "",
              task: ts.task_assign?.task?.task_title || "",
              hours: parseFloat(ts.task_hours || "0").toString(),
              start_time: ts.start_time || "",
              end_time: ts.end_time || "",
            }));

            setDisplayRows(fetchedRows);
          } else {
            setDisplayRows([]); // No fetched rows
          }

          setRows(timesheetRows);
        } else {
          console.warn("No biometric data found for this date.");
          setRows([
            {
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

  // Row change handler
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;

    const start = updatedRows[index].start_time;
    const end = updatedRows[index].end_time;

    //  Only auto-calculate hours if start and end are both selected
    if (start && end) {
      const parseTime = (timeStr) => {
        const parts = timeStr.split(":").map(Number);
        return {
          hours: parts[0] || 0,
          minutes: parts[1] || 0,
        };
      };

      const startTime = parseTime(start);
      const endTime = parseTime(end);

      const startSeconds = startTime.hours * 3600 + startTime.minutes * 60;
      const endSeconds = endTime.hours * 3600 + endTime.minutes * 60;

      let diffSeconds = endSeconds - startSeconds;

      if (diffSeconds < 0) {
        // User might cross midnight — optional: handle this or set 0
        diffSeconds = 0;
      }

      const diffHours = diffSeconds / 3600;
      updatedRows[index].hours = diffHours.toFixed(2);
    }

    setRows(updatedRows);
  };

  const handleAddRow = () => {
    if (newRows.length > 0) {
      const lastRow = newRows[newRows.length - 1];
      if (
        !lastRow.project?.trim() ||
        !lastRow.building?.trim() ||
        !lastRow.task?.trim() ||
        !lastRow.start_time?.trim() ||
        !lastRow.end_time?.trim() ||
        !lastRow.hours
      ) {
        alert(
          "Please fill out all fields in the current row before adding a new one."
        );
        return;
      }
    }

    setNewRows([
      ...newRows,
      {
        project: "",
        building: "",
        task: "",
        hours: "",
        start_time: "",
        end_time: "",
      },
    ]);
  };

  
  //  console.log("Task assign id",row.task_assign_id);

  const handleSubmit = async () => {
    try {
      // ---------------- PATCH updated existing rows ----------------
      for (let row of updatedRows) {
        const { start_time, end_time } = validateTimes(row);
        const payload = {
          employee: employee_id,
          date: date,
          project: row.project,
          building: row.building,
          task_assign: row.task_assign_id,
          task_hours: parseFloat(row.hours || 0),
          start_time,
          end_time,
        };

        const response = await fetch(
          `${config.apiBaseURL}/timesheet/${row.timesheet_id}/`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to PATCH row:", errorData);
          alert(`Failed to update task "${row.task}".`);
          return;
        }
      }

      // ---------------- POST new rows ----------------
      for (let row of newRows) {
        const { start_time, end_time } = validateTimes(row);
        const payload = {
          employee: employee_id,
          date: date,
          project: row.project,
          building: row.building,
          task_assign: row.task_assign_id,
          task_hours: parseFloat(row.hours || 0),
          start_time,
          end_time,
          submitted: true,
        };

        const response = await fetch(`${config.apiBaseURL}/timesheet/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to POST new row:", errorData);
          alert(`Failed to submit new task "${row.task}".`);
          return;
        }
      }

      alert("All timesheet rows saved successfully!");
      // Optionally refresh data here
    } catch (error) {
      console.error("Submission failed:", error);
      alert(error);
    }
  };

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

  return (
    <div className="daily-timesheet-container">
      <h3>Daily Timesheet</h3>
      <div className="timesheet-info">
        <p>Date: {date}</p>
        <p>Intime: {attendanceDetails.in_time}</p>
        <p>Outtime: {attendanceDetails.out_time}</p>
        <p>Total logged hours: {attendanceDetails.total_duration}</p>
      </div>

      {/* Timesheet Entry Table */}
      <table className="timesheet-table">
        <thead>
          <tr>
            <th>Project name</th>
            <th>Buildings</th>
            <th>Tasks</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {/* Display fetched (existing) rows */}
          {displayRows.map((row, index) => (
            <tr key={"display-" + index}>
              <td>
                <input
                  type="text"
                  placeholder="Enter project"
                  value={row.project}
                  onChange={(e) =>
                    handleDisplayRowChange(index, "project", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Enter building"
                  value={row.building}
                  onChange={(e) =>
                    handleDisplayRowChange(index, "building", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Enter task"
                  value={row.task}
                  onChange={(e) =>
                    handleDisplayRowChange(index, "task", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="time"
                  value={row.start_time ? row.start_time.slice(0, 5) : ""}
                  onChange={(e) =>
                    handleDisplayRowChange(index, "start_time", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="time"
                  value={row.end_time ? row.end_time.slice(0, 5) : ""}
                  onChange={(e) =>
                    handleDisplayRowChange(index, "end_time", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Hours"
                  value={row.hours}
                  onChange={(e) =>
                    handleDisplayRowChange(index, "hours", e.target.value)
                  }
                />
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
                  className="task-select"
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
        </tbody>
      </table>
      <button>
        <div
          style={{ fontSize: "24px", cursor: "pointer" }}
          onClick={handleAddRow}
        >
          +
        </div>
      </button>

      <div className="button-container">
        {/* <button onClick={() => navigate(-1)} className="cancel-button1">Back</button> */}
        <button className="btn-cancel">Save</button>
        <button className="btn-save">Submit</button>
      </div>
    </div>
  );
};

export default EmployeeDailyTimeSheetEntry;
