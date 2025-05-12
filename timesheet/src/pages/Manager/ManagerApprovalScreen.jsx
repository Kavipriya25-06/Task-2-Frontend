import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import config from "../../config";

const ManagerApprovalScreen = () => {
  const { date, employee_id } = useParams();
  const [assignCompOff, setAssignCompOff] = useState(false);
  const [rows, setRows] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState({
    in_time: "--:--",
    out_time: "--:--",
    total_duration: "0.00",
    comp_off: false,
    leave_deduction: 0,
  });

  const [status, setStatus] = useState({
    approved: false,
    rejected: false,
  });

  useEffect(() => {
    const fetchBiometricTaskData = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/biometric-daily-task/${employee_id}/?today=${date}`
        );
        const data = await response.json();
        console.log("Biometric task data:", data);

        if (data && data.length > 0) {
          // Step 1: Find latest biometric record for the day
          let latestRecord = data[0];
          data.forEach((record) => {
            if (
              new Date(record.modified_on) > new Date(latestRecord.modified_on)
            ) {
              latestRecord = record;
            }
          });

          // Step 2: Set attendance details from the latest record
          setAttendanceDetails({
            in_time: latestRecord.in_time || "--:--",
            out_time: latestRecord.out_time || "--:--",
            total_duration: latestRecord.total_duration || "0.00",
            comp_off:
              latestRecord.calendar?.is_weekend ||
              latestRecord.calendar?.is_holiday
                ? true
                : false,
            leave_deduction: latestRecord.leave_deduction || 0,
          });

          // Step 3: Prepare rows from timesheets
          let timesheetRows = [];
          if (latestRecord.timesheets && latestRecord.timesheets.length > 0) {
            latestRecord.timesheets.forEach((entry) => {
              const project =
                entry.task_assign?.building_assign?.project_assign?.project
                  ?.project_title || "";

              const task = entry.task_assign?.task?.task_title || "";

              const hours = parseFloat(entry.task_hours || "0");

              timesheetRows.push({
                timesheet_id: entry.timesheet_id,
                project,
                task,
                hours: hours.toString(),
              });
            });

            // If at least one timesheet, set status from the first one
            setStatus({
              approved: latestRecord.timesheets[0].approved,
              rejected: latestRecord.timesheets[0].rejected,
            });
          } else {
            // No timesheets found
            timesheetRows = [{ project: "", task: "", hours: "" }];
            setStatus({
              approved: false,
              rejected: false,
            });
          }

          setRows(timesheetRows);
        } else {
          // No data found
          setAttendanceDetails({
            in_time: "--:--",
            out_time: "--:--",
            total_duration: "0.00",
            comp_off: false,
            leave_deduction: 0,
          });
          setRows([{ project: "", task: "", hours: "" }]);
          setStatus({
            approved: false,
            rejected: false,
          });
        }
      } catch (err) {
        console.error("Error fetching biometric task data", err);
        setAttendanceDetails({
          in_time: "--:--",
          out_time: "--:--",
          total_duration: "0.00",
          comp_off: false,
          leave_deduction: 0,
        });
        setRows([{ project: "", task: "", hours: "" }]);
        setStatus({
          approved: false,
          rejected: false,
        });
      }
    };

    fetchBiometricTaskData();
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
              "Content-Type": "application/json",
            },
            body: JSON.stringify(patchData),
          }
        );

        if (!response.ok) {
          console.error(`Failed to approve timesheet ID ${timesheetId}`);
        }
      }

      // If comp_off checkbox is ticked, assign comp off
      if (assignCompOff) {
        // Get the comp_off value - if total_duration >= 4 consider full day, else half day
        const hours = parseFloat(attendanceDetails.total_duration || "0");
        const compOffValue = attendanceDetails.leave_deduction || 0;

        // Fetch existing leave data
        const leaveResponse = await fetch(
          `${config.apiBaseURL}/leaves-available/by_employee/${employee_id}/`
        );

        const leaveData = await leaveResponse.json();

        const updatedLeaveData = {
          comp_off: parseFloat(leaveData.comp_off || 0) + compOffValue,
        };

        const leave_id = leaveData.leave_avail_id;

        // Patch the updated leave data
        const patchLeaveResponse = await fetch(
          `${config.apiBaseURL}/leaves-available/${leave_id}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedLeaveData),
          }
        );

        if (!patchLeaveResponse.ok) {
          console.error("Failed to update comp_off leave balance");
        } else {
          console.log("Comp-off leave updated successfully");
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
        const patchData = { rejected: true, approved: false }; // optional to reset approved

        const response = await fetch(
          `${config.apiBaseURL}/timesheet/${timesheetId}/`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(patchData),
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
      {/* <h3>Daily Timesheet Entry</h3> */}
      <div className="timesheet-info">
        <p>
          <strong>Employee ID:</strong> {employee_id}
        </p>
        <p>
          <strong>Date:</strong> {date}
        </p>
        <p>Intime: {attendanceDetails.in_time || "--:--"}</p>
        <p>Outtime: {attendanceDetails.out_time || "--:--"}</p>
        <p>
          Total logged hours: {attendanceDetails.total_duration || "0.00"} hrs
        </p>
        {attendanceDetails.comp_off && (
          <div>
            <button
              onClick={() => setAssignCompOff(!assignCompOff)}
              className={`comp-off-button ${
                assignCompOff ? "assigned" : "not-assigned"
              }`}
            >
              {assignCompOff ? "Comp-Off Granted" : "Grant Comp-Off"}
            </button>
          </div>
        )}
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
              <td>{row.project}</td>
              <td> {row.task}</td>
              <td>{row.hours}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="button-container">
        {status.approved ? ( //  CHANGE: conditionally render approved button
          <button className="submit-button2" disabled>
            Approved
          </button>
        ) : status.rejected ? ( //  CHANGE: conditionally render rejected button
          <button className="save-button2" disabled>
            Rejected
          </button>
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

export default ManagerApprovalScreen;
