// src\pages\TeamLead\TeamLeadAttendance.jsx

import { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const toIsoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

// Your durations are strings like "9.10". Treat them as decimal hours (9.10 → 9h + 0.10*60m).
const formatToHHMM = (decimalHours) => {
  const num = Number(decimalHours) || 0;
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);
  return `${String(hours)}:${String(minutes).padStart(2, "0")}`;
};

const TeamLeadAttendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [rows, setRows] = useState([]); // [{ employee_id, employee_name, week: [...] }]
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [employeeData, setEmployeeData] = useState([]);
  const [activeIds, setActiveIds] = useState(new Set());

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
        `${config.apiBaseURL}/weekly-attendance-track/${user.employee_id}/?today=${weekMeta.todayParam}`
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
        fetch(
          `${config.apiBaseURL}/weekly-attendance-track/${user.employee_id}/?today=${today}`
        ),
        // active-as-of-date list (with manager filter)
        fetch(
          `${config.apiBaseURL}/emp-details-resg/${user.employee_id}/?today=${today}`
        ),
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

  const fetchEmployee = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/emp-details-resg/${user.employee_id}/?today=${weekMeta.todayParam}`
      );
      const data = await response.json();
      console.log("User data", data);
      setEmployeeData(data);
    } catch (err) {
      console.error("Unable to fetch attendance data", err);
    }
  };

  // useEffect(() => {
  //   fetchEmployee();
  // }, [currentWeek, user]);

  useEffect(() => {
    // fetchWeek();
    fetchWeekAndActive();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, weekMeta.todayParam]);

  // Use the first employee’s week to render headers (server guarantees 7 days)
  const headerDays = useMemo(() => rows?.[0]?.week ?? [], [rows]);

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

  const handleWeekChange = (dir) => {
    const next = new Date(currentWeek);
    next.setDate(currentWeek.getDate() + dir * 7);
    setCurrentWeek(next);
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

  return (
    <div className="attendance-container">
      <div className="attendance-header">
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
      </div>

      <div className="table-scroll-container">
        <table className="attend-table">
          <thead>
            <tr>
              <th>Employee</th>
              {headerDays.map((d) => {
                const dayName = d.calendar?.day_name || "";
                return (
                  <th
                    key={d.date}
                    onClick={() => navigate(`timesheetapproval/${d.date}/`)}
                    style={{
                      color: dayName.startsWith("Sun") ? "orange" : "inherit",
                      cursor: "pointer",
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
            {filteredRows.map((emp) => {
              const total = totalHoursForEmp(emp);
              return (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_name}</td>

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
                      // Check timesheet statuses
                      if (bio.timesheets && bio.timesheets.length > 0) {
                        const ts = bio.timesheets[0]; // assuming one per day
                        if (ts.submitted && ts.approved && !ts.rejected)
                          tileClass += " status-approved";
                        else if (ts.submitted && !ts.approved && ts.rejected)
                          tileClass += " status-rejected";
                        else if (ts.submitted && !ts.approved && !ts.rejected)
                          tileClass += " status-pending";
                      }
                      const dur =
                        bio.total_duration ?? bio.work_duration ?? "0";
                      content = (
                        <div
                          className="attendance-tile"
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            navigate(
                              `timesheetapproval/${emp.employee_id}/${d.date}`
                            )
                          }
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

      {/* Quick styles (adapt to your CSS) */}
    </div>
  );
};

export default TeamLeadAttendance;
