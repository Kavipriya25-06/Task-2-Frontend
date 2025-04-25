import React, { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import TeamLeadDailyTimeSheetEntry from "./TeamLeadDailyTimeSheetEntry";
import TeamLeadWeeklyTimeSheetEntry from "./TeamLeadWeeklyTimeSheet";


const TeamLeadTimeSheetEntry = () =>  {
  const [calendarData, setCalendarData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const navigate = useNavigate();

  const fetchCalendarData = async (year) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/calendar/?year=${year}`
      );
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
  };

  useEffect(() => {
    fetchCalendarData(selectedYear);
    const updated = new Date(currentDate);
    updated.setFullYear(selectedYear);
    setCurrentDate(updated);
  }, [selectedYear]);

  const handlePrevMonth = () => {
    const prev = new Date(currentDate);
    prev.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(prev);
    setSelectedYear(prev.getFullYear());
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate);
    next.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(next);
    setSelectedYear(next.getFullYear());
  };

  const handlePrevYear = () => {
    setSelectedYear((prev) => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear((prev) => prev + 1);
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    const updated = new Date(currentDate);
    updated.setMonth(newMonth);
    setCurrentDate(updated);
    setSelectedMonth(newMonth);
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setSelectedYear(newYear);
  };

  const handleReset = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setCurrentDate(now);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthName = currentDate.toLocaleString("default", { month: "long" });

  const monthData = calendarData.filter(
    (entry) => entry.year === year && entry.month === month
  );

  const daysInWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const renderCalendar = () => {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;
    // console.log("Today", todayKey);

    const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const filledData = new Array(offset).fill(null).concat(monthData);

    const rows = [];
    for (let i = 0; i < filledData.length; i += 7) {
      const week = filledData.slice(i, i + 7);
      const weekNumber = week.find((day) => day)?.week_of_year || "-";
      rows.push(
        <React.Fragment key={`week-${weekNumber}-${i}`}>
          <div className="week-number" onClick={() => navigate(`createweekly`)}>W-{weekNumber}</div>
          {week.map((entry, idx) =>
            entry ? (
              <div
                key={entry.calendar_id}
                className={`calendar-cell1 ${entry.is_weekend ? "weekend" : ""} ${entry.is_holiday ? "holiday" : ""}`}
                data-note={entry.notes || ""}
              >
                <div className="day-number">{entry.day}</div>
                <div
                className="day-circle"
                onClick={() => navigate(`createdaily`)}
                style={{ cursor: "pointer" }}
              ></div>
                {entry.notes && (
                  <div className="holiday-note1">{entry.notes}</div>
                )}
                 <div className="bottom-right-circle"></div>
              </div>
            ) : (
              <div key={`empty-${i + idx}`} className="calendar-cell empty" />
            )
          )}
        </React.Fragment>
      );
    }
    return rows;
  };

  return (
    <div className="holiday-calendar">
      <div className="calendar-header">
        <button onClick={handlePrevMonth}>&lt;</button>
        <h3>
          {monthName} {selectedYear}
        </h3>
        <button onClick={handleNextMonth}>&gt;</button>
        {/* Let this be here for now */}
        {/* <button onClick={handlePrevYear} className="calendar-nav-btn">
          ◀ Year
        </button>
        <button onClick={handleNextYear} className="calendar-nav-btn">
          Year ▶
        </button> */}
        <select
          className="calendar-nav-dropdown"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          {Array.from({ length: 12 }, (_, idx) => (
            <option key={idx} value={idx}>
              {new Date(0, idx).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          className="calendar-nav-dropdown"
          value={selectedYear}
          onChange={handleYearChange}
        >
          {Array.from({ length: 20 }, (_, idx) => (
            <option key={idx} value={2014 + idx}>
              {2014 + idx}
            </option>
          ))}
        </select>
        {/* <button
          className="calendar-title-btn"
          onClick={() => navigate("/admin/detail/holidays/holiday-list")}
        >
          Holiday list {year}
        </button> */}
      </div>

      {/* <div className="calendar-grid">
        {daysInWeek.map((day) => (
          <div className="calendar-day-label" key={day}>
            {day}
          </div>
        ))}
        {renderDays()}
      </div> */}
      <div className="calendar-grid">
        <div className="calendar-day-label">Week</div>
        {daysInWeek.map((day) => (
          <div className="calendar-day-label" key={day}>
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  );
};
export default TeamLeadTimeSheetEntry;
