import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as XLSX from "xlsx";
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
    downloadReport: () => {
      if (projectData.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      const worksheetData = projectData.map((project) => {
        const allocated = parseFloat(project.total_hours || 0);
        const consumed = parseFloat(project.consumed_hours || 0);
        const ratio =
          allocated > 0
            ? ((consumed / allocated) * 100).toFixed(0) + "%"
            : "0%";

        return {
          "Project Code": project.project_code,
          "Project Name": project.project_title,
          "Allocated Hours": allocated.toFixed(2),
          "Consumed Hours": consumed.toFixed(2),
          "Utilization Ratio": ratio,
        };
      });

      //convert to worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      //Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Project Summary");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      const currentDate = new Date().toISOString().split("T")[0]; // e.g., "2025-06-19"
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
                <th>Utilization Ratio</th>
              </tr>
            </thead>
            <tbody>
              {projectData.map((project) => {
                const allocated = parseFloat(project.total_hours || 0);
                const consumed = parseFloat(project.consumed_hours || 0);
                const ratio =
                  allocated > 0
                    ? ((consumed / allocated) * 100).toFixed(0) + "%"
                    : "0%";

                return (
                  <tr key={project.project_id}>
                    <td>{project.project_code}</td>
                    <td title={project.project_title}>
                      {project.project_title}
                    </td>
                    <td>{allocated.toFixed(2)}</td>
                    <td>{consumed.toFixed(2)}</td>
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
