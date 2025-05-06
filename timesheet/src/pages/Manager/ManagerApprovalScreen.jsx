import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import config from "../../config"; // adjust path to your config

const ManagerApprovalScreen = () => {
  const { date, employee_id } = useParams();
  const [rows, setRows] = useState([{ project: "", task: "", hours: "" }]);

  const [attendanceDetails, setAttendanceDetails] = useState({
    in_time: null,
    out_time: null,
    total_duration: null,
  });

  // Fetch and filter attendance
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await fetch(`${config.apiBaseURL}/attendance/`);
        const data = await response.json();

        const matched = data.find(
          (record) =>
            record.employee === employee_id && record.date === date
        );

        if (matched) {
          setAttendanceDetails({
            in_time: matched.in_time,
            out_time: matched.out_time,
            total_duration: matched.total_duration,
          });
        }
      } catch (err) {
        console.error("Error fetching attendance data", err);
      }
    };

    fetchAttendance();
  }, [employee_id, date]);

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { project: "", task: "", hours: "" }]);
  };

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
              <td>
                <input
                  type="text"
                  placeholder="Enter project"
                  value={row.project}
                  onChange={(e) => handleRowChange(index, "project", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Enter task"
                  value={row.task}
                  onChange={(e) => handleRowChange(index, "task", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Hours"
                  value={row.hours}
                  onChange={(e) => handleRowChange(index, "hours", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{ fontSize: "24px", cursor: "pointer", marginTop: "10px" }}
        onClick={handleAddRow}
      >
        +
      </div>

      <div className="button-container">
        <button className="save-button2">Reject</button>
        <button className="submit-button2">Approve</button>
      </div>
    </div>
  );
};

export default ManagerApprovalScreen;
