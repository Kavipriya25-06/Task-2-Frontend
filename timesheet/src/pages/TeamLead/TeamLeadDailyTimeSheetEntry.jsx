import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TeamLeadDailyTimeSheetEntry = () => {
  const { date } = useParams(); // Format: YYYY-MM-DD
  const navigate = useNavigate();

  const [rows, setRows] = useState([{ project: "", task: "", hours: "" }]);

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
      <h3>Daily Timesheet</h3>
      <div className="timesheet-info">
        <p>Date: {date}</p>
        <p>Intime: 9:00am</p>
        <p>Outtime: 10:00pm</p>
        <p>Total logged hours: 12</p>
      </div>

      {/* Timesheet Entry Table */}
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
                  onChange={(e) =>
                    handleRowChange(index, "project", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Enter task"
                  value={row.task}
                  onChange={(e) =>
                    handleRowChange(index, "task", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  placeholder="Hours"
                  value={row.hours}
                  onChange={(e) =>
                    handleRowChange(index, "hours", e.target.value)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
        <div
          style={{ fontSize: "24px", cursor: "pointer", marginTop: "10px" }}
          onClick={handleAddRow}
        >
          +
        </div>
      </table>
      <div className="button-container">
        {/* <button onClick={() => navigate(-1)} className="cancel-button1">Back</button> */}
        <button className="btn-save">Save</button>
        <button className="btn-cancel">Submit</button>
      </div>
    </div>
  );
};

export default TeamLeadDailyTimeSheetEntry;
