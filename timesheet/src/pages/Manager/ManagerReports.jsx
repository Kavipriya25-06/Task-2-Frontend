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

const ManagerReport = () => {
  // const [visibleEmployees, setVisibleEmployees] = useState(10);
  // const [isLoadingMoreEmployees, setIsLoadingMoreEmployees] = useState(false);
  // const [hasMoreEmployees, setHasMoreEmployees] = useState(true);
  //new onee
  const [selectedReport, setSelectedReport] = useState(
    "Project Summary Report"
  );
  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);
  };
  const [selectedYear, setSelectedYear] = useState(2024);

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
            <option value="Timesheet Client Report">
              TimeSheet Client Report
            </option>
            <option value="Department Utilization">
              Department Utilization
            </option>
          </select>
        </div>
        {selectedReport === "Department Utilization" && (
          <div className="report-form-group">
            <select name="designationYear" id="designationYear">
              <option value="">Structural-Detailing</option>
              <option value="">Strucutural Design</option>
              <option value="">Piping</option>
              <option value="">Electrical & Instrumentation</option>
            </select>
          </div>
        )}
        {(selectedReport === "Weekly Utilization" ||
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
        {selectedReport === "Project Summary Report" && (
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
              <tr>
                <td>99000</td>
                <td>Idle Hours</td>
                <td>103373.10</td>
                <td>103373.10</td>
                <td>98</td>
              </tr>
              <tr>
                <td>99000</td>
                <td>Idle Hours</td>
                <td>103373.10</td>
                <td>103373.10</td>
                <td>98</td>
              </tr>
            </tbody>
          </table>
        )}

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

        {selectedReport === "Weekly Utilization" && (
          <>
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Project Name</th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">1</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">2</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">3</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">4</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">5</div>
                  </th>
                  <th className="year-header">
                    <div className="year">---</div>
                    <hr className="divider" />
                    <div className="quarter">---</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">52</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>99000</td>
                  <td>Idle Hours</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                </tr>
                <tr>
                  <td>99000</td>
                  <td>Idle Hours</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {selectedReport === "Monthly Utilization" && (
          <>
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Project Name</th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">Jan</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">Feb</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">Mar</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">Apr</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">May</div>
                  </th>
                  <th className="year-header">
                    <div className="year">---</div>
                    <hr className="divider" />
                    <div className="quarter">---</div>
                  </th>
                  <th className="year-header">
                    <div className="year">2024</div>
                    <hr className="divider" />
                    <div className="quarter">Dec</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>99000</td>
                  <td>Idle Hours</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                </tr>
                <tr>
                  <td>99000</td>
                  <td>Idle Hours</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {selectedReport === "Yearly Utilization" && (
          <>
            <table className="employee-table">
              <thead>
                <tr>
                  <th rowSpan="2">Project Code</th>
                  <th rowSpan="2">Project Name</th>
                  <th colSpan="4" style={{ textAlign: "center" }}>
                    Consumed Hours Year Wise
                  </th>
                  <th colSpan="4" style={{ textAlign: "center" }}>
                    Consumed Hours %
                  </th>
                  <th colSpan="4" style={{ textAlign: "center" }}>
                    Allocated Hours
                  </th>
                </tr>
                <tr>
                  <th>2020</th>
                  <th>2021</th>
                  <th>2022</th>
                  <th>Total</th>
                  <th>2020</th>
                  <th>2021</th>
                  <th>2022</th>
                  <th>Total</th>
                  <th>2020</th>
                  <th>2021</th>
                  <th>2022</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>99000</td>
                  <td>Idle Hours</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>65%</td>
                  <td>91%</td>
                  <td>72%</td>
                  <td>80%</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                </tr>
                <tr>
                  <td>99000</td>
                  <td>Idle Hours</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>65%</td>
                  <td>91%</td>
                  <td>72%</td>
                  <td>80%</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {selectedReport === "Timesheet Client Report" && (
          <>
            <div className="report-form">
              <div className="report-form-group">
                <label htmlFor="employee">
                  <strong>Employee</strong>
                </label>
                <select name="employee" id="employee">
                  <option value="">Select Employee</option>
                  <option value="emp1">John Doe</option>
                  <option value="emp2">Jane Smith</option>
                  <option value="emp3">Michael Scott</option>
                </select>
              </div>

              <div className="report-form-group">
                <label htmlFor="month">
                  <strong>Month</strong>
                </label>
                <select name="month" id="month">
                  <option value="">Select Month</option>
                  <option value="jan">January</option>
                  <option value="feb">February</option>
                  <option value="mar">March</option>
                </select>
              </div>

              <div className="report-form-group">
                <label htmlFor="year">
                  <strong>Year</strong>
                </label>
                <select name="year" id="year">
                  <option value="">Select Year</option>
                  <option value="2022">2022</option>
                  <option value="2023">2023</option>
                  <option value="2024">2024</option>
                </select>
              </div>

              <div className="report-form-group">
                <h5>Designation:</h5>
              </div>
              <div className="report-form-group">
                <label htmlFor="week">
                  <strong>Week</strong>
                </label>
                <select name="week" id="week">
                  <option value="">Select Week</option>
                  <option value="w1">Week 1</option>
                  <option value="w2">Week 2</option>
                  <option value="w3">Week 3</option>
                </select>
              </div>

              <div className="report-form-group">
                <select name="designationYear" id="designationYear">
                  <option value="">Structural-Detailing</option>
                  <option value="">Strucutural Design</option>
                  <option value="">Piping</option>
                  <option value="">Electrical&Instrumentation</option>
                </select>
              </div>
            </div>

            <table className="employee-table">
              <thead>
                <tr>
                  <th>Discipline Code</th>
                  <th>Project Code</th>
                  <th>Sub-Division</th>
                  <th>Area of Work</th>
                  <th>Variation</th>
                  <th>Work Day</th>
                  <th className="year-header">
                    <div className="year">19 May 2025</div>
                    <hr className="divider" />
                    <div className="quarter">Mon</div>
                  </th>
                  <th className="year-header">
                    <div className="year">20 May 2025</div>
                    <hr className="divider" />
                    <div className="quarter">Tue</div>
                  </th>
                  <th className="year-header">
                    <div className="year">21 May 2025</div>
                    <hr className="divider" />
                    <div className="quarter">Wed</div>
                  </th>{" "}
                  <th className="year-header">
                    <div className="year">22 May 2025</div>
                    <hr className="divider" />
                    <div className="quarter">Thurs</div>
                  </th>{" "}
                  <th className="year-header">
                    <div className="year">23 May 2025</div>
                    <hr className="divider" />
                    <div className="quarter">Fri</div>
                  </th>{" "}
                  <th className="year-header">
                    <div className="year">24 May 2025</div>
                    <hr className="divider" />
                    <div className="quarter">Sat</div>
                  </th>{" "}
                  <th className="year-header">
                    <div className="year">25 May 2025</div>
                    <hr className="divider" />
                    <div className="quarter">Sun</div>
                  </th>
                  <th>Total Hours</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>99000</td>
                  <td>Idle Hours</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>65%</td>
                  <td>91%</td>
                  <td>72%</td>
                  <td>80%</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                </tr>
                <tr>
                  <td>99000</td>
                  <td>Idle Hours</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>65%</td>
                  <td>91%</td>
                  <td>72%</td>
                  <td>80%</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                  <td>103373.10</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {selectedReport === "Department Utilization" && (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Week</th>
                <th>No.of Employees</th>
                <th>No.of Working Days</th>
                <th>Available Hours</th>
                <th>Project Hours</th>
                <th>Utilization Ratio</th>
                <th>Standardisation</th>
                <th>Idle Hours</th>
                <th>Training</th>
                <th>Leave/Permission</th>
                <th>Holiday</th>
                <th>IT/ Power Failure</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2025</td>
                <td>1</td>
                <td>6</td>
                <td>6</td>
                <td>288</td>
                <td>68</td>
                <td>30.4</td>
                <td>20</td>
                <td>48</td>
                <td>80</td>
                <td>32</td>
                <td>32</td>
                <td>0</td>
              </tr>
              <tr>
                <td>2025</td>
                <td>1</td>
                <td>6</td>
                <td>6</td>
                <td>288</td>
                <td>68</td>
                <td>30.4</td>
                <td>20</td>
                <td>48</td>
                <td>80</td>
                <td>32</td>
                <td>32</td>
                <td>0</td>
              </tr>
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

export default ManagerReport;
