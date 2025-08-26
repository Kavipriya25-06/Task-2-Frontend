// src\pages\Manager\ManagerReports.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { FaEdit } from "react-icons/fa";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

import WeeklyUtilization from "./Reports/WeeklyUtilizationReport";
import MonthlyUtilization from "./Reports/MonthlyUtilizationReport";
import UtilizationReport from "./Reports/UtilizationReport";
import ProjectSummaryReport from "./Reports/ProjectSummaryReport";
import TimeSheetClientReport from "./Reports/TimeSheetClientReport";
import YearlyUtilizationReport from "./Reports/YearlyUtilizationReport";
import DepartmentUtilizationReport from "./Reports/DepartmentUtilizationReport";

const ManagerReport = () => {
  const [selectedReport, setSelectedReport] = useState(
    "Project Summary Report"
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
  };
  const [department, setDepartment] = useState("Management");
  console.log("Department", department);

  const reportRef = useRef();

  const renderReportComponent = () => {
    switch (selectedReport) {
      case "Weekly Utilization":
        return <WeeklyUtilization ref={reportRef} year={selectedYear} />;
      case "Monthly Utilization":
        return <MonthlyUtilization ref={reportRef} year={selectedYear} />;
      case "Utilization Report":
        return <UtilizationReport ref={reportRef} />;
      case "Project Summary Report":
        return <ProjectSummaryReport ref={reportRef} year={selectedYear} />;
      case "Timesheet Client Report":
        return <TimeSheetClientReport ref={reportRef} />;
      case "Yearly Utilization":
        return <YearlyUtilizationReport ref={reportRef} />;
      case "Department Utilization":
        return (
          <DepartmentUtilizationReport
            ref={reportRef}
            year={selectedYear}
            department={department}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="employee-table-wrapper">
      <div className="user-header">
        <div className="dropdown-container">
          <select className="employee-select" onChange={handleReportChange}>
            <option value="Project Summary Report">
              Project Summary Report
            </option>
            <option value="Utilization Report">Utilization Report</option>
            <option value="Weekly Utilization">Weekly Utilization</option>
            <option value="Monthly Utilization">Monthly Utilization</option>
            <option value="Yearly Utilization">Yearly Utilization</option>
            {/* <option value="Timesheet Client Report">
              TimeSheet Client Report
            </option> */}
            <option value="Department Utilization">
              Department Utilization
            </option>
          </select>
        </div>
        {selectedReport === "Department Utilization" && (
          <div className="report-form-group">
            <select
              name="designationYear"
              id="designationYear"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="Management">Management</option>
              <option value="Business Development">Business Development</option>
              <option value="Procurement">Procurement</option>
              {/* <option value="Piping">Piping</option> */}
              {/* <option value="Structural">Structural</option> */}
              {/* <option value="EIC">EIC</option> */}
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Technical">Technical</option>
            </select>
          </div>
        )}
        {console.log("Department change", department)}
        {(selectedReport === "Weekly Utilization" ||
          selectedReport === "Department Utilization" ||
          selectedReport === "Monthly Utilization") && (
          <div
            style={{
              textAlign: "center",
              marginBottom: "10px",
              fontSize: "18px",
              marginTop: "10px",
            }}
          >
            <button
              onClick={() => setSelectedYear((prev) => prev - 1)}
              style={{ marginRight: "10px" }}
              className="report-left"
            >
              &lt;
            </button>
            <strong>{selectedYear}</strong>
            <button
              onClick={() => setSelectedYear((prev) => prev + 1)}
              style={{ marginLeft: "10px" }}
              className="report-right"
            >
              &gt;
            </button>
          </div>
        )}

        <button
          className="add-user-btn"
          onClick={() => {
            if (
              reportRef.current &&
              typeof reportRef.current.downloadReport === "function"
            ) {
              reportRef.current.downloadReport();
            } else {
              showWarningToast("Download not supported for this report.");
            }
          }}
        >
          Download Report
        </button>
      </div>
      <div className="table-wrapper" style={{ maxHeight: "400px" }}>
        {renderReportComponent()}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerReport;
