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

const UtilizationReport = () => {
  //new onee
  const [selectedReport, setSelectedReport] = useState("Utilization Report");
  const [reportData, setReportData] = useState([]);
  const [taskTitles, setTaskTitles] = useState([]);

  useEffect(() => {
    if (selectedReport === "Utilization Report") {
      fetch(`${config.apiBaseURL}/project-hours/`)
        .then((res) => res.json())
        .then((data) => {
          const formatted = [];
          const titleSet = new Set();

          data.forEach((project) => {
            project.assigns.forEach((assign) => {
              assign.buildings.forEach((buildingAssign) => {
                const taskHoursMap = {};
                let totalHours = 0;

                buildingAssign.tasks.forEach((taskAssign) => {
                  const title = taskAssign.task.task_title;
                  const hours = parseFloat(taskAssign.task_consumed_hours);
                  taskHoursMap[title] = (taskHoursMap[title] || 0) + hours;
                  totalHours += hours;
                  titleSet.add(title);
                });

                formatted.push({
                  project_code: project.project_code,
                  project_name: project.project_title,
                  sub_division: buildingAssign.building?.building_code, // ← building code as sub_division
                  tasks: taskHoursMap,
                  total: totalHours.toFixed(2),
                });
              });
            });
          });

          setTaskTitles(Array.from(titleSet));
          setReportData(formatted);
        })
        .catch((error) =>
          console.error("Error fetching Utilization Report:", error)
        );
    }
  }, [selectedReport]);

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
        {selectedReport === "Utilization Report" && (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Project Code</th>
                <th>Project Name</th>
                <th>Sub-Division</th>
                {taskTitles.map((title, idx) => (
                  <th key={idx}>{title}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, index) => (
                <tr key={index}>
                  <td>{item.project_code}</td>
                  <td>{item.project_name}</td>
                  <td>{item.sub_division}</td>
                  {taskTitles.map((title, i) => (
                    <td key={i}>{item.tasks[title] || 0}</td>
                  ))}
                  <td>{item.total}</td>
                </tr>
              ))}
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

export default UtilizationReport;
