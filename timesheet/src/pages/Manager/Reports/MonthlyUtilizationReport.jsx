import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
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

const MonthlyUtilizationReport = forwardRef(({ year }, ref) => {
  //new onee

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/monthly-project-hours/`)
      .then((res) => res.json())
      .then((data) => {
        setMonthlyData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Monthly Utilization error:", err);
        setLoading(false);
      });
  }, []);

  const generateMonthLabels = (year) => {
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
    return monthNames.map((month, index) => ({
      key: `${year}-${(index + 1).toString().padStart(2, "0")}`, // e.g., "2025-05"
      label: `${year} - ${month}`, // e.g., "2025 - May"
    }));
  };

  const allMonths = generateMonthLabels(year);

  useImperativeHandle(ref, () => ({
    downloadReport: () => {
      const headers = [
        "Project Code",
        "Project Name",
        ...allMonths.map((m) => m.label),
      ];

      const data = monthlyData.map((project) => {
        const monthMap = {};
        project.task_consumed_hours_by_month?.forEach((monthObj) => {
          monthMap[monthObj.month] = monthObj.hours;
        });

        const row = [
          project.project_code,
          project.project_title,
          ...allMonths.map((m) => monthMap[m.key] || 0),
        ];

        return row;
      });

      const worksheetData = [headers, ...data];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      saveAs(blob, `MonthlyUtilizationReport_${year}.xlsx`);
    },
  }));

  return (
    <div className="employee-table-wrapper">
      <div className="table-wrapper" style={{ maxHeight: "400px" }}>
        {loading ? (
          <div className="loading-message">Loading data...</div>
        ) : monthlyData.length === 0 ? (
          <div className="no-data-message">No utilization data available.</div>
        ) : (
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
                    <td className="truncate-text" title={project.project_title}>
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
        )}
        {/* {isLoadingMoreEmployees && (
          <div className="loading-message">Loading...</div>
        )}
        {!hasMoreEmployees && <div className="no-message">No more data</div>} */}
      </div>
      <ToastContainerComponent />
    </div>
  );
});

export default MonthlyUtilizationReport;
