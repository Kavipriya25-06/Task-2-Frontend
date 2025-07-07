// src/pages/HR/EmployeeList.jsx

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

import LeaveTakenReport from "./Reports/LeaveTakenReport";
import LeaveBalanceReport from "./Reports/LeaveBalanceReport";
import LOPReport from "./Reports/LOPReport";

const HRReports = () => {
  //new onee
  const [year, setYear] = useState(new Date().getFullYear());

  const [selectedReport, setSelectedReport] = useState("Leave Taken Report");
  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
  };

  // const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const reportRef = useRef();
  const renderReportComponent = () => {
    switch (selectedReport) {
      case "Leave Taken Report":
        return <LeaveTakenReport ref={reportRef} year={year} />;
      case "Leave Balance Report":
        return <LeaveBalanceReport ref={reportRef} year={year} />;
      case "LOP Report":
        return <LOPReport ref={reportRef} year={year} />;
    }
  };

  return (
    <div className="employee-table-wrapper">
      <div className="user-header">
        <div className="dropdown-container">
          <select className="employee-select" onChange={handleReportChange}>
            <option value="Leave Taken Report">Leave Taken Report</option>
            <option value="Leave Balance Report">Leave Balance Report</option>
            <option value="LOP Report">LOP Report</option>
          </select>
        </div>
        <div className="report-navigation">
          <div
            className="report-form-group"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            {/* <label>
              <strong>Year:</strong>
            </label> */}
            <button
              onClick={() => setYear((prev) => prev - 1)}
              disabled={year <= 2020}
            >
              &lt;
            </button>
            <span
              style={{
                minWidth: "60px",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "19px",
              }}
            >
              {year}
            </span>
            <button
              onClick={() => setYear((prev) => prev + 1)}
              disabled={year >= 2030}
            >
              &gt;
            </button>
          </div>
        </div>

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
        {renderReportComponent()}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default HRReports;
