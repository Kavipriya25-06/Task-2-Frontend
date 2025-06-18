import React, { useEffect, useState } from "react";
import config from "../../../config";
import { ToastContainerComponent } from "../../../constants/Toastify";

const YearlyUtilizationReport = () => {
  const [selectedReport] = useState("Yearly Utilization");
  const [projectData, setProjectData] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedReport === "Yearly Utilization") {
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
    }
  }, [selectedReport]);

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
};

export default YearlyUtilizationReport;
