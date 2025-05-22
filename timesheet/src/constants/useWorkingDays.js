// src\utils\useWorkingDays.js

// src/hooks/useWorkingDays.js
import { useState, useEffect } from "react";
import config from "../config";

const useWorkingDays = (startDate, endDate) => {
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [error, setError] = useState(null);

  const fetchCalendar = async () => {
    try {
      const res = await fetch(
        `${config.apiBaseURL}/calendar/?year=${selectedYear}`
      ); // adjust URL
      const data = await res.json();
      setCalendarData(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch calendar");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  useEffect(() => {
    if (!startDate || !endDate || !calendarData.length) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;

    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const dateStr = dt.toISOString().split("T")[0];
      const cal = calendarData.find((c) => c.date === dateStr);
      if (cal && !cal.is_weekend && !cal.is_holiday) {
        count++;
      }
    }

    setDuration(count);
  }, [startDate, endDate, calendarData]);

  return { duration, loading, error };
};

export default useWorkingDays;
