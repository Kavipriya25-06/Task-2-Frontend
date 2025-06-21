import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import ExcelJS from "exceljs";
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
    downloadReport: async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Monthly Report");

      const headers = [
        "S.No",
        "Project Code",
        "Project Name",
        ...allMonths.map((m) => m.label),
      ];

      // Add header row
      const headerRow = sheet.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D3D3D3" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Add data rows
      monthlyData.forEach((project, index) => {
        const monthMap = {};
        project.task_consumed_hours_by_month?.forEach((monthObj) => {
          monthMap[monthObj.month] = monthObj.hours;
        });

        const row = [
          index + 1,
          project.project_code,
          project.project_title,
          ...allMonths.map((m) => parseFloat(monthMap[m.key] || 0)),
        ];

        sheet.addRow(row);
      });

      // Auto-fit column widths
      sheet.columns.forEach((column) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, val.length);
        });
        column.width = maxLength + 2;
      });

      // Generate Excel file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const currentDate = new Date().toISOString().split("T")[0];

      saveAs(blob, `MonthlyUtilizationReport_${currentDate}.xlsx`);
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
