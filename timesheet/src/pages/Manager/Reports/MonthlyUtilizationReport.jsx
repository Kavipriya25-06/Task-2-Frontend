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

const MonthlyUtilizationReport = ({year}) => {
  //new onee
  const [selectedReport, setSelectedReport] = useState("Monthly Utilization");
  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
  };

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  //   const [taskTitles, setTaskTitles] = useState([]);

  //   useEffect(() => {
  //     if (selectedReport === "Utilization Report") {
  //       fetch(`${config.apiBaseURL}/project-hours/`)
  //         .then((res) => res.json())
  //         .then((data) => {
  //           const formatted = [];
  //           const titleSet = new Set();

  //           data.forEach((project) => {
  //             project.assigns.forEach((assign) => {
  //               assign.buildings.forEach((buildingAssign) => {
  //                 const taskHoursMap = {};
  //                 let totalHours = 0;

  //                 buildingAssign.tasks.forEach((taskAssign) => {
  //                   const title = taskAssign.task.task_title;
  //                   const hours = parseFloat(taskAssign.task_consumed_hours);
  //                   taskHoursMap[title] = (taskHoursMap[title] || 0) + hours;
  //                   totalHours += hours;
  //                   titleSet.add(title);
  //                 });

  //                 formatted.push({
  //                   project_code: project.project_code,
  //                   project_name: project.project_title,
  //                   sub_division: buildingAssign.building?.building_code, // ← building code as sub_division
  //                   tasks: taskHoursMap,
  //                   total: totalHours.toFixed(2),
  //                 });
  //               });
  //             });
  //           });

  //           setTaskTitles(Array.from(titleSet));
  //           setReportData(formatted);
  //         })
  //         .catch((error) =>
  //           console.error("Error fetching Utilization Report:", error)
  //         );
  //     }
  //   }, [selectedReport]);

  //Monthly
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    if (selectedReport === "Monthly Utilization") {
      fetch(`${config.apiBaseURL}/monthly-project-hours/`)
        .then((res) => res.json())
        .then((data) => {
          setMonthlyData(data);
        })
        .catch((err) => console.error("Monthly Utilization error:", err));
    }
  }, [selectedReport]);

  const generateMonthLabels = (year) => {
    const monthNames = [
      "Jadvn",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthNames.map((month, index) => ({
      key: `${year}-${(index + 1).toString().padStart(2, "0")}`, // e.g., "2025-05"
      label: `${year} - ${month}`, // e.g., "2025 - May"
    }));
  };

  const allMonths = generateMonthLabels(year);

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
        {selectedReport === "Monthly Utilization" && (
          <>
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Project Name</th>
                  {allMonths.map((monthObj, idx) => {
                    const [year, monthNum] = monthObj.key.split("-"); // "2025-05" → ["2025", "05"]
                    const monthNames = [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ];
                    const monthLabel = monthNames[parseInt(monthNum, 10) - 1];

                    return (
                      <th key={idx} className="year-header">
                        <div className="year">{year}</div>
                        <hr className="divider" />
                        <div className="quarter">{monthLabel}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((project, i) => {
                  const monthMap = {};
                  project.task_consumed_hours_by_month?.forEach((monthObj) => {
                    monthMap[monthObj.month] = monthObj.hours;
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
                      {allMonths.map((m, idx) => (
                        <td key={idx}>{monthMap[m.key] || 0}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
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

export default MonthlyUtilizationReport;
