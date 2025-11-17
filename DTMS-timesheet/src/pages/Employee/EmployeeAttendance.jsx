// import React, { useEffect, useState } from "react";
// import config from "../../config";
// import { useAuth } from "../../AuthContext";
// import { useNavigate } from "react-router-dom";

// const EmployeeAttendance = () => {
//   const { user } = useAuth();
//   const [attendanceData, setAttendanceData] = useState([]);
//   const [totalHours, setTotalHours] = useState(0);
//   const [currentWeek, setCurrentWeek] = useState(new Date());
//   const [employeeDetails, setEmployeeDetails] = useState({});

//   const navigate = useNavigate();

//   const getWeekDates = (date) => {
//     const startDate = new Date(date);
//     const endDate = new Date(date);
//     startDate.setDate(startDate.getDate() + (1 - startDate.getDay())); // Monday
//     endDate.setDate(endDate.getDate() + (7 - endDate.getDay())); // Sunday

//     const formatDate = (d) =>
//       `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
//         .getDate()
//         .toString()
//         .padStart(2, "0")}`;

//     let weekDays = [];
//     for (let i = 0; i < 7; i++) {
//       const day = new Date(startDate);
//       day.setDate(day.getDate() + i);
//       weekDays.push({
//         weekday: day.toLocaleString("en-us", { weekday: "short" }),
//         date: day.toLocaleDateString("en-GB", {
//           day: "2-digit",
//           month: "2-digit",
//         }),
//         key: day.toISOString(),
//         mapdate: formatDate(day),
//       });
//     }

//     return { startDate, endDate, weekDays };
//   };

//   const { startDate, endDate, weekDays } = getWeekDates(currentWeek);

//   const fetchAttendance = async () => {
//     try {
//       const response = await fetch(
//         `${config.apiBaseURL}/biometric-weekly-task/${user.employee_id}/?today=${weekDays[0].mapdate}`
//       );
//       const data = await response.json();

//       const latest = {};
//       data.forEach((record) => {
//         const key = `${record.employee}_${record.date}`;
//         if (
//           !latest[key] ||
//           new Date(record.modified_on) > new Date(latest[key].modified_on)
//         ) {
//           latest[key] = record;
//         }
//       });

//       const filtered = Object.values(latest);
//       setAttendanceData(filtered);

//       // Calculate total
//       const total = filtered.reduce(
//         (acc, cur) => acc + parseFloat(cur.total_duration || 0),
//         0
//       );
//       setTotalHours(total);
//     } catch (err) {
//       console.error("Failed to fetch employee attendance:", err);
//     }
//   };

//   const fetchEmployeeDetails = async () => {
//     try {
//       const response = await fetch(
//         `${config.apiBaseURL}/employees-details/${user.employee_id}/`
//       );
//       const data = await response.json();
//       setEmployeeDetails(data);
//     } catch (err) {
//       console.error("Failed to fetch employee details", err);
//     }
//   };

//   useEffect(() => {
//     fetchEmployeeDetails();
//   }, [user]);

//   const handleWeekChange = (dir) => {
//     const newDate = new Date(currentWeek);
//     newDate.setDate(newDate.getDate() + dir * 7);
//     setCurrentWeek(newDate);
//   };

//   useEffect(() => {
//     fetchAttendance();
//   }, [currentWeek]);

//   const formatToHHMM = (decimalHours) => {
//     const hours = Math.floor(decimalHours);
//     const minutes = Math.round((decimalHours - hours) * 60);
//     const paddedMinutes = minutes.toString().padStart(2, "0");
//     return `${hours}:${paddedMinutes}`;
//   };

//   return (
//     <div className="attendance-container">
//       <div className="hr-attendance-header">
//         <div className="week-navigation">
//           <button onClick={() => handleWeekChange(-1)}>&lt;</button>
//           <h3>
//             {startDate.toLocaleDateString("en-GB")} -{" "}
//             {endDate.toLocaleDateString("en-GB")}
//           </h3>
//           <button onClick={() => handleWeekChange(1)}>&gt;</button>
//         </div>
//         {/* <h2 style={{ fontSize: "20px" }}>
//           Attendance for <span>{employeeDetails.employee_name}</span>
//         </h2> */}
//       </div>

