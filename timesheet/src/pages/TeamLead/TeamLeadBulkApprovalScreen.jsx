import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import config from "../../config";
import { useAuth } from "../../AuthContext";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const TeamLeadBulkApprovalScreen = () => {
  const { date, employee_id } = useParams();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [groupedRows, setGroupedRows] = useState({}); // { EMP_001: [rows], ... }
  const [selectedRows, setSelectedRows] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
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

  console.log("Selected rows", selectedRows);

  useEffect(() => {
    fetchBiometricTaskData();
  }, [employee_id, date]);

  const fetchBiometricTaskData = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/biometric-manager-daily-task/${user.employee_id}/?today=${date}`
      );
      const data = await response.json();
      console.log("Biometric task data:", data);

      const allRows = [];

      data.forEach((record) => {
        const {
          employee_code,
          employee_name,
          employee: employee_id,
          in_time,
          out_time,
          total_duration,
          leave_deduction,
        } = record;

        if (record.timesheets && record.timesheets.length > 0) {
          record.timesheets.forEach((entry) => {
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

            allRows.push({
              timesheet_id: entry.timesheet_id,
              employee_code,
              employee_name,
              employee_id,
              in_time,
              out_time,
              total_duration,
              leave_deduction,
              project,
              building,
              task,
              start_time: start_time.toString(),
              end_time: end_time.toString(),
              hours: hours.toString(),
              approved: entry.approved,
              rejected: entry.rejected,
            });
          });
        }
      });

      setRows(allRows);
      const grouped = {};

      allRows.forEach((row) => {
        const empId = row.employee_id;
        if (!grouped[empId]) grouped[empId] = [];
        grouped[empId].push(row);
      });

      setGroupedRows(grouped);
      const initialExpandState = {};
      Object.keys(grouped).forEach((empId) => {
        initialExpandState[empId] = true;
      });
      setExpandedGroups(initialExpandState);
    } catch (err) {
      console.error("Error fetching biometric task data", err);
      setRows([]);
    }
  };

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleApprove = async () => {
    try {
      // const newApproved = !status.approved;
      const updatedRows = [...rows];

      if (selectedRows.length === 0) {
        showWarningToast("Select rows to approve");
        return;
      }

      for (let timesheetId of selectedRows) {
        // const timesheetId = rows[index].timesheet_id;
        const patchData = {
          approved: true,
          rejected: false, // reset rejected
        };

        await fetch(`${config.apiBaseURL}/timesheet/${timesheetId}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        });
      }

      setSelectedRows([]);
      showSuccessToast("Timesheet Approved Successfully");
      fetchBiometricTaskData();
    } catch (err) {
      console.error("Error toggling approve", err);
      showErrorToast("Approval failed");
    }
  };

  const handleReject = async () => {
    try {
      // const newRejected = !status.rejected;
      const updatedRows = [...rows];
      if (selectedRows.length === 0) {
        showWarningToast("Select rows to reject");
        return;
      }

      for (let timesheetId of selectedRows) {
        // const timesheetId = rows[index].timesheet_id;
        const patchData = {
          rejected: true,
          approved: false, // reset approved
        };

        await fetch(`${config.apiBaseURL}/timesheet/${timesheetId}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        });
      }

      setSelectedRows([]);
      showSuccessToast("Timesheet Rejected Successfully");
      fetchBiometricTaskData();
    } catch (err) {
      console.error("Error toggling reject", err);
      showErrorToast("Approval failed");
    }
  };

  const formatToHoursMinutes = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const paddedHours = hours.toString().padStart(2, "0");
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${paddedHours}:${paddedMinutes}`;
  };

  return (
    <div className="daily-timesheet-container">
      <p>
        <strong>Date: </strong>
        <strong>{date ? date : ""}</strong>
      </p>
      <table className="timesheet-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    const allIds = rows.map((r) => r.timesheet_id);
                    setSelectedRows(allIds);
                  } else {
                    setSelectedRows([]);
                  }
                }}
                checked={selectedRows.length === rows.length && rows.length > 0}
              />
            </th>
            <th>Employee Code</th>
            <th>Employee Name</th>
            <th>Project</th>
            <th>Sub-Division</th>
            <th>Task</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>
                No Timesheet requests.
              </td>
            </tr>
          ) : (
            Object.entries(groupedRows).map(([empId, rows]) => {
              const allSelected = rows.every((r) =>
                selectedRows.includes(r.timesheet_id)
              );

              return (
                <React.Fragment key={empId}>
                  <tr style={{ background: "#f0f0f0", fontWeight: "bold" }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => {
                          const newSelected = [...selectedRows];
                          if (e.target.checked) {
                            rows.forEach((r) => {
                              if (!newSelected.includes(r.timesheet_id))
                                newSelected.push(r.timesheet_id);
                            });
                          } else {
                            rows.forEach((r) => {
                              const index = newSelected.indexOf(r.timesheet_id);
                              if (index > -1) newSelected.splice(index, 1);
                            });
                          }
                          setSelectedRows(newSelected);
                        }}
                      />
                    </td>
                    <td
                      colSpan="9"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setExpandedGroups((prev) => ({
                          ...prev,
                          [empId]: !prev[empId],
                        }));
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>
                        {expandedGroups[empId] ? "▼" : "▶"}
                      </span>
                      {rows[0].employee_name} ({rows[0].employee_code})
                    </td>
                  </tr>
                  {expandedGroups[empId] &&
                    rows.map((row, index) => {
                      const statusText = row.approved
                        ? "Approved"
                        : row.rejected
                        ? "Rejected"
                        : "Pending";

                      return (
                        <tr key={row.timesheet_id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(row.timesheet_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRows((prev) => [
                                    ...prev,
                                    row.timesheet_id,
                                  ]);
                                } else {
                                  setSelectedRows((prev) =>
                                    prev.filter((id) => id !== row.timesheet_id)
                                  );
                                }
                              }}
                            />
                          </td>
                          <td>{row.employee_code}</td>
                          <td>{row.employee_name}</td>
                          <td>{row.project}</td>
                          <td>{row.building}</td>
                          <td>{row.task}</td>
                          <td>{row.start_time}</td>
                          <td>{row.end_time}</td>
                          <td>{`${formatToHoursMinutes(
                            parseFloat(row.hours)
                          )} hrs`}</td>
                          <td
                            style={{
                              color: row.approved
                                ? "green"
                                : row.rejected
                                ? "red"
                                : "orange",
                              fontWeight: "bold",
                            }}
                          >
                            {statusText}
                          </td>
                        </tr>
                      );
                    })}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>

      <div className="button-container">
        {rows.length === 0 ? (
          <div></div>
        ) : (
          <>
            <button
              className="timesheet-approve"
              onClick={handleApprove}
              disabled={selectedRows.length === 0}
            >
              Approve
            </button>
            <button
              className="timesheet-reject"
              onClick={handleReject}
              disabled={selectedRows.length === 0}
            >
              Reject
            </button>
          </>
        )}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default TeamLeadBulkApprovalScreen;
