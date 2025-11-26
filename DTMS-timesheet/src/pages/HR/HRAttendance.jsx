// src\pages\HR\HRAttendance.jsx

import React, { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const toIsoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const HRAttendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSending, setIsSending] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Start with current week
  const [totalHours, setTotalHours] = useState({});
  const [rows, setRows] = useState([]); // [{ employee_id, employee_name, week: [...] }]
  const [activeIds, setActiveIds] = useState(new Set());
  const [employeeSearch, setEmployeeSearch] = useState("");

  const rowsPerPage = 15;

  // Compute Monday of the chosen week and header text
  const weekMeta = useMemo(() => {
    const d = new Date(currentWeek);
    const jsDow = d.getDay(); // 0=Sun..6=Sat
    const offsetToMon = jsDow === 0 ? -6 : 1 - jsDow;
    const monday = new Date(d);
    monday.setDate(d.getDate() + offsetToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      monday,
      sunday,
      todayParam: toIsoDate(monday),
      headerRange: `${monday.toLocaleDateString(
        "en-GB"
      )} - ${sunday.toLocaleDateString("en-GB")}`,
    };
  }, [currentWeek]);

  // Pull the weekly employee+week payload
  const fetchWeek = async () => {
    if (!user?.employee_id) return;
    try {
      const res = await fetch(
        `${config.apiBaseURL}/weekly-attendance-track/?today=${weekMeta.todayParam}`
      );
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch weekly attendance", e);
      setRows([]);
    }
  };

  const fetchWeekAndActive = async () => {
    const today = weekMeta.todayParam;

    try {
      const [weeklyRes, activeRes] = await Promise.all([
        // weekly payload (all employees for that week)
        fetch(`${config.apiBaseURL}/weekly-attendance-track/?today=${today}`),
        // active-as-of-date list (HR scope – no manager filter)
        fetch(`${config.apiBaseURL}/emp-details-resg/?today=${today}`),
        // If you need manager scoping instead, use:
        // fetch(`${config.apiBaseURL}/emp-details-resg/${user.employee_id}/?today=${today}`),
      ]);

      const [weeklyData, activeData] = await Promise.all([
        weeklyRes.json(),
        activeRes.json(),
      ]);

      // Build a fast lookup set of active employee_ids
      const ids = new Set(
        (Array.isArray(activeData) ? activeData : [])
          .map((e) => e.employee_id)
          .filter(Boolean)
      );
      setActiveIds(ids);

      // Keep only active employees in weekly rows
      const filteredWeekly = (
        Array.isArray(weeklyData) ? weeklyData : []
      ).filter((r) => ids.has(r.employee_id));
      setRows(filteredWeekly);
    } catch (e) {
      console.error("Failed to fetch weekly or active employees", e);
      setActiveIds(new Set());
      setRows([]);
    }
  };

  useEffect(() => {
    fetchWeekAndActive();
  }, [weekMeta.todayParam]);

  // Use the first employee’s week to render headers (server guarantees 7 days)
  const headerDays = useMemo(() => rows?.[0]?.week ?? [], [rows]);

  // Search on weekly rows
  const filteredRows = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.employee_name || "").toLowerCase().includes(q)
    );
  }, [rows, employeeSearch]);

  const totalHoursForEmp = (emp) => {
    if (!emp?.week) return 0;
    // Sum total_duration (fallback to work_duration); both are strings in sample
    return emp.week.reduce((sum, d) => {
      const b = d.biometric;
      if (!b) return sum;
      const val = b.total_duration ?? b.work_duration ?? "0";
      return sum + (Number(val) || 0);
    }, 0);
  };

  // Find Monday of the NEXT week and the CURRENT (today's) week
  const getMonday = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun..6=Sat
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const handleClampWeekChange = (dir) => {
    const next = new Date(currentWeek);
    next.setDate(currentWeek.getDate() + dir * 7);

    const today = new Date();

    const nextMonday = getMonday(next);
    const currentMonday = getMonday(today);

    // Allow only previous or current week — block future
    if (nextMonday <= currentMonday) {
      setCurrentWeek(next);
    } else {
      // Optional: give feedback if user tries to move forward
      console.warn("You cannot view future weeks");
    }
  };

  // const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  // const currentRows = filteredEmployees.slice(indexOfFirstRow, indexOfLastRow);
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

  // Get the start and end date of the week
  const getWeekDates = (date) => {
    const startDate = new Date(date);
    const endDate = new Date(date);

    startDate.setDate(startDate.getDate() + (1 - startDate.getDay())); // Set to Monday
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay())); // Set to Sunday

    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based, so adding 1
      const day = d.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
    };

    let weekDays = [];
    let start = new Date(startDate);
    for (let i = 0; i < 7; i++) {
      let day = new Date(start); // date object
      day.setDate(start.getDate() + i);
      weekDays.push({
        weekday: day.toLocaleString("en-us", { weekday: "short" }),
        date: day.toLocaleString("en-GB", { month: "2-digit", day: "2-digit" }),
        key: day.toISOString(), // Unique key based on date
        mapdate: formatDate(day),
      });
    }
    console.log("Day keys", weekDays[0]);

    return { startDate, endDate, weekDays };
  };

  const { startDate, endDate, weekDays } = getWeekDates(currentWeek);

  // // Fetch Attendance Data for the week
  // const fetchAttendanceData = async () => {
  //   try {
  //     const response = await fetch(
  //       `${config.apiBaseURL}/weekly-attendance/?today=${weekDays[0].mapdate}`
  //     );
  //     const data = await response.json();
  //     console.log("Raw attendance data:", data);

  //     // Step 1: Group by employee + date and pick latest
  //     const latestRecords = {};

  //     data.forEach((record) => {
  //       const key = `${record.employee}_${record.date}`;
  //       // If no entry yet OR this record has newer modified_on, replace it
  //       if (
  //         !latestRecords[key] ||
  //         new Date(record.modified_on) >
  //           new Date(latestRecords[key].modified_on)
  //       ) {
  //         latestRecords[key] = record;
  //       }
  //     });

  //     // Step 2: Convert back to array
  //     const filteredData = Object.values(latestRecords);
  //     console.log("Filtered latest attendance data:", filteredData);

  //     setAttendanceData(filteredData);
  //     calculateTotalHours(filteredData);
  //   } catch (err) {
  //     console.error("Unable to fetch attendance data", err);
  //   }
  // };

  // const fetchEmployee = async () => {
  //   try {
  //     const response = await fetch(
  //       `${config.apiBaseURL}/emp-details-resg/?today=${weekMeta.todayParam}`
  //     );
  //     const data = await response.json();
  //     console.log("User data", data);
  //     setEmployeeData(data);
  //   } catch (err) {
  //     console.error("Unable to fetch attendance data", err);
  //   }
  // };

  // Calculate total hours for each employee
  // const calculateTotalHours = (data) => {
  //   let hours = {};
  //   data.forEach((attendance) => {
  //     const totalDuration = parseFloat(attendance.total_duration || "0"); // use total_duration
  //     hours[attendance.employee] =
  //       (hours[attendance.employee] || 0) + totalDuration;
  //   });
  //   setTotalHours(hours);
  // };

  const handleBiometricSync = async () => {
    setIsSending(true);
    try {
      const response = await fetch(`${config.apiBaseURL}/sync-biometric/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      showSuccessToast(data.message);
    } catch (error) {
      console.error("Sync failed", error);
      showErrorToast("Failed to sync biometric data");
    }
    setIsSending(false);
  };

  // Navigate to previous or next week
  // const handleWeekChange = (direction) => {
  //   const newDate = new Date(currentWeek);
  //   newDate.setDate(currentWeek.getDate() + direction * 7); // Move by 7 days
  //   setCurrentWeek(newDate);
  // };

  const handleAttendanceClick = () => {
    navigate(`attendance-admin/`);
  };

  // useEffect(() => {
  //   // fetchAttendanceData();
  //   fetchEmployee();
  // }, [currentWeek, user]);

  // useEffect(() => {
  //   fetchEmployee();
  // }, [user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [employeeSearch]);

  const formatToHHMM = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${paddedMinutes}`;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [employeeSearch]);

  // const formatToHHMM = (decimalHours) => {
  //   const hours = Math.floor(decimalHours);
  //   const minutes = Math.round((decimalHours - hours) * 60);
  //   const paddedMinutes = minutes.toString().padStart(2, "0");
  //   return `${hours}:${paddedMinutes}`;
  // };

  return (
    <div className="attendance-container">
      <div className="hr-attendance-header">
        <div className="week-navigation">
          <button onClick={() => handleClampWeekChange(-1)}>&lt;</button>
          <h3>{weekMeta.headerRange}</h3>
          {/* <button onClick={() => handleClampWeekChange(1)}>&gt;</button> */}
          <button
            onClick={() => handleClampWeekChange(1)}
            disabled={getMonday(currentWeek) >= getMonday(new Date())}
          >
            &gt;
          </button>
        </div>

        <div style={{ margin: "10px 0", textAlign: "center" }}>
          <input
            type="text"
            placeholder="Search employee by name..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="search-bar"
            style={{ width: 300, fontSize: 14 }}
          />
        </div>

        <div>
          <button
            style={{ marginRight: "20px" }}
            className="btn-save"
            onClick={() => handleAttendanceClick()}
          >
            Add Attendance
          </button>

          <button
            onClick={() => handleBiometricSync()}
            className="report-btn"
            disabled={isSending}
            style={{ pointerEvents: isSending ? "none" : "auto" }}
          >
            {isSending ? (
              <>
                <span className="spinner-otp" /> Syncing...
              </>
            ) : (
              "Sync Biometric"
            )}
          </button>
        </div>
      </div>

      <div className="attendance-scroll-container">
        <table className="attend-table">
          <thead>
            <tr>
              <th>Employee</th>
              {headerDays.map((d) => {
                const dayName = d.calendar?.day_name || "";
                return (
                  <th
                    key={d.date}
                    // onClick={() => navigate(`timesheetapproval/${d.date}/`)}
                    style={{
                      color: dayName.startsWith("Sun") ? "orange" : "inherit",
                      // cursor: "pointer",
                    }}
                  >
                    {dayName.slice(0, 3)} (
                    {new Date(d.date).toLocaleDateString("en-GB", {
                      month: "2-digit",
                      day: "2-digit",
                    })}
                    )
                  </th>
                );
              })}
              <th>Total Hours</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.map((emp) => {
              const total = totalHoursForEmp(emp);
              return (
                <tr key={emp.employee_id}>
                  <td>
                    {emp.employee_name} {emp.last_name}
                  </td>

                  {emp.week.map((d) => {
                    const leave = d.leave; // preferred when present
                    const bio = d.biometric;
                    const dayDate = new Date(d.date);
                    const today = new Date();
                    let tileClass = "attendance-tile";
                    let content = (
                      <div className="attendance-tile no-data">-</div>
                    );

                    if (leave) {
                      content = (
                        <div
                          className={`attendance-tile leave`}
                          title={`Leave: ${leave.leave_type} (${leave.status})`}
                        >
                          <div>
                            <strong>{leave.leave_type}</strong>
                          </div>
                          <div>
                            {leave.duration ? `${leave.duration} day(s)` : ""}
                          </div>
                          {/* <div className="small">{leave.status}</div> */}
                        </div>
                      );
                    } else if (bio) {
                      const inTime = bio.in_time?.slice?.(0, 5) || "--:--";
                      const outTime = bio.out_time?.slice?.(0, 5) || "--:--";
                      const dur =
                        bio.total_duration ?? bio.work_duration ?? "0";
                      content = (
                        <div
                          className="attendance-tile"
                          // style={{ cursor: "pointer" }}
                          // onClick={() =>
                          //   navigate(
                          //     `timesheetapproval/${emp.employee_id}/${d.date}`
                          //   )
                          // }
                        >
                          <div>
                            <div>
                              {inTime} - {outTime}
                            </div>
                            <div>
                              <strong>Total:</strong> {formatToHHMM(dur)} hrs
                            </div>
                          </div>
                          {bio.modified_by && (
                            <div>
                              <img
                                src="\app2\info.png"
                                alt="info button"
                                className="infoicon"
                              />
                            </div>
                          )}
                        </div>
                      );
                    } else if (d.calendar?.is_holiday) {
                      content = (
                        <div
                          className="attendance-tile holiday"
                          title={`Holiday: ${d.calendar?.notes} `}
                        >
                          {`Holiday: ${d.calendar?.notes} `}
                        </div>
                      );
                    } else if (d.calendar?.is_weekend) {
                      content = (
                        <div
                          className="attendance-tile holiday"
                          title={`Weekend`}
                        >
                          Weekend
                        </div>
                      );
                    } else {
                      if (dayDate <= today) {
                        tileClass = "attendance-tile nobio";
                      } else {
                        tileClass = "attendance-tile no-data";
                      }

                      content = <div className={tileClass}>-</div>;
                    }

                    return (
                      <td key={`${emp.employee_id}-${d.date}`}>{content}</td>
                    );
                  })}

                  <td>{total ? `${formatToHHMM(total)} hrs` : "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <img
            src="/app2/left.png"
            alt="Previous"
            style={{ width: 10, height: 12 }}
          />
        </button>
        <span>
          {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          <img
            src="/app2/right.png"
            alt="Previous"
            style={{ width: 10, height: 12 }}
          />
        </button>
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default HRAttendance;
