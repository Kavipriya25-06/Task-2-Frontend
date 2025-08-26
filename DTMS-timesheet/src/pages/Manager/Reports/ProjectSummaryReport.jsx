// src\pages\Manager\Reports\ProjectSummaryReport.jsx

import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import config from "../../../config";
import {
  ToastContainerComponent,
  showInfoToast,
} from "../../../constants/Toastify";

const ProjectSummaryReport = forwardRef(({ year }, ref) => {
  const [projectData, setProjectData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch(`${config.apiBaseURL}/projects/`)
      .then((res) => res.json())
      .then((data) => {
        setProjectData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching project data:", err);
        setLoading(false);
      });
  }, []);

  useImperativeHandle(ref, () => ({
    downloadReport: async () => {
      if (projectData.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Project Summary");

      // Add header with S.No.
      const headers = [
        "S.No",
        "Project Code",
        "Project Name",
        "Allocated Hours",
        "Consumed Hours",
        "Planned start date",
        "Planned end date",
        "Elapsed days",
        "Utilization Ratio",
      ];
      sheet.addRow(headers);

      // Style header row
      const headerRow = sheet.getRow(1);
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
      projectData.forEach((project, index) => {
        const allocated = parseFloat(project.total_hours || 0);
        const consumed = parseFloat(project.consumed_hours || 0);
        const ratio = allocated > 0 ? (consumed / allocated) * 100 : 0;
        const startDate = project.start_date
          ? new Date(project.start_date)
          : null;
        const dueDate = project.due_date ? new Date(project.due_date) : null;
        const completedDate = project.completed_date
          ? new Date(project.completed_date)
          : null;

        let elapsedDays = "";
        if (completedDate && dueDate) {
          const dayDifference = completedDate - dueDate;
          elapsedDays = dayDifference / (1000 * 60 * 60 * 24);
        }

        const row = sheet.addRow([
          index + 1,
          project.project_code,
          project.project_title,
          allocated,
          consumed,
          startDate,
          dueDate,
          elapsedDays,
          ratio / 100, // Store as fraction for % formatting
        ]);

        // Format ratio column as percentage
        row.getCell(9).numFmt = "0.00%";
      });

      // Auto-width for all columns
      sheet.columns.forEach((col) => {
        let maxLength = 0;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, val.length);
        });
        col.width = maxLength + 2;
      });

      // Generate Excel and save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const currentDate = new Date().toISOString().split("T")[0];
      saveAs(blob, `ProjectSummaryReport_${currentDate}.xlsx`);
    },
  }));

  return (
    <div className="employee-table-wrapper">
      <div className="table-wrapper" style={{ maxHeight: "400px" }}>
        {loading ? (
          <div className="loading-message">Loading data...</div>
        ) : projectData.length === 0 ? (
          <div className="no-data-message">No utilization data available.</div>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Project Code</th>
                <th>Project Name</th>
                <th>Allocated Hours</th>
                <th>Consumed</th>
                <th>Planned start date</th>
                <th>Planned end date</th>
                <th>Elapsed days</th>
                <th>Utilization Ratio</th>
              </tr>
            </thead>
            <tbody>
              {projectData.map((project) => {
                const allocated = parseFloat(project.total_hours || 0);
                const consumed = parseFloat(project.consumed_hours || 0);
                const ratio =
                  allocated > 0
                    ? ((consumed / allocated) * 100).toFixed(2) + "%"
                    : "0%";
                const startDate = project.start_date
                  ? new Date(project.start_date)
                  : null;
                const dueDate = project.due_date
                  ? new Date(project.due_date)
                  : null;
                const completedDate = project.completed_date
                  ? new Date(project.completed_date)
                  : null;

                let elapsedDays = "0";
                if (completedDate && dueDate) {
                  const dayDifference = completedDate - dueDate;
                  elapsedDays = dayDifference / (1000 * 60 * 60 * 24);
                }

                const formatDate = (dateStr) =>
                  dateStr ? new Date(dateStr).toLocaleDateString("en-GB") : "";

                return (
                  <tr key={project.project_id}>
                    <td>{project.project_code}</td>
                    <td title={project.project_title}>
                      {project.project_title}
                    </td>
                    <td>{allocated.toFixed(2)}</td>
                    <td>{consumed.toFixed(2)}</td>
                    <td>{formatDate(startDate)}</td>
                    <td>{formatDate(dueDate)}</td>
                    <td>{elapsedDays}</td>
                    <td>{ratio}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <ToastContainerComponent />
    </div>
  );
});

export default ProjectSummaryReport;
