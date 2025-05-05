import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import config from "../../config"; // adjust path to your config

const TeamLeadApprovalScreen = () => {
  const { date, employee_id } = useParams();

  const [rows, setRows] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState({
    in_time: "--:--",
    out_time: "--:--",
    total_duration: "0.00"
  });

  useEffect(() => {
    const fetchTimesheetData = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/timesheet-employee-daily/${employee_id}/?today=${date}`);
        const data = await response.json();

        // Filter records matching employee_id and date
        // const records = data.filter(
        //   (entry) => entry.employee === employee_id && entry.date === date
        // );
        const records = data

        if (records.length > 0) {
          // Extract start_time, end_time, total_duration
          // For total_duration, we'll sum up task_hours
          let totalHours = 0;
          let inTime = records[0].start_time || "--:--";
          let outTime = records[0].end_time || "--:--";

          const timesheetRows = records.map((entry) => {
            const project =
              entry.task_assign?.building_assign?.project_assign?.project
                ?.project_title || "";

            const task =
              entry.task_assign?.task?.task_title || "";

            const hours = parseFloat(entry.task_hours || "0");
            totalHours += hours;

            return {
              project,
              task,
              hours: hours.toString()
            };
          });

          setAttendanceDetails({
            in_time: inTime,
            out_time: outTime,
            total_duration: totalHours.toFixed(2)
          });

          setRows(timesheetRows);
        } else {
          // No records → reset
          setAttendanceDetails({
            in_time: "--:--",
            out_time: "--:--",
            total_duration: "0.00"
          });
          setRows([{ project: "", task: "", hours: "" }]);
        }
      } catch (err) {
        console.error("Error fetching timesheet data", err);
        setRows([{ project: "", task: "", hours: "" }]);
      }
    };

    fetchTimesheetData();
}, [employee_id, date]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  // const handleAddRow = () => {
  //   setRows([...rows, { project: "", task: "", hours: "" }]);
  // };

  return (
    <div className="daily-timesheet-container">
      <h3>Daily Timesheet Entry</h3>
      <div className="timesheet-info">
        <p><strong>Employee ID:</strong> {employee_id}</p>
        <p><strong>Date:</strong> {date}</p>
        <p>Intime: {attendanceDetails.in_time || "--:--"}</p>
        <p>Outtime: {attendanceDetails.out_time || "--:--"}</p>
        <p>Total logged hours: {attendanceDetails.total_duration || "0.00"} hrs</p>
      </div>

      <table className="timesheet-table">
        <thead>
          <tr>
            <th>Project name</th>
            <th>Tasks</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{row.project}
                {/* <input
                  type="text"
                  placeholder="Enter project"
                  value={row.project}
                  // onChange={(e) => handleRowChange(index, "project", e.target.value)}
                /> */}
              </td>
              <td> {row.task}
                {/* <input
                  // type="text"
                  placeholder="Enter task"
                  value={row.task}
                  // onChange={(e) => handleRowChange(index, "task", e.target.value)}
                /> */}
              </td>
              <td>{row.hours}
                {/* <input
                  type="number"
                  placeholder="Hours"
                  value={row.hours}
                  // onChange={(e) => handleRowChange(index, "hours", e.target.value)}
                /> */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* <div
        style={{ fontSize: "24px", cursor: "pointer", marginTop: "10px" }}
        onClick={handleAddRow}
      >
        +
      </div> */}

      <div className="button-container">
        <button className="save-button2">Reject</button>
        <button className="submit-button2">Approve</button>
      </div>
    </div>
  );
};

export default TeamLeadApprovalScreen;
