// src\pages\Manager\ManagerAttendance.jsx

import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const ManagerAttendance = () => {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(new Date()); // Start with current week
  const [totalHours, setTotalHours] = useState({});

  // Get the start and end date of the week
  const getWeekDates = (date) => {
    const startDate = new Date(date);
    const endDate = new Date(date);
    startDate.setDate(startDate.getDate() + (1 - startDate.getDay())); // Set to Monday
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay())); // Set to Sunday
    return { startDate, endDate };
  };

  const { startDate, endDate } = getWeekDates(currentWeek);

  // Fetch Attendance Data for the week
  const fetchAttendanceData = async () => {
    try {
      // const response = await fetch(
      //   `${config.apiBaseURL}/attendance/${
      //     user.employee_id
      //   }/?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`
      // );
      const response = await fetch(
        `${config.apiBaseURL}/attendance/${user.employee_id}/`
      );
      const data = await response.json();
      console.log("Attendance data", data);
      // setAttendanceData(data);
      setAttendanceData(groupAttendanceByEmployee(data));
      console.log("Grouped Attendance data", groupAttendanceByEmployee(data));
      calculateTotalHours(groupAttendanceByEmployee(data));
      // calculateTotalHours(data);
    } catch (err) {
      console.error("Unable to fetch attendance data", err);
    }
  };

  // Group attendance data by employee
  const groupAttendanceByEmployee = (data) => {
    const employeeAttendance = {};

    data.forEach((attendance) => {
      const employeeId = attendance.employee;
      if (!employeeAttendance[employeeId]) {
        employeeAttendance[employeeId] = {
          employee_name: attendance.employee_name,
          attendance: {},
        };
      }
      const dayOfWeek = new Date(attendance.date).toLocaleString("en-us", {
        weekday: "short",
      });
      employeeAttendance[employeeId].attendance[dayOfWeek] =
        attendance.work_duration;
    });
    return Object.values(employeeAttendance); // Convert object to array for rendering
  };

  // // Calculate total hours for each employee
  // const calculateTotalHours = (data) => {
  //   let hours = {};
  //   data.forEach((attendance) => {
  //     const totalDuration = attendance.work_duration;
  //     hours[attendance.employee.employee_id] =
  //       (hours[attendance.employee.employee_id] || 0) + totalDuration;
  //   });
  //   setTotalHours(hours);
  // };

  // Calculate total hours for each employee
  const calculateTotalHours = (data) => {
    let hours = {};
    data.forEach((employee) => {
      let total = 0;
      Object.values(employee.attendance).forEach((dayHours) => {
        total += parseFloat(dayHours || 0);
      });
      hours[employee.employee_id] = total;
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

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <div className="week-navigation">
          <button onClick={() => handleWeekChange(-1)}>&lt;</button>
          <h3>
            {startDate.toLocaleDateString("en-GB")} -{" "}
            {endDate.toLocaleDateString("en-GB")}
          </h3>
          <button onClick={() => handleWeekChange(1)}> &gt;</button>
        </div>
        <div>
          <button>Attendance Admin</button>
        </div>
      </div>

      <div className="attendance-table">
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
              <th>Sun</th>
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((employee) => (
              <tr key={employee.employee_id}>
                <td>{employee.employee_name}</td>
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                  (day) => (
                    <td key={`${employee.employee_name}-${day}`}>
                      {employee.attendance[day] ? (
                        <span>{employee.attendance[day]} hours</span>
                      ) : (
                        <span className="leave-label">Absent</span>
                      )}
                    </td>
                  )
                )}
                <td>{totalHours[employee.employee_id] || 0} hrs</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManagerAttendance;
