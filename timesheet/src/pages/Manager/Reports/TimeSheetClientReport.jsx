import React, { useEffect, useState } from "react";
import config from "../../../config";
import { ToastContainerComponent } from "../../../constants/Toastify";

const TimeSheetClientReport = () => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [employees, setEmployees] = useState([]);
  const [weeklyTimesheetData, setWeeklyTimesheetData] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const [weekDays, setWeekDays] = useState([]);

  const handleWeekChange = (e) => {
    const startDateStr = e.target.value;
    const startDate = new Date(startDateStr);
    setSelectedWeekStart(startDate);

    const days = [];
    for (let i = 1; i < 8; i++) {
      const day = new Date(startDate);
      day.setDate(day.getDate() + i); // Mon to Sun
      days.push(day);
    }
    setWeekDays(days);
  };

  // Fetch employee list on mount
  useEffect(() => {
    fetch(`${config.apiBaseURL}/employees/`)
      .then((res) => res.json())
      .then(setEmployees)
      .catch(console.error);
  }, []);

  // Update week list whenever month or year changes
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      const wDates = getWeekStartDatesForMonth(+selectedYear, +selectedMonth);
      setWeeks(wDates);
      setWeekDates(wDates);
    }
  }, [selectedYear, selectedMonth]);

  // Fetch timesheet data based on selections
  useEffect(() => {
    if (selectedYear && selectedMonth && selectedEmployee) {
      const today = `${selectedYear}-${String(selectedMonth).padStart(
        2,
        "0"
      )}-01`;
      fetch(
        `${config.apiBaseURL}/employee-report-week/${selectedEmployee}/?today=${today}`
      )
        .then((res) => res.json())
        .then(setWeeklyTimesheetData)
        .catch(console.error);
    }
  }, [selectedYear, selectedMonth, selectedEmployee]);

  const getWeekStartDatesForMonth = (year, month) => {
    const dates = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    let current = new Date(firstDay);
    // Move to previous Monday
    current.setDate(current.getDate() - ((current.getDay() + 6) % 7));

    while (current <= lastDay) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    return dates;
  };

  const getISOWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i);

  const groupedData = weeklyTimesheetData.reduce((acc, item) => {
    const taskAssignId = item.task_assign.task_assign_id;

    const workedDate = item.date; // "YYYY-MM-DD"
    const isInSelectedWeek = weekDays.some(
      (day) => day.toISOString().split("T")[0] === workedDate
    );

    if (!isInSelectedWeek) return acc; // Skip dates outside selected week

    if (!acc[taskAssignId]) {
      acc[taskAssignId] = {
        data: [],
        workedDates: new Set(),
        taskAssign: item.task_assign,
      };
    }

    acc[taskAssignId].data.push(item);
    acc[taskAssignId].workedDates.add(item.date);

    return acc;
  }, {});

  return (
    <div className="employee-table-wrapper">
      <div className="report-form">
        <div className="report-form-group">
          <label>
            <strong>Employee</strong>
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_name}
              </option>
            ))}
          </select>
        </div>

        <div className="report-form-group">
          <label>
            <strong>Month</strong>
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div className="report-form-group">
          <label>
            <strong>Year</strong>
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {yearRange.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="report-form-group">
          <h5>Designation:</h5>
        </div>

        <div className="report-form-group">
          <label>
            <strong>Week</strong>
          </label>
          <select name="week" id="week" onChange={handleWeekChange}>
            <option value="">Select Week</option>
            {weeks.map((date, idx) => {
              const weekNo = getISOWeekNumber(date);
              //   const monday = date.toLocaleDateString("en-GB");
              //   const sunday = new Date(date);
              //   sunday.setDate(sunday.getDate() + 6);
              //   const sundayFormatted = sunday.toLocaleDateString("en-GB");

              return (
                <option key={idx} value={date.toISOString().split("T")[0]}>
                  Week {weekNo}
                </option>
              );
            })}
          </select>
        </div>

        <div className="report-form-group">
          <select name="designationYear" id="designationYear">
            <option value="">Structural-Detailing</option>
            <option value="">Strucutural Design</option>
            <option value="">Piping</option>
            <option value="">Electrical&Instrumentation</option>
          </select>
        </div>
      </div>

      <div className="table-wrapper" style={{ maxHeight: "400px" }}>
        <table className="employee-table">
          <thead>
            <tr>
              <th>Discipline Code</th>
              <th>Project Code</th>
              <th>Sub‑Division</th>
              <th>Area of Work</th>
              <th>Variation</th>
              <th>Work Day</th>
              {weekDays.map((day, i) => (
                <th key={i} className="year-headers">
                  <div className="year"> {day.toLocaleDateString("en-GB")}</div>{" "}
                  <br />
                  <hr className="divider" />
                  <div className="quarter">
                    {day.toLocaleDateString("en-GB", { weekday: "short" })}
                  </div>
                </th>
              ))}

              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(groupedData).length > 0 ? (
              Object.values(groupedData).map((group, i) => {
                return (
                  <tr key={i}>
                    <td>{group.taskAssign.task.task_code}</td>
                    <td>
                      {
                        group.taskAssign.building_assign.project_assign.project
                          .project_code
                      }
                    </td>
                    <td>
                      {group.taskAssign.building_assign.building.building_title}
                    </td>
                    <td>{group.taskAssign.task.task_title || "N/A"}</td>
                    <td>{/* Variation */}</td>

                    {/* Work Day count */}
                    <td>{group.workedDates.size}</td>

                    {/* Each day of the week */}
                    {weekDays.map((day, idx) => {
                      const formattedDay = day.toISOString().split("T")[0];
                      const entry = group.data.find(
                        (e) => e.date === formattedDay
                      );
                      return (
                        <td key={idx}>
                          {entry ? parseFloat(entry.task_hours) : 0}
                        </td>
                      );
                    })}

                    {/* Total task hours */}
                    <td>
                      {group.data.reduce(
                        (sum, e) => sum + parseFloat(e.task_hours),
                        0
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7 + weekDays.length}>
                  No data available for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainerComponent />
    </div>
  );
};

export default TimeSheetClientReport;
