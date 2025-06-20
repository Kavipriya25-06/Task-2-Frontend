import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import config from "../../config";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const ManagerApprovalScreen = () => {
  const { date, employee_id } = useParams();
  // const [assignCompOff, setAssignCompOff] = useState(false);
  const [rows, setRows] = useState([]);
  const [attendanceDetails, setAttendanceDetails] = useState({
    in_time: "--:--",
    out_time: "--:--",
    total_duration: "0.00",
    comp_off: false,
    leave_deduction: 0,
    employee_code: "",
    employee_name: "",
    employee_id: "",
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
            employee_code: latestRecord.employee_code || "",
            employee_name: latestRecord.employee_name || "",
            employee_id: latestRecord.employee || "",
          });

          // Step 3: Prepare rows from timesheets
          let timesheetRows = [];
          if (
            latestRecord.timesheets &&
            latestRecord.timesheets.length > 0 &&
            latestRecord.timesheets[0].submitted === true
          ) {
            latestRecord.timesheets.forEach((entry) => {
              const project =
                entry.task_assign?.building_assign?.project_assign?.project
                  ?.project_title || "";

              const building =
                entry.task_assign?.building_assign?.building?.building_title ||
                "";

              const task = entry.task_assign?.task?.task_title || "";

              const start_time = entry.start_time || "0";
              const end_time = entry.end_time || "0";

              const hours = parseFloat(entry.task_hours || "0");

              timesheetRows.push({
                timesheet_id: entry.timesheet_id,
                project,
                building,
                task,
                start_time: start_time.toString(),
                end_time: end_time.toString(),
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
            timesheetRows = [
              // {
              //   project: "",
              //   building: "",
              //   task: "",
              //   start_time: "",
              //   end_time: "",
              //   hours: "",
              // },
            ];
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
            employee_code: "",
            employee_name: "",
            employee_id: "",
          });
          setRows([
            // {
            //   project: "",
            //   building: "",
            //   task: "",
            //   start_time: "",
            //   end_time: "",
            //   hours: "",
            // },
          ]);
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
          employee_code: "",
          employee_name: "",
          employee_id: "",
        });
        setRows([
          // {
          //   project: "",
          //   building: "",
          //   task: "",
          //   start_time: "",
          //   end_time: "",
          //   hours: "",
          // },
        ]);
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
      const newApproved = !status.approved;

      for (let row of rows) {
        const timesheetId = row.timesheet_id;
        const patchData = {
          approved: newApproved,
          rejected: false, // reset rejected
        };

        await fetch(`${config.apiBaseURL}/timesheet/${timesheetId}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        });
      }

      // Update comp-off if approved
      // if (assignCompOff && newApproved) {
      //   const compOffValue = attendanceDetails.leave_deduction || 0;
      //   const leaveResponse = await fetch(
      //     `${config.apiBaseURL}/leaves-available/by_employee/${employee_id}/`
      //   );
      //   const leaveData = await leaveResponse.json();
      //   const leave_id = leaveData.leave_avail_id;

      //   await fetch(`${config.apiBaseURL}/leaves-available/${leave_id}/`, {
      //     method: "PATCH",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       comp_off: parseFloat(leaveData.comp_off || 0) + compOffValue,
      //     }),
      //   });
      // }

      setStatus({
        approved: newApproved,
        rejected: false,
      });
      if (newApproved) {
        showSuccessToast("Timesheet Approved Successfully");
      } else {
        showSuccessToast("Approval Removed");
      }
    } catch (err) {
      console.error("Error toggling approve", err);
    }
  };

  const handleReject = async () => {
    try {
      const newRejected = !status.rejected;

      for (let row of rows) {
        const timesheetId = row.timesheet_id;
        const patchData = {
          rejected: newRejected,
          approved: false, // reset approved
        };

        await fetch(`${config.apiBaseURL}/timesheet/${timesheetId}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        });
      }

      setStatus({
        approved: false,
        rejected: newRejected,
      });
      if (newRejected) {
        showSuccessToast("Timesheet Rejected Successfully");
      } else {
        showSuccessToast("Rejection Removed");
      }
    } catch (err) {
      console.error("Error toggling reject", err);
    }
  };

  return (
    <div className="daily-timesheet-container">
      {/* <h3>Daily Timesheet Entry</h3> */}
      <div className="timesheet-info">
        <p>
          <strong>Employee Code:</strong>
          <br />
          {attendanceDetails.employee_code}
        </p>
        <p>
          <strong>Employee Name:</strong>
          <br />
          {attendanceDetails.employee_name}
        </p>
        <p>
          <strong>Date:</strong>
          <br />
          {date}
        </p>
        <p>
          <strong>Intime:</strong>
          <br />
          {attendanceDetails.in_time || "--:--"}
        </p>
        <p>
          <strong>Outtime:</strong>
          <br />
          {attendanceDetails.out_time || "--:--"}
        </p>
        <p>
          <strong>Total logged hours: </strong>
          <br />
          {attendanceDetails.total_duration || "0.00"} hrs
        </p>
        {/* {attendanceDetails.comp_off && (
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
        )} */}
      </div>

      {/* {attendanceDetails.comp_off && (
  <div className="comp-off-checkbox-wrapper">
    <label>
      <input
        type="checkbox"
        checked={assignCompOff}
        onChange={(e) => setAssignCompOff(e.target.checked)}
      />{" "}
      Grant Comp-Off
    </label>
  </div>
)} */}

      <table className="timesheet-table">
        <thead>
          <tr>
            <th>Project name</th>
            <th>Sub-Division</th>
            <th>Tasks</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No Timesheet requests.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                <td>{row.project}</td>
                <td>{row.building}</td>
                <td>{row.task}</td>
                <td>{row.start_time}</td>
                <td>{row.end_time}</td>
                <td>{row.hours}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="button-container">
        {status.approved ? (
          <button className="submit-button2" onClick={handleApprove}>
            Approved
          </button>
        ) : status.rejected ? (
          <button className="save-button2" onClick={handleReject}>
            Rejected
          </button>
        ) : rows.length === 0 ? (
          <div></div>
        ) : (
          <>
            <button className="submit-button2" onClick={handleApprove}>
              Approve
            </button>
            <button className="save-button2" onClick={handleReject}>
              Reject
            </button>
          </>
        )}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerApprovalScreen;
