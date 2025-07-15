// // src\pages\Manager\ManagerAttendance.jsx

import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const HRAttendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Start with current week
  const [totalHours, setTotalHours] = useState({});
  const rowsPerPage = 15;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = employeeData.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(employeeData.length / rowsPerPage);
  const navigate = useNavigate();
  const [employeeSearch, setEmployeeSearch] = useState("");

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

  // Fetch Attendance Data for the week
  const fetchAttendanceData = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/weekly-attendance/?today=${weekDays[0].mapdate}`
      );
      const data = await response.json();
      console.log("Raw attendance data:", data);

      // Step 1: Group by employee + date and pick latest
      const latestRecords = {};

      data.forEach((record) => {
        const key = `${record.employee}_${record.date}`;
        // If no entry yet OR this record has newer modified_on, replace it
        if (
          !latestRecords[key] ||
          new Date(record.modified_on) >
            new Date(latestRecords[key].modified_on)
        ) {
          latestRecords[key] = record;
        }
      });

      // Step 2: Convert back to array
      const filteredData = Object.values(latestRecords);
      console.log("Filtered latest attendance data:", filteredData);

      setAttendanceData(filteredData);
      calculateTotalHours(filteredData);
    } catch (err) {
      console.error("Unable to fetch attendance data", err);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/emp-details/`);
      const data = await response.json();
      console.log("User data", data);
      setEmployeeData(data);
    } catch (err) {
      console.error("Unable to fetch attendance data", err);
    }
  };

  // Calculate total hours for each employee
  const calculateTotalHours = (data) => {
    let hours = {};
    data.forEach((attendance) => {
      const totalDuration = parseFloat(attendance.total_duration || "0"); // use total_duration
      hours[attendance.employee] =
        (hours[attendance.employee] || 0) + totalDuration;
    });
    setTotalHours(hours);
  };

  // Navigate to previous or next week
  const handleWeekChange = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + direction * 7); // Move by 7 days
    setCurrentWeek(newDate);
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [currentWeek]);

  useEffect(() => {
    fetchEmployee();
  }, [user]);

  return (
    <div className="attendance-container">
      <div className="hr-attendance-header">
        <div className="week-navigation">
          <button onClick={() => handleWeekChange(-1)}>&lt;</button>
          <h3>
            {startDate.toLocaleDateString("en-GB")} -{" "}
            {endDate.toLocaleDateString("en-GB")}
          </h3>
          <button onClick={() => handleWeekChange(1)}> &gt;</button>
        </div>
        <div style={{ margin: "10px 0", textAlign: "center" }}>
          <input
            type="text"
            placeholder="Search employee by name..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            className="search-bar"
            style={{
              width: "300px",
              fontSize: "14px",
              
            }}
          />
        </div>
      </div>

      <div className="attendance-scroll-container">
        <table className="attend-table">
          <thead>
            <tr>
              <th>Employee</th>
              {weekDays.map((day) => (
                <th
                  key={day.key}
                  style={{
                    color: day.weekday === "Sun" ? "orange" : "inherit",
                  }}
                >
                  {day.weekday} ({day.date})
                </th>
              ))}
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {currentRows
              .filter((emp) =>
                emp.employee_name
                  .toLowerCase()
                  .includes(employeeSearch.toLowerCase())
              )
              .map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.employee_name}</td>
                  {/* For each day of the week, check if attendance data exists */}
                  {weekDays.map((day) => {
                    // Find the attendance record for this employee on this specific day
                    const attendance = attendanceData.find(
                      (a) =>
                        a.employee === emp.employee_id && a.date === day.mapdate
                    );

                    return (
                      <td key={day.key}>
                        {attendance ? (
                          <div className="attendance-tile">
                            <div>
                              <div>
                                {attendance.in_time.slice(0, 5)} -{" "}
                                {attendance.out_time?.slice(0, 5)}
                              </div>
                              <div>
                                <strong>Total:</strong>{" "}
                                {attendance.total_duration} hrs
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="attendance-tile no-data">-</div>
                        )}
                      </td>
                    );
                  })}

                  <td>
                    {totalHours[emp.employee_id]
                      ? `${totalHours[emp.employee_id].toFixed(2)} hrs`
                      : "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <img
            src="/left.png"
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
            src="/right.png"
            alt="Previous"
            style={{ width: 10, height: 12 }}
          />
        </button>
      </div>
    </div>
  );
};

export default HRAttendance;
