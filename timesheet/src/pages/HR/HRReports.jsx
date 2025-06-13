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

const EmployeeList = () => {
  const [visibleEmployees, setVisibleEmployees] = useState(10);
  const [isLoadingMoreEmployees, setIsLoadingMoreEmployees] = useState(false);
  const [hasMoreEmployees, setHasMoreEmployees] = useState(true);
  //new onee
  const [selectedReport, setSelectedReport] = useState("Leave Taken Report");
  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
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

        <button className="add-user-btn">Download Report</button>
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
        {selectedReport === "Leave Taken Report" && (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>No.of.Days</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EC0001</td>
                <td>Vijay</td>
                <td>22-06-2022</td>
                <td>22-06-2025</td>
                <td>320</td>
              </tr>
              <tr>
                <td>EC0001</td>
                <td>Vijay</td>
                <td>22-06-2022</td>
                <td>22-06-2025</td>
                <td>320</td>
              </tr>
            </tbody>
          </table>
        )}
        {selectedReport === "Leave Balance Report" && (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Name</th>
                <th>DOJ</th>
                <th>Present Status</th>
                <th>CL</th>
                <th>SL</th>
                <th>EL</th>
                <th>Comp-off</th>
                <th>LOP</th>
                <th>Total Leaves Available</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EC0001</td>
                <td>Vijay</td>
                <td>22-06-2022</td>
                <td>Active</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>2</td>
                <td>5</td>
              </tr>
              <tr>
                <td>EC0001</td>
                <td>Vijay</td>
                <td>22-06-2022</td>
                <td>Active</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>2</td>
                <td>5</td>
              </tr>
            </tbody>
          </table>
        )}

        {selectedReport === "LOP Report" && (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Name</th>
                <th>DOJ</th>
                <th>Present Status</th>
                <th>Resigned</th>
                <th>Jan 2025</th>
                <th>Feb 2025</th>
                <th>Mar 2025</th>
                <th>Apr 2025</th>
                <th>May 2025</th>
                <th>Jun 2025</th>
                <th>Jul 2025</th>
                <th>Aug 2025</th>
                <th>Sep 2025</th>
                <th>Oct 2025</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EC0001</td>
                <td>Vijay</td>
                <td>22-06-2025</td>
                <td>Active</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
              </tr>
              <tr>
                <td>EC0001</td>
                <td>Vijay</td>
                <td>22-06-2025</td>
                <td>Active</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
              </tr>
              <tr>
                <td>EC0002</td>
                <td>Kumar</td>
                <td>12-2-2025</td>
                <td>Active</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
              </tr>
              <tr>
                <td>EC0001</td>
                <td>Kasi</td>
                <td>02-12-2025</td>
                <td>Active</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
              </tr>
            </tbody>
          </table>
        )}
        {isLoadingMoreEmployees && (
          <div className="loading-message">Loading...</div>
        )}
        {!hasMoreEmployees && <div className="no-message">No more data</div>}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default EmployeeList;
