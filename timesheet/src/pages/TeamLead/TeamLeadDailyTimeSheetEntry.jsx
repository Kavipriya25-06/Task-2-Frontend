import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../../config";
import { useAuth } from "../../AuthContext";

const TeamLeadDailyTimeSheetEntry = () => {
  const { date} = useParams(); // Format: YYYY-MM-DD
  const navigate = useNavigate();
  const{ user } = useAuth();
  const employee_id = user.employee_id;
  
  // console.log(employee_id)

  const [rows, setRows] = useState([{ project: "", building: "", task: "", hours: "" ,start_time:"", end_time:""}]);
  const [attendanceDetails, setAttendanceDetails] = useState({
    in_time: "--:--",
    out_time: "--:--",
    total_duration: "0.00"
  });

  // 🔎 Fetch biometric-daily-task data
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
          data.forEach(record => {
            if (new Date(record.modified_on) > new Date(latestRecord.modified_on)) {
              latestRecord = record;
            }
          });

          // Step 2: Set In-time, Out-time, Total Hours
          setAttendanceDetails({
            in_time: latestRecord.in_time || "--:--",
            out_time: latestRecord.out_time || "--:--",
            total_duration: latestRecord.total_duration || "0.00"
          });

          // Step 3: Build Timesheet Rows
          let timesheetRows = [];
          if (latestRecord.timesheets && latestRecord.timesheets.length > 0) {
            latestRecord.timesheets.forEach(ts => {
              const project =
                ts.task_assign?.building_assign?.project_assign?.project?.project_title || "";
              const building =
                ts.task_assign?.building_assign?.building?.building_name || "";
              const task = ts.task_assign?.task?.task_title || "";
              const hours = parseFloat(ts.task_hours || "0");

              timesheetRows.push({
                project,
                building,
                task,
                hours: hours.toString(),
                start_time: ts.start_time || "",
                end_time: ts.end_time || ""
              });
            });
          } else {
            timesheetRows = [{ project: "", building: "", task: "", hours: "" ,start_time:"", end_time:"" }];
          }

          setRows(timesheetRows);

        } else {
          console.warn("No biometric data found for this date.");
          setRows([{ project: "", building: "", task: "", hours: ""  ,start_time:"", end_time:""}]);
          setAttendanceDetails({
            in_time: "--:--",
            out_time: "--:--",
            total_duration: "0.00"
          });
        }

      } catch (error) {
        console.error("Failed to fetch biometric task data:", error);
        setRows([{ project: "", building: "", task: "", hours: "" ,start_time:"", end_time:"" }]);
        setAttendanceDetails({
          in_time: "--:--",
          out_time: "--:--",
          total_duration: "0.00"
        });
      }
    };

    fetchBiometricTaskData();
  }, [employee_id, date]);

  // Row change handler
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
  
    const start = updatedRows[index].start_time;
    const end = updatedRows[index].end_time;
  
    // ✅ Only auto-calculate hours if start and end are both selected
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
  
      const startSeconds =
        startTime.hours * 3600 + startTime.minutes * 60;
      const endSeconds =
        endTime.hours * 3600 + endTime.minutes * 60;
  
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
    setRows([...rows, { project: "", building: "", task: "", hours: "" ,start_time:"", end_time:"" }]);
  };

  const handleSubmit = async () => {
    try {
      for (let row of rows) {
  
        const start = row.start_time;
        const end = row.end_time;
  
        if (!start || !end) {
          alert(`Please enter both start and end time for all tasks.`);
          return;
        }
  
        const parseTime = (timeStr) => {
          const parts = timeStr.split(":").map(Number);
          return {
            hours: parts[0] || 0,
            minutes: parts[1] || 0,
          };
        };
  
        const startTime = parseTime(start);
        const endTime = parseTime(end);
  
        const startSeconds =
          startTime.hours * 3600 + startTime.minutes * 60;
        const endSeconds =
          endTime.hours * 3600 + endTime.minutes * 60;
  
        const intimeParts = attendanceDetails.in_time.split(":").map(Number);
        const intimeSeconds =
          (intimeParts[0] || 0) * 3600 + (intimeParts[1] || 0) * 60;
  
        // ✅ Validate start_time >= intime
        if (startSeconds < intimeSeconds) {
          alert(
            `Task "${row.task}" Start Time (${start}) cannot be before Intime (${attendanceDetails.in_time}).`
          );
          return;
        }
  
        // ✅ Validate end_time > start_time
        if (endSeconds <= startSeconds) {
          alert(`Task "${row.task}" End Time must be after Start Time.`);
          return;
        }
  
        // ✅ Validate total assigned hours
        if (parseFloat(totalAssignedHours) > maxAllowedHours) {
          alert(
            `Total assigned hours exceed available logged hours (${maxAllowedHours}).`
          );
          return;
        }
  
        // ✅ Prepare times for API (add :00 if needed)
        const start_time = start.includes(":00") ? start : start + ":00";
        const end_time = end.includes(":00") ? end : end + ":00";
  
        const payload = {
          employee: employee_id,
          date: date,
          project: row.project,
          building: row.building,
          task: row.task,
          task_hours: parseFloat(row.hours || 0),
          start_time: start_time,
          end_time: end_time
        };
  
        const response = await fetch(`${config.apiBaseURL}/timesheet/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to submit row:", errorData);
          alert(`Failed to submit row for task ${row.task}. See console.`);
          return; // stop submitting further
        }
      }
  
      alert("All timesheet rows submitted successfully!");
  
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      alert("An error occurred while submitting the timesheet.");
    }
  };

  
  // Calculate total assigned hours
const totalAssignedHours = rows.reduce(
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
                  type="time"
                  value={row.start_time ? row.start_time.slice(0, 5) : ""}
                  onChange={(e) =>
                    handleRowChange(index, "start_time", e.target.value)
                  }
                /> 
              </td>
              <td> 
                <input
                  type="time"
                  value={row.end_time ? row.end_time.slice(0, 5) : ""}
                  onChange={(e) =>
                    handleRowChange(index, "end_time", e.target.value)
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
        <button className="save-button2" onClick={handleSubmit} disabled={totalAssignedHours > maxAllowedHours}>Save</button>
        <button className="submit-button2"  onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default TeamLeadDailyTimeSheetEntry;



// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../../AuthContext";

// const TeamLeadDailyTimeSheetEntry = () => {
//   const { employee_id, date } = useParams(); //  Get employee_id and date from URL
//   const navigate = useNavigate();

//   const [rows, setRows] = useState([]);

//   //  Fetch the timesheet data
//   useEffect(() => {
//     if (employee_id && date) {
//       fetchTimesheetData(employee_id, date);
//     }
//   }, [employee_id, date]);

//   const fetchTimesheetData = async (empId, selectedDate) => {
//     try {
//       const response = await fetch(
//         `http://127.0.0.1:8000/timesheet-employee-weekly/${empId}/?today=${selectedDate}`
//       );
//       const data = await response.json();

//       // If data exists, set it to rows, else set a default row
//       if (data && Array.isArray(data) && data.length > 0) {
//         setRows(data);
//       } else {
//         setRows([{ project: "", building: "", task: "", hours: "" }]);
//       }
//     } catch (error) {
//       console.error("Failed to fetch timesheet data:", error);
//       setRows([{ project: "", building: "", task: "", hours: "" }]);
//     }
//   };

//   const handleRowChange = (index, field, value) => {
//     const updatedRows = [...rows];
//     updatedRows[index][field] = value;
//     setRows(updatedRows);
//   };

//   const handleAddRow = () => {
//     setRows([...rows, { project: "", building: "", task: "", hours: "" }]);
//   };

//   return (
//     <div className="daily-timesheet-container">
//       <h3>Daily Timesheet</h3>
//       <div className="timesheet-info">
//         <p>Date: {date}</p>
//         <p>Employee ID: {employee_id}</p>
//         <p>Intime: 9:00am</p>
//         <p>Outtime: 10:00pm</p>
//         <p>Total logged hours: 12</p>
//       </div>

//       {/* Timesheet Entry Table */}
//       <table className="timesheet-table">
//         <thead>
//           <tr>
//             <th>Project name</th>
//             <th>Buildings</th>
//             <th>Tasks</th>
//             <th>Hours</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((row, index) => (
//             <tr key={index}>
//               <td>
//                 <input
//                   type="text"
//                   placeholder="Enter project"
//                   value={row.project || ""}
//                   onChange={(e) =>
//                     handleRowChange(index, "project", e.target.value)
//                   }
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   placeholder="Enter building"
//                   value={row.building || ""}
//                   onChange={(e) =>
//                     handleRowChange(index, "building", e.target.value)
//                   }
//                 />
//               </td>

//               <td>
//                 <input
//                   type="text"
//                   placeholder="Enter task"
//                   value={row.task || ""}
//                   onChange={(e) =>
//                     handleRowChange(index, "task", e.target.value)
//                   }
//                 />
//               </td>
//               <td>
//                 <input
//                   type="number"
//                   placeholder="Hours"
//                   value={row.hours || ""}
//                   onChange={(e) =>
//                     handleRowChange(index, "hours", e.target.value)
//                   }
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div
//         style={{ fontSize: "24px", cursor: "pointer", marginTop: "10px" }}
//         onClick={handleAddRow}
//       >
//         +
//       </div>

//       <div className="button-container">
//         <button className="save-button2">Save</button>
//         <button className="submit-button2">Submit</button>
//       </div>
//     </div>
//   );
// };

// export default TeamLeadDailyTimeSheetEntry;
