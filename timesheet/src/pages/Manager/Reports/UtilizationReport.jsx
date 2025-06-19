// src/pages/HR/EmployeeList.jsx

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

const UtilizationReport = forwardRef((props, ref) => {
  //new onee
  const [reportData, setReportData] = useState([]);
  const [taskTitles, setTaskTitles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

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
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Utilization Report:", error);
        setLoading(false);
      });
  }, []);

  useImperativeHandle(ref, () => ({
    downloadReport: () => {
      if (reportData.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      const exportData = reportData.map((item) => {
        const row = {
          "Project Code": item.project_code,
          "Project Name": item.project_name,
          "Sub-Division": item.sub_division,
        };

        taskTitles.forEach((title) => {
          row[title] = item.tasks[title] || 0;
        });

        row["Total"] = item.total;
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Utilization Report");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      const currentDate = new Date().toISOString().split("T")[0];
      saveAs(blob, `UtilizationReport_${currentDate}.xlsx`);
    },
  }));

  return (
    <div className="employee-table-wrapper">
      <div className="table-wrapper" style={{ maxHeight: "400px" }}>
        {loading ? (
          <div className="loading-message">Loading data...</div>
        ) : reportData.length === 0 ? (
          <div className="no-data-message">No utilization data available.</div>
        ) : (
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
});

export default UtilizationReport;
