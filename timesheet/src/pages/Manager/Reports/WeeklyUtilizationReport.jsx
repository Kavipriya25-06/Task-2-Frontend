import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";
import { FaEdit } from "react-icons/fa";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../../constants/Toastify";

const WeeklyUtilizationReport = ({ year }) => {
  //new onee
  const [selectedReport, setSelectedReport] = useState("Weekly Utilization");

  // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  useEffect(() => {
    if (selectedReport === "Weekly Utilization") {
      setLoading(true);
      fetch(`${config.apiBaseURL}/weekly-project-hours/`)
        .then((res) => res.json())
        .then((data) => {
          setWeeklyData(data);
          if (data.length === 0) setHasMoreData(false);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Weekly Utilization error:", err);
          setLoading(false);
        });
    }
  }, [selectedReport]);

  const generateWeeksOfYear = (year) => {
    const weeks = [];
    for (let i = 1; i <= 52; i++) {
      const week = i < 10 ? `0${i}` : i.toString();
      weeks.push(`${year}-W${week}`);
    }
    return weeks;
  };

  const allWeeks = generateWeeksOfYear(year); // only 2025 weeks

  return (
    <div className="employee-table-wrapper">
      <div className="table-wrapper" style={{ maxHeight: "400px" }}>
        {loading ? (
          <div className="loading-message">Loading data...</div>
        ) : weeklyData.length === 0 ? (
          <div className="no-data-message">No utilization data available.</div>
        ) : (
          selectedReport === "Weekly Utilization" && (
            <table className="employee-table">
              <thead>
                <tr>
                  <th rowSpan="2">Project Code</th>
                  <th rowSpan="2">Project Name</th>
                  {allWeeks.map((weekStr, idx) => {
                    const [year, weekRaw] = weekStr.split("-");
                    const week = weekRaw.replace("W", "");
                    return (
                      <th key={idx} className="year-header">
                        <div className="year">{year}</div>
                        <hr className="divider" />
                        <div className="quarter">W{week}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {weeklyData.map((project, i) => {
                  const weekMap = {};
                  project.task_consumed_hours_by_week?.forEach((weekObj) => {
                    weekMap[weekObj.week] = weekObj.hours;
                  });

                  return (
                    <tr key={i}>
                      <td>{project.project_code}</td>
                      <td
                        className="truncate-text"
                        title={project.project_title}
                      >
                        {project.project_title}
                      </td>
                      {allWeeks.map((weekStr, idx) => (
                        <td key={idx}>{weekMap[weekStr] || 0}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                {!loading && !hasMoreData && weeklyData.length > 0 && (
                  <tr>
                    <td
                      colSpan={allWeeks.length + 2}
                      style={{
                        textAlign: "center",
                        padding: "10px",
                        color: "#888",
                      }}
                    >
                      No more data available.
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          )
        )}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default WeeklyUtilizationReport;
