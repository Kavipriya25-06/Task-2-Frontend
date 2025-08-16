import React, { useEffect, useState } from "react";
import config from "../../config";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

const EmployeeAttendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [employeeDetails, setEmployeeDetails] = useState({});

  const navigate = useNavigate();

  const getWeekDates = (date) => {
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setDate(startDate.getDate() + (1 - startDate.getDay())); // Monday
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay())); // Sunday

    const formatDate = (d) =>
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
        .getDate()
        .toString()
        .padStart(2, "0")}`;

    let weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i);
      weekDays.push({
        weekday: day.toLocaleString("en-us", { weekday: "short" }),
        date: day.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
        }),
        key: day.toISOString(),
        mapdate: formatDate(day),
      });
    }

    return { startDate, endDate, weekDays };
  };

  const { startDate, endDate, weekDays } = getWeekDates(currentWeek);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/biometric-weekly-task/${user.employee_id}/?today=${weekDays[0].mapdate}`
      );
      const data = await response.json();

      const latest = {};
      data.forEach((record) => {
        const key = `${record.employee}_${record.date}`;
        if (
          !latest[key] ||
          new Date(record.modified_on) > new Date(latest[key].modified_on)
        ) {
          latest[key] = record;
        }
      });

      const filtered = Object.values(latest);
      setAttendanceData(filtered);

      // Calculate total
      const total = filtered.reduce(
        (acc, cur) => acc + parseFloat(cur.total_duration || 0),
        0
      );
      setTotalHours(total);
    } catch (err) {
      console.error("Failed to fetch employee attendance:", err);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/employees-details/${user.employee_id}/`
      );
      const data = await response.json();
      setEmployeeDetails(data);
    } catch (err) {
      console.error("Failed to fetch employee details", err);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [user]);

  const handleWeekChange = (dir) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + dir * 7);
    setCurrentWeek(newDate);
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentWeek]);

  const formatToHHMM = (decimalHours) => {
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    const paddedMinutes = minutes.toString().padStart(2, "0");
    return `${hours}:${paddedMinutes}`;
  };

  return (
    <div className="attendance-container">
      <div className="hr-attendance-header">
        <div className="week-navigation">
          <button onClick={() => handleWeekChange(-1)}>&lt;</button>
          <h3>
            {startDate.toLocaleDateString("en-GB")} -{" "}
            {endDate.toLocaleDateString("en-GB")}
          </h3>
          <button onClick={() => handleWeekChange(1)}>&gt;</button>
        </div>
        {/* <h2 style={{ fontSize: "20px" }}>
          Attendance for <span>{employeeDetails.employee_name}</span>
        </h2> */}
      </div>

      <div className="table-scroll-container">
        <table className="attend-table">
          <thead>
            <tr>
              {weekDays.map((day) => (
                <th
                  key={day.key}
                  // onClick={() => {
                  //   navigate(`timesheetapproval/${day.mapdate}/`);
                  // }}
                  style={{
                    color: day.weekday === "Sun" ? "orange" : "inherit",
                    // cursor: "pointer",
                  }}
                >
                  {day.weekday} ({day.date})
                </th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {weekDays.map((day) => {
                const attendance = attendanceData.find(
                  (a) =>
                    a.employee === user.employee_id && a.date === day.mapdate
                );

                return (
                  <td key={day.key}>
                    {attendance ? (
                      <div
                        className={`attendance-tile ${(() => {
                          const ts = attendance.timesheets?.[0];
                          if (ts?.submitted && ts?.approved && !ts?.rejected)
                            return "status-approved";
                          if (ts?.submitted && !ts?.approved && ts?.rejected)
                            return "status-rejected";
                          if (ts?.submitted && !ts?.approved && !ts?.rejected)
                            return "status-pending";
                          return "";
                        })()}`}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <div>
                            {attendance.in_time?.slice(0, 5)} -{" "}
                            {attendance.out_time?.slice(0, 5)}
                          </div>
                          <div>
                            <strong>Total:</strong>{" "}
                            {attendance.total_duration
                              ? formatToHHMM(
                                  parseFloat(attendance.total_duration)
                                )
                              : "00:00"}{" "}
                            hrs
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="attendance-tile no-data">-</div>
                    )}
                  </td>
                );
              })}
              <td>{totalHours ? formatToHHMM(totalHours) : "00:00"} hrs</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