//       <div className="table-scroll-container">
//         <table className="attend-table">
//           <thead>
//             <tr>
//               {weekDays.map((day) => (
//                 <th
//                   key={day.key}
//                   // onClick={() => {
//                   //   navigate(`timesheetapproval/${day.mapdate}/`);
//                   // }}
//                   style={{
//                     color: day.weekday === "Sun" ? "orange" : "inherit",
//                     // cursor: "pointer",
//                   }}
//                 >
//                   {day.weekday} ({day.date})
//                 </th>
//               ))}
//               <th>Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr>
//               {weekDays.map((day) => {
//                 const attendance = attendanceData.find(
//                   (a) =>
//                     a.employee === user.employee_id && a.date === day.mapdate
//                 );

//                 return (
//                   <td key={day.key}>
//                     {attendance ? (
//                       <div
//                         className={`attendance-tile ${(() => {
//                           const ts = attendance.timesheets?.[0];
//                           if (ts?.submitted && ts?.approved && !ts?.rejected)
//                             return "status-approved";
//                           if (ts?.submitted && !ts?.approved && ts?.rejected)
//                             return "status-rejected";
//                           if (ts?.submitted && !ts?.approved && !ts?.rejected)
//                             return "status-pending";
//                           return "";
//                         })()}`}
//                       >
//                         <div
//                           style={{
//                             display: "flex",
//                             flexDirection: "column",
//                             gap: "4px",
//                           }}
//                         >
//                           <div>
//                             {attendance.in_time?.slice(0, 5)} -{" "}
//                             {attendance.out_time?.slice(0, 5)}
//                           </div>
//                           <div>
//                             <strong>Total:</strong>{" "}
//                             {attendance.total_duration
//                               ? formatToHHMM(
//                                   parseFloat(attendance.total_duration)
//                                 )
//                               : "00:00"}{" "}
//                             hrs
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="attendance-tile no-data">-</div>
//                     )}
//                   </td>
//                 );
//               })}
//               <td>{totalHours ? formatToHHMM(totalHours) : "00:00"} hrs</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default EmployeeAttendance;

// src/pages/Employee/EmployeeAttendance.jsx
import React, { useEffect, useMemo, useState } from "react";
import config from "../../config";
import { useAuth } from "../../AuthContext";

const toIsoDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

const formatToHHMM = (decimalHours) => {
  const num = Number(decimalHours) || 0;
  const h = Math.floor(num);
  const m = Math.round((num - h) * 60);
  return `${String(h)}:${String(m).padStart(2, "0")}`;
};

