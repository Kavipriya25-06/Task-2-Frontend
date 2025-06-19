import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import config from "../../../config";
import { ToastContainerComponent } from "../../../constants/Toastify";

const YearlyUtilizationReport = forwardRef((props, ref) => {
  const [projectData, setProjectData] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/yearly-project-hours/`)
      .then((res) => res.json())
      .then((data) => {
        setProjectData(data);

        // Extract unique years from the dataset
        const uniqueYears = new Set();
        data.forEach((project) => {
          project.task_consumed_hours_by_year.forEach((entry) => {
            uniqueYears.add(entry.year);
          });
        });

        const sortedYears = Array.from(uniqueYears).sort();
        setYears(sortedYears);

        setLoading(false);
      })
      .catch((err) => {
        console.error("Yearly Utilization error:", err);
        setLoading(false);
      });
  }, []);

  useImperativeHandle(ref, () => ({
    downloadReport: () => {
      const headers = [
        "Project Code",
        "Project Name",
        "Allocated Hours",
        ...years.map((y) => `${y} (Consumed Hours Year Wise)`),
        "Total Consumed",
        ...years.map((y) => `${y} (Consumed Hours%)`),
        "Total (%)",
        ...years.map((y) => `${y} (Allocated Hours)`),
        "Total Allocated",
      ];

      const rows = projectData.map((project) => {
        const consumedMap = {};
        project.task_consumed_hours_by_year.forEach((entry) => {
          consumedMap[entry.year] = entry.hours;
        });

        const allocated = parseFloat(project.total_hours);
        const totalConsumed = years.reduce(
          (acc, y) => acc + (consumedMap[y] || 0),
          0
        );

        const row = [
          project.project_code,
          project.project_title,
          allocated.toFixed(2),

          // Consumed Hours by Year
          ...years.map((y) => (consumedMap[y] || 0).toFixed(2)),
          totalConsumed.toFixed(2),

          // Consumed Percentages
          ...years.map((y) => {
            const consumed = consumedMap[y] || 0;
            return allocated
              ? `${((consumed / allocated) * 100).toFixed(0)}%`
              : "0%";
          }),
          allocated
            ? `${((totalConsumed / allocated) * 100).toFixed(0)}%`
            : "0%",

          // Allocated Hours by Year (duplicated consumed hours here, adjust if different)
          ...years.map((y) => (consumedMap[y] || 0).toFixed(2)),
          totalConsumed.toFixed(2),
        ];

        return row;
      });

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Yearly Report");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      saveAs(blob, `YearlyUtilizationReport.xlsx`);
    },
  }));

  return (
    <div className="employee-table-wrapper">
      <div
        className="table-wrapper"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        {loading ? (
          <div className="loading-message">Loading data...</div>
        ) : projectData.length === 0 ? (
          <div className="no-data-message">No utilization data available.</div>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th rowSpan="2">Project Code</th>
                <th rowSpan="2">Project Name</th>
                <th rowSpan="2">Allocated Hours</th>
                <th colSpan={years.length + 1} style={{ textAlign: "center" }}>
                  Consumed Hours Year Wise
                </th>
                <th colSpan={years.length + 1} style={{ textAlign: "center" }}>
                  Consumed Hours %
                </th>
                <th colSpan={years.length + 1} style={{ textAlign: "center" }}>
                  Allocated Hours
                </th>
              </tr>
              <tr>
                {years.map((y) => (
                  <th key={`ch-${y}`}>{y}</th>
                ))}
                <th>Total</th>
                {years.map((y) => (
                  <th key={`perc-${y}`}>{y}</th>
                ))}
                <th>Total</th>
                {years.map((y) => (
                  <th key={`ah-${y}`}>{y}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {projectData.map((project, index) => {
                const consumedMap = {};
                project.task_consumed_hours_by_year.forEach((entry) => {
                  consumedMap[entry.year] = entry.hours;
                });

                const allocated = parseFloat(project.total_hours);
                const totalConsumed = years.reduce(
                  (acc, y) => acc + (consumedMap[y] || 0),
                  0
                );

                return (
                  <tr key={index}>
                    <td>{project.project_code}</td>
                    <td>{project.project_title}</td>
                    <td>{allocated.toFixed(2)}</td>

                    {/* Consumed Hours */}
                    {years.map((y) => (
                      <td key={`ch-${y}`}>
                        {(consumedMap[y] || 0).toFixed(2)}
                      </td>
                    ))}
                    <td>{totalConsumed.toFixed(2)}</td>

                    {/* Consumed % */}
                    {years.map((y) => {
                      const consumed = consumedMap[y] || 0;
                      return (
                        <td key={`perc-${y}`}>
                          {allocated
                            ? `${((consumed / allocated) * 100).toFixed(0)}%`
                            : "0%"}
                        </td>
                      );
                    })}
                    <td>
                      {allocated
                        ? `${((totalConsumed / allocated) * 100).toFixed(0)}%`
                        : "0%"}
                    </td>

                    {/* Allocated Hours */}
                    {years.map((y) => (
                      <td key={`ch-${y}`}>
                        {(consumedMap[y] || 0).toFixed(2)}
                      </td>
                    ))}
                    <td>{totalConsumed.toFixed(2)}</td>

                    {/* {years.map((y) => (
                      <td key={`ah-${y}`}>
                        {(allocated / years.length).toFixed(2)}
                      </td>
                    ))}
                    <td>{allocated.toFixed(2)}</td> */}
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

export default YearlyUtilizationReport;
