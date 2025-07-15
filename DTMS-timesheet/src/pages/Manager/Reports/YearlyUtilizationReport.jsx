import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import ExcelJS from "exceljs";
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
    downloadReport: async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Yearly Report");

      const headers = [
        "S.No",
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
      projectData.forEach((project, index) => {
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
          index + 1,
          project.project_code,
          project.project_title,
          parseFloat(allocated.toFixed(2)),

          // Consumed Hours by Year
          ...years.map((y) => parseFloat((consumedMap[y] || 0).toFixed(2))),
          parseFloat(totalConsumed.toFixed(2)),

          // Consumed Percentages
          ...years.map((y) => {
            const consumed = consumedMap[y] || 0;
            return allocated ? parseFloat(consumed / allocated) : 0;
          }),
          allocated ? parseFloat(totalConsumed / allocated) : 0,

          // Allocated Hours by Year (currently repeating consumed values)
          ...years.map((y) => parseFloat((consumedMap[y] || 0).toFixed(2))),
          parseFloat(totalConsumed.toFixed(2)),
        ];

        const addedRow = sheet.addRow(row);
        // Format ratio column as percentage
        addedRow.getCell(7).numFmt = "0.00%";
        addedRow.getCell(8).numFmt = "0.00%";
      });

      // Auto-fit column widths
      sheet.columns.forEach((col) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, val.length);
        });
        col.width = maxLength + 2;
      });

      // Generate and save
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const currentDate = new Date().toISOString().split("T")[0];

      saveAs(blob, `YearlyUtilizationReport_${currentDate}.xlsx`);
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
                            ? `${((consumed / allocated) * 100).toFixed(2)}%`
                            : "0%"}
                        </td>
                      );
                    })}
                    <td>
                      {allocated
                        ? `${((totalConsumed / allocated) * 100).toFixed(2)}%`
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