// Normalize to Monday (00:00:00)
const getMonday = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const EmployeeAttendance = () => {
  const { user } = useAuth();

  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [empWeek, setEmpWeek] = useState(null); // { employee_id, employee_name, ..., week:[...] }

  // Compute week header & ?today param
  const weekMeta = useMemo(() => {
    const monday = getMonday(currentWeek);
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

  // Fetch single-employee weekly payload
  const fetchWeek = async () => {
    if (!user?.employee_id) return;
    try {
      const res = await fetch(
        `${config.apiBaseURL}/biometric-weekly-track/${user.employee_id}/?today=${weekMeta.todayParam}`
      );
      const data = await res.json();
      // API returns a list with one employee; keep it consistent
      const row = Array.isArray(data) ? data[0] : data;
      setEmpWeek(row || null);
    } catch (e) {
      console.error("Failed to fetch employee weekly attendance", e);
      setEmpWeek(null);
    }
  };

  useEffect(() => {
    fetchWeek();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, weekMeta.todayParam]);

  // Clamp week navigation (don’t go beyond current week)
  const handleWeekChange = (dir) => {
    const next = new Date(currentWeek);
    next.setDate(currentWeek.getDate() + dir * 7);
    const nextMonday = getMonday(next);
    const currentMonday = getMonday(new Date());
    if (nextMonday <= currentMonday) {
      setCurrentWeek(next);
    }
  };

  const headerDays = empWeek?.week ?? [];

  const totalHours = useMemo(() => {
    if (!empWeek?.week) return 0;
    return empWeek.week.reduce((sum, d) => {
      const b = d.biometric;
      if (!b) return sum;
      const val = b.total_duration ?? b.work_duration ?? 0;
      return sum + (Number(val) || 0);
    }, 0);
  }, [empWeek]);

  return (
    <div className="attendance-container">
      <div className="hr-attendance-header">
        <div className="week-navigation">
          <button onClick={() => handleWeekChange(-1)}>&lt;</button>
          <h3>{weekMeta.headerRange}</h3>
          <button
            onClick={() => handleWeekChange(1)}
            disabled={getMonday(currentWeek) >= getMonday(new Date())}
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="table-scroll-container">
        <table className="attend-table">
          <thead>
            <tr>
              {headerDays.map((d) => {
                const dayName = d.calendar?.day_name || "";
                return (
                  <th
                    key={d.date}
                    style={{
                      color:
                        d.calendar?.is_weekend || dayName.startsWith("Sun")
                          ? "orange"
                          : "inherit",
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
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              {headerDays.map((d) => {
                const leave = d.leave;
                const bio = d.biometric;

                // Missing biometric (past/today, not weekend/holiday) => red tile
                const dayDate = new Date(d.date);
                const today = new Date();
                dayDate.setHours(0, 0, 0, 0);
                today.setHours(0, 0, 0, 0);

                let tileClass = "attendance-tile";
                let content = <div className="attendance-tile no-data">-</div>;

                if (leave) {
                  tileClass = "attendance-tile leave";
                  content = (
                    <div
                      className={tileClass}
                      title={`Leave: ${leave.leave_type} (${leave.status})`}
                    >
                      <div>
                        <strong>{leave.leave_type}</strong>
                      </div>
                      <div>
                        {leave.duration ? `${leave.duration} day(s)` : ""}
                      </div>
                    </div>
                  );
                } else if (bio) {
                  const inTime = bio.in_time?.slice?.(0, 5) || "--:--";
                  const outTime = bio.out_time?.slice?.(0, 5) || "--:--";
                  const dur = bio.total_duration ?? bio.work_duration ?? "0";

                  // Timesheet status → classname
                  let statusClass = "";
                  if (bio.timesheets && bio.timesheets.length > 0) {
                    const ts = bio.timesheets[0];
                    if (ts.submitted && ts.approved && !ts.rejected)
                      statusClass = "status-approved";
                    else if (ts.submitted && !ts.approved && ts.rejected)
                      statusClass = "status-rejected";
                    else if (ts.submitted && !ts.approved && !ts.rejected)
                      statusClass = "status-pending";
                  }

                  tileClass = `attendance-tile ${statusClass}`.trim();
                  content = (
                    <div className={tileClass}>
                      <div>
                        <div>
                          {inTime} - {outTime}
                        </div>
                        <div>
                          <strong>Total:</strong> {formatToHHMM(dur)} hrs
                        </div>
                      </div>
                    </div>
                  );
                } else if (d.calendar?.is_holiday) {
                  tileClass = "attendance-tile holiday";
                  content = (
                    <div
                      className={tileClass}
                      title={`Holiday: ${d.calendar?.notes || ""}`}
                    >
                      Holiday
                    </div>
                  );
                } else if (d.calendar?.is_weekend) {
                  tileClass = "attendance-tile holiday";
                  content = (
                    <div className={tileClass} title="Weekend">
                      Weekend
                    </div>
                  );
                } else {
                  // No bio/leave, not holiday/weekend
                  tileClass =
                    dayDate <= today
                      ? "attendance-tile nobio"
                      : "attendance-tile no-data";
                  content = <div className={tileClass}>-</div>;
                }

                return <td key={d.date}>{content}</td>;
              })}

              <td>{formatToHHMM(totalHours)} hrs</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
