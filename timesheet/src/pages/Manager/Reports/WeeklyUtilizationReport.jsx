// src/pages/HR/EmployeeList.jsx

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

const WeeklyUtilizationReport = ({year}) => {;
  //new onee
  const [selectedReport, setSelectedReport] = useState(
    "Weekly Utilization"
  );

  // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [weeklyData, setWeeklyData] = useState([]);

    

  useEffect(() => {
    if (selectedReport === "Weekly Utilization") {
      fetch(`${config.apiBaseURL}/weekly-project-hours/`)
        .then((res) => res.json())
        .then((data) => {
          setWeeklyData(data);
        })
        .catch((err) => console.error("Weekly Utilization error:", err));
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
      <div
        className="table-wrapper"
        style={{ maxHeight: "400px" }}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (
            scrollTop + clientHeight >= scrollHeight - 10 &&
            !isLoadingMoreEmployees &&
            hasMoreEmployees
          ) {
            setIsLoadingMoreEmployees(true);
            setTimeout(() => {
              const nextVisible = visibleEmployees + 10;
              if (nextVisible >= filteredEmployees.length) {
                setVisibleEmployees(filteredEmployees.length);
                setHasMoreEmployees(false);
              } else {
                setVisibleEmployees(nextVisible);
              }
              setIsLoadingMoreEmployees(false);
            }, 1000); // Simulate 2 seconds loading
          }
        }}
      >

        {selectedReport === "Weekly Utilization" && (
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
                    <td className="truncate-text" title={project.project_title}>
                      {project.project_title}
                    </td>
                    {allWeeks.map((weekStr, idx) => (
                      <td key={idx}>{weekMap[weekStr] || 0}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {/* {isLoadingMoreEmployees && (
          <div className="loading-message">Loading...</div>
        )}
        {!hasMoreEmployees && <div className="no-message">No more data</div>} */}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default WeeklyUtilizationReport;
