import React, {
  useEffect,
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import config from "../../../config";
import { ToastContainerComponent } from "../../../constants/Toastify";

const TimeSheetClientReport = forwardRef((props, ref) => {
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [weeklyTimesheetData, setWeeklyTimesheetData] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);
  const [weekStart, setWeekStart] = useState(null);
  const [weekDays, setWeekDays] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSelectedDropdown, setShowSelectedDropdown] = useState(false);
  const [showSelectDropdown, setShowSelectDropdown] = useState(false);

  const handleWeekChange = (e) => {
    const startDateStr = e.target.value;
    const startDate = new Date(startDateStr);
    setSelectedWeekStart(startDate);

    // Format to YYYY-MM-DD
    const formatted = startDate.toISOString().slice(0, 10);
    setWeekStart(formatted);

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i); // Monday to Sunday
      weekDates.push(day);
    }

    const formattedFromDate = weekDates[0].toISOString().split("T")[0];
    const formattedToDate = weekDates[6].toISOString().split("T")[0];
    const weekNo = getISOWeekNumber(startDate);

    console.log("Start date and week number", weekNo, startDate, startDateStr);

    setWeekDays(weekDates);
    // setFromDate(formattedFromDate);
    // setToDate(formattedToDate);
    // setWeekNumber(weekNo);
  };

  // Fetch employee list on mount
  useEffect(() => {
    fetch(`${config.apiBaseURL}/employees/`)
      .then((res) => res.json())
      .then((data) => {
        // console.log("Fetched employees:", data); //  ADD THIS
        setEmployees(data);
      })
      .catch(console.error);
  }, []);

  // Update week list whenever month or year changes
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      const wDates = getWeekStartDatesForMonth(+selectedYear, +selectedMonth);
      setWeeks(wDates);
      setWeekDates(wDates);
    }
  }, [selectedYear, selectedMonth]);

  // Fetch timesheet data based on selections
  useEffect(() => {
    if (
      selectedYear &&
      selectedMonth &&
      weekStart &&
      selectedEmployees.length > 0
    ) {
      const today = `${selectedYear}-${String(selectedMonth).padStart(
        2,
        "0"
      )}-01`;

      // console.log("Today in code", today);

      Promise.all(
        selectedEmployees.map((empId) =>
          fetch(
            `${config.apiBaseURL}/employee-report-week/${empId}/?today=${weekStart}`
          ).then((res) => res.json())
        )
      )
        .then((dataArrays) => {
          // Merge all employee timesheet data into one array
          const allData = dataArrays.flat();
          setWeeklyTimesheetData(allData);
        })
        .catch(console.error);
    }
  }, [selectedYear, selectedMonth, selectedEmployees, weekStart]);

  const getWeekStartDatesForMonth = (year, month) => {
    const dates = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    let current = new Date(firstDay);
    // Move to previous Monday
    current.setDate(current.getDate() - ((current.getDay() + 5) % 7));

    while (current <= lastDay) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    return dates;
  };

  const getISOWeekNumber = (date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  };

  const currentYear = new Date().getFullYear();
  const yearRange = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i);

  const groupedData = weeklyTimesheetData.reduce((acc, item) => {
    const taskAssignId = item.task_assign.task_assign_id;

    const workedDate = item.date; // "YYYY-MM-DD"
    const isInSelectedWeek = weekDays.some(
      (day) => day.toISOString().split("T")[0] === workedDate
    );

    if (!isInSelectedWeek) return acc; // Skip dates outside selected week

    if (!acc[taskAssignId]) {
      acc[taskAssignId] = {
        data: [],
        workedDates: new Set(),
        taskAssign: item.task_assign,
      };
    }

    acc[taskAssignId].data.push(item);
    acc[taskAssignId].workedDates.add(item.date);

    return acc;
  }, {});

  const dropdownRef = useRef(null);
  const selectedDropdownRef = useRef(null);
  const selectDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        selectedDropdownRef.current &&
        !selectedDropdownRef.current.contains(event.target)
      ) {
        setShowSelectedDropdown(false);
      }
      if (
        selectDropdownRef.current &&
        !selectDropdownRef.current.contains(event.target)
      ) {
        setShowSelectDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const groupedDataByEmployee = selectedEmployees.reduce((acc, empId) => {
    const employeeData = weeklyTimesheetData.filter(
      (item) => item.employee.employee_id === empId
    );

    const grouped = employeeData.reduce((groupAcc, item) => {
      const taskAssignId = item.task_assign.task_assign_id;

      const workedDate = item.date;
      const isInSelectedWeek = weekDays.some(
        (day) => day.toISOString().split("T")[0] === workedDate
      );

      if (!isInSelectedWeek) return groupAcc;

      if (!groupAcc[taskAssignId]) {
        groupAcc[taskAssignId] = {
          data: [],
          workedDates: new Set(),
          taskAssign: item.task_assign,
        };
      }

      groupAcc[taskAssignId].data.push(item);
      groupAcc[taskAssignId].workedDates.add(item.date);

      return groupAcc;
    }, {});

    acc[empId] = grouped;
    return acc;
  }, {});

  useImperativeHandle(ref, () => ({
    downloadReport: handleExportToExcel,
  }));

  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const monthName = new Date(0, selectedMonth - 1).toLocaleString("default", {
      month: "long",
    });
    const monthYearDisplay = `${monthName} ${selectedYear}`;

    const weekNumber = selectedWeekStart
      ? getISOWeekNumber(selectedWeekStart)
      : "";
    const fromDate = selectedWeekStart
      ? selectedWeekStart.toLocaleDateString("en-GB")
      : "";
    const toDate = selectedWeekStart
      ? new Date(
          selectedWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-GB")
      : "";

    for (const empId of selectedEmployees) {
      const emp = employees.find((e) => e.employee_id === empId);
      const groupedData = groupedDataByEmployee[empId];
      if (!emp || !groupedData) continue;

      const sheet = workbook.addWorksheet(emp.employee_name);
      const weekHeaders = weekDays.map(
        (day) =>
          `${day.toLocaleDateString("en-GB")} (${day.toLocaleDateString(
            "en-GB",
            {
              weekday: "short",
            }
          )})`
      );

      const headers = [
        "S.No",
        "Discipline Code",
        "Project Number",
        "Project Name",
        "Subdivision",
        "Area of Work",
        "Variation",
        "Work Day",
        ...weekHeaders,
        "Total Hours",
      ];

      // ➤ TITLE
      sheet.mergeCells("E1", "K1");
      const titleCell = sheet.getCell("E1");
      titleCell.value = "ARRIS ENGINEERING SERVICES PVT. LTD. - TIME SHEET";
      titleCell.font = { size: 18, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };

      // ➤ EMPLOYEE INFO ROWS
      sheet.addRow([]);

      const nameRow = sheet.addRow([
        "NAME :",
        emp.employee_name,
        "",
        "EMPLOYEE ID :",
        emp.employee_id,
        "",
        "MONTH & YEAR :",
        monthYearDisplay,
      ]);
      nameRow.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
      });

      const calendarWeekText = `${weekNumber} FROM ${fromDate} TO ${toDate}`;

      const designationRow = sheet.addRow([
        "DESIGNATION :",
        emp.designation || "N/A",
        "",
        "DISCIPLINE :",
        emp.department || "N/A",
        "",
        "CALENDAR WEEK :",
        calendarWeekText,
      ]);
      designationRow.eachCell((cell) => {
        cell.font = { bold: true, size: 12 };
      });

      sheet.addRow([]);

      // ➤ TABLE HEADER
      const headerRow = sheet.addRow(headers);

      // Set row height for visual padding (e.g., 25 for taller headers)
      headerRow.height = 55;

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 12 }; // Larger font for better spacing
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D3D3D3" },
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // ➤ DATA ROWS
      let counter = 1;

      for (const group of Object.values(groupedData)) {
        const rowData = [
          counter++,
          group.taskAssign?.task?.task_code || "N/A",
          group.taskAssign?.building_assign?.project_assign?.project
            ?.project_code || "N/A",
          group.taskAssign?.building_assign?.building?.building_title || "N/A",
          group.taskAssign?.building_assign?.building?.subdivision || "N/A",
          group.taskAssign?.task?.task_title || "N/A",
          "",
          group.workedDates.size,
          ...weekDays.map((day) => {
            const d = day.toISOString().split("T")[0];
            const e = group.data.find((x) => x.date === d);
            return e ? parseFloat(e.task_hours) : 0;
          }),
          group.data.reduce((sum, e) => sum + parseFloat(e.task_hours || 0), 0),
        ];

        const row = sheet.addRow(rowData);
        row.height = 35;

        const weekColumnStart = 9;
        const weekColumnEnd = 8 + weekDays.length;
        const totalHoursColumn = weekColumnEnd + 1;

        row.eachCell((cell, colNumber) => {
          const centerColumns = [
            1,
            2,
            3,
            4,
            5,
            6, // S.No to Area of Work
            8, // Work Day
            ...Array.from(
              { length: weekDays.length },
              (_, i) => weekColumnStart + i
            ), // Weekday columns
            totalHoursColumn, // Total Hours
          ];

          cell.font = { size: 11 };
          cell.alignment = {
            vertical: "middle",
            horizontal: centerColumns.includes(colNumber) ? "center" : "left",
          };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }

      // ➤ AUTO WIDTH
      // ➤ AUTO WIDTH with max limit for specific columns
      sheet.columns.forEach((col, index) => {
        let maxLength = 12;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, val.length + 4);
        });

        // Set maximum column width to 25 for all columns, and 15 for weekly columns and total
        if (index >= 8) {
          // Weekday columns and Total Hours
          col.width = Math.min(maxLength, 20);
        } else {
          // Other columns like S.No, Project Name, etc.
          col.width = Math.min(maxLength, 25);
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const currentDate = new Date().toISOString().split("T")[0];
    saveAs(new Blob([buffer]), `TimeSheetReport_${currentDate}.xlsx`);
  };

  return (
    <div className="employee-table-wrapper">
      <div className="report-form">
        {/* EMPLOYEES DROPDOWN */}
        <div className="report-form-group" ref={dropdownRef}>
          <label>
            <strong>Employees</strong>
          </label>
          <div className="multi-select">
            <div
              className="multi-select-box"
              onClick={() => {
                setShowDropdown((prev) => !prev);
                setShowSelectedDropdown(false);
              }}
            >
              <div className="multi-select-content">
                <span className="selected-names">Select Employee </span>
                <span className="dropdown-caret">▾</span>
              </div>
            </div>

            {showDropdown && (
              <div className="multi-select-dropdown">
                {employees.map((emp) => (
                  <label key={emp.employee_id} className="multi-select-item">
                    <input
                      type="checkbox"
                      className="emp-checkbox"
                      checked={selectedEmployees.includes(emp.employee_id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setSelectedEmployees((prev) =>
                          isChecked
                            ? [...prev, emp.employee_id]
                            : prev.filter((id) => id !== emp.employee_id)
                        );
                      }}
                    />{" "}
                    {emp.employee_name}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="report-form-group">
          <label>
            <strong>Month</strong>
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
        </div>

        <div className="report-form-group">
          <label>
            <strong>Year</strong>
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Select Year</option>
            {yearRange.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* SELECTED EMPLOYEES (DESIGNATION) DROPDOWN */}
        <div className="report-form-group" ref={selectedDropdownRef}>
          <label>
            <strong>Designation</strong>
          </label>
          <div className="multi-select">
            <div
              className="multi-select-box"
              onClick={() => {
                setShowSelectedDropdown((prev) => !prev);
                setShowDropdown(false);
              }}
            >
              <div className="multi-select-content">
                <span className="selected-names">
                  {selectedEmployees.length > 0
                    ? `${selectedEmployees.length} Selected`
                    : "Select Employees"}
                </span>
                <span className="dropdown-caret">▾</span>
              </div>
            </div>

            {showSelectedDropdown && (
              <div className="multi-select-dropdown">
                {selectedEmployees.length > 0 ? (
                  selectedEmployees.map((id) => {
                    const emp = employees.find((e) => e.employee_id === id);
                    return (
                      <label key={id} className="multi-select-item">
                        {/* <input
                          type="checkbox"
                          checked={true}
                          onChange={() =>
                            setSelectedEmployees((prev) =>
                              prev.filter((empId) => empId !== id)
                            )
                          }
                        />{" "} */}
                        {emp?.employee_name}: {emp?.designation || "N/A"}
                      </label>
                    );
                  })
                ) : (
                  <p className="no-emp">No employees selected</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="report-form-group">
          <label>
            <strong>Week</strong>
          </label>
          <select name="week" id="week" onChange={handleWeekChange}>
            <option value="">Select Week</option>
            {weeks.map((date, idx) => {
              const weekNo = getISOWeekNumber(date);
              //   const monday = date.toLocaleDateString("en-GB");
              //   const sunday = new Date(date);
              //   sunday.setDate(sunday.getDate() + 6);
              //   const sundayFormatted = sunday.toLocaleDateString("en-GB");

              return (
                <option key={idx} value={date.toISOString().split("T")[0]}>
                  Week {weekNo}
                </option>
              );
            })}
          </select>
        </div>
        <div className="report-form-group" ref={selectDropdownRef}>
          {/* <label>
            <strong>Department</strong>
          </label> */}
          <div className="multi-select">
            <div
              className="multi-select-box"
              onClick={() => {
                setShowSelectDropdown((prev) => !prev);
                setShowDropdown(false);
                setShowSelectedDropdown(false);
              }}
            >
              <div className="multi-select-content">
                <span className="selected-names">
                  Department
                  {/* {selectedEmployees.length > 0
                    ? `${selectedEmployees.length} Selected`
                    : "Select Employees"} */}
                </span>
                <span className="dropdown-caret">▾</span>
              </div>
            </div>

            {showSelectDropdown && (
              <div className="multi-select-dropdown">
                {selectedEmployees.length > 0 ? (
                  selectedEmployees.map((id) => {
                    const emp = employees.find((e) => e.employee_id === id);
                    return (
                      <label key={id} className="multi-select-item">
                        {/* <input
                          type="checkbox"
                          checked={true}
                          onChange={() =>
                            setSelectedEmployees((prev) =>
                              prev.filter((empId) => empId !== id)
                            )
                          }
                        />{" "} */}
                        {emp?.employee_name}: {emp?.department || "N/A"}
                      </label>
                    );
                  })
                ) : (
                  <p className="no-emp">No employees selected</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedEmployees.map((empId) => {
        const emp = employees.find((e) => e.employee_id === empId);
        const groupedData = groupedDataByEmployee[empId];

        if (!emp || !groupedData || Object.keys(groupedData).length === 0)
          return null;

        return (
          <div key={empId} style={{ marginBottom: "2rem", marginTop: "50px" }}>
            <h4>{emp.employee_name}</h4>
            <div
              className="table-wrapper"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Discipline Code</th>
                    <th>Project Code</th>
                    <th>Sub‑Division</th>
                    <th>Area of Work</th>
                    <th>Variation</th>
                    <th>Work Day</th>
                    {weekDays.map((day, i) => (
                      <th key={i}>
                        {day.toLocaleDateString("en-GB")}
                        <br />
                        {day.toLocaleDateString("en-GB", { weekday: "short" })}
                      </th>
                    ))}
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(groupedData).map((group, i) => (
                    <tr key={i}>
                      <td>
                        {group.taskAssign?.building_assign?.project_assign
                          ?.project?.discipline_code || "N/A"}
                      </td>
                      <td>
                        {group.taskAssign?.building_assign?.project_assign
                          ?.project?.project_code || "N/A"}
                      </td>
                      <td>
                        {group.taskAssign?.building_assign?.building
                          ?.building_title || "N/A"}
                      </td>
                      <td>{group.taskAssign?.task?.task_title || "N/A"}</td>

                      <td>{/* Variation */}</td>
                      <td>{group.workedDates.size}</td>
                      {weekDays.map((day, idx) => {
                        const formattedDay = day.toISOString().split("T")[0];
                        const entry = group.data.find(
                          (e) => e.date === formattedDay
                        );
                        const totalHours = group.data.filter(
                          (e) => e.date === formattedDay
                        );
                        let final = totalHours.reduce(
                          (sum, e) => sum + parseFloat(e.task_hours || 0),
                          0
                        );
                        return (
                          <td key={idx}>{entry ? parseFloat(final) : 0}</td>
                        );
                      })}
                      <td>
                        {group.data.reduce(
                          (sum, e) => sum + parseFloat(e.task_hours || 0),
                          0
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <ToastContainerComponent />
    </div>
  );
});

export default TimeSheetClientReport;
