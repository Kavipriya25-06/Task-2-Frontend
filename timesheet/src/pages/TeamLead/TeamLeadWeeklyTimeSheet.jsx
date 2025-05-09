import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import config from "../../config";

const TeamLeadWeeklyTimeSheetEntry = () => {
  const { date } = useParams(); // Format: YYYY-MM-DD
  const navigate = useNavigate();
  const { user } = useAuth();
  const employee_id = user.employee_id;

  console.log("The employee id is",{employee_id});
  console.log("the date is ",date)
  

  const [rows, setRows] = useState([{ project: "", building: "", task: "", hours: "" }]);
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

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleAddRow = () => {
    setRows([...rows, { project: "", building: "", task: "", hours: "" }]);
  };

  return (
    <div className="weekly-timesheet-container">
      <h3>Weekly Timesheet</h3>
      <div className="timesheet-info">
        <p>Start Date: {startOfWeek}</p>
        <p>End Date: {endOfWeek}</p>
        <p>Total logged hours: {totalLoggedHours.toFixed(2)}</p>
      </div>

      <table className="timesheet-table">
        <thead>
          <tr>
            <th>Project name</th>
            <th>Buildings</th>
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
                  placeholder="Enter building"
                  value={row.building}
                  onChange={(e) =>
                    handleRowChange(index, "building", e.target.value)
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
      </table>

      <div
        style={{ fontSize: "24px", cursor: "pointer", marginTop: "10px" }}
        onClick={handleAddRow}
      >
        +
      </div>
      <div className="button-container">
        <button className="save-button2">Save</button>
        <button className="submit-button2">Submit</button>
      </div>
    </div>
  );
};

export default TeamLeadWeeklyTimeSheetEntry;

