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

  const [status, setStatus] = useState({
  approved: false,
  rejected: false
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


          setStatus({
            approved: records[0].approved,
            rejected: records[0].rejected
          });


          const timesheetRows = records.map((entry) => {
            const project =
              entry.task_assign?.building_assign?.project_assign?.project
                ?.project_title || "";

            const task =
              entry.task_assign?.task?.task_title || "";

            const hours = parseFloat(entry.task_hours || "0");
            totalHours += hours;

            return {
              timesheet_id:entry.timesheet_id,
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

  const handleApprove = async () => {
    try {
      for (let row of rows) {
        const timesheetId = row.timesheet_id;
        const patchData = { approved: true };
  
        const response = await fetch(
          `${config.apiBaseURL}/timesheet/${timesheetId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(patchData)
          }
        );
  
        if (!response.ok) {
          console.error(`Failed to approve timesheet ID ${timesheetId}`);
        }
      }
  
      // alert("All rows approved successfully!");
      setStatus({ approved: true, rejected: false }); 
    } catch (err) {
      console.error("Error approving timesheets", err);
      alert("Error occurred while approving.");
    }
  };

  const handleReject = async () => {
    try {
      for (let row of rows) {
        const timesheetId = row.timesheet_id;
        const patchData = { rejected: true, approved: false };  // optional to reset approved
  
        const response = await fetch(
          `${config.apiBaseURL}/timesheet/${timesheetId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(patchData)
          }
        );
  
        if (!response.ok) {
          console.error(`Failed to reject timesheet ID ${timesheetId}`);
        }
      }
  
      // alert("All rows rejected successfully!");
      setStatus({ approved: false, rejected: true });
    } catch (err) {
      console.error("Error rejecting timesheets", err);
      alert("Error occurred while rejecting.");
    }
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
        {status.approved ? (  //  CHANGE: conditionally render approved button
          <button className="submit-button2" disabled>Approved</button>
        ) : status.rejected ? (  //  CHANGE: conditionally render rejected button
          <button className="save-button2" disabled>Rejected</button>
        ) : (
          <>
            <button className="submit-button2" onClick={handleApprove}>Approve</button>
            <button className="save-button2" onClick={handleReject}>Reject</button>
          </>
        )}
      </div>
    </div>

  );
};

export default TeamLeadApprovalScreen;
