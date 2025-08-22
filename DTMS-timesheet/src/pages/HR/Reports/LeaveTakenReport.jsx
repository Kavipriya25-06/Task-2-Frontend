// // src\pages\HR\Reports\LeaveTakenReport.jsx

// import React, {
//   useEffect,
//   useState,
//   useImperativeHandle,
//   forwardRef,
// } from "react";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import config from "../../../config";
// import { ToastContainerComponent } from "../../../constants/Toastify";

// const LeaveTakenReport = forwardRef(({ year, employeeSearch }, ref) => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     fetch(`${config.apiBaseURL}/yearly-leaves/?year=${year}`)
//       .then((res) => res.json())
//       .then((json) => {
//         setData(json);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error("Leave fetch error:", err);
//         setLoading(false);
//       });
//   }, [year]);

//   useImperativeHandle(ref, () => ({
//     downloadReport: async () => {
//       if (data.length === 0) {
//         showInfoToast("No data to export.");
//         return;
//       }

//       try {
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet("Leave Report");

//         // Add headers with S.No
//         const headers = [
//           "S.No",
//           "Employee Code",
//           "Employee Name",
//           "Start Date",
//           "End Date",
//           "No. of Days",
//           "Leave Type",
//         ];
//         worksheet.addRow(headers);

//         // Add data rows with S.No
//         data.forEach((leave, index) => {
//           worksheet.addRow([
//             index + 1,
//             leave?.employee?.employee_code || "",
//             leave?.employee?.employee_name || "",
//             leave?.start_date ? new Date(leave.start_date) : "",
//             leave?.end_date ? new Date(leave.end_date) : "",
//             isNaN(parseFloat(leave?.duration))
//               ? null
//               : parseFloat(leave.duration),
//             leave?.leave_type ? leave.leave_type.replace("_", " ") : "",
//           ]);
//         });

//         // Style header row
//         worksheet.getRow(1).eachCell((cell) => {
//           cell.font = { bold: true };
//           cell.alignment = { vertical: "middle", horizontal: "center" };
//           cell.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: "D3D3D3" }, // Light gray
//           };
//           cell.border = {
//             top: { style: "thin" },
//             bottom: { style: "thin" },
//             left: { style: "thin" },
//             right: { style: "thin" },
//           };
//         });

//         // Set column widths and formatting
//         worksheet.columns = [
//           { key: "sno", width: 8 },
//           { key: "empCode", width: 18 },
//           { key: "empName", width: 25 },
//           { key: "startDate", width: 15, style: { numFmt: "dd/mm/yyyy" } },
//           { key: "endDate", width: 15, style: { numFmt: "dd/mm/yyyy" } },
//           { key: "days", width: 15, style: { numFmt: "0.00" } },
//           { key: "leaveType", width: 20 },
//         ];

//         // Generate Excel file and save
//         const buffer = await workbook.xlsx.writeBuffer();
//         const blob = new Blob([buffer], {
//           type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         });

//         const currentDate = new Date().toISOString().split("T")[0];
//         saveAs(blob, `LeaveTakenReport_${currentDate}.xlsx`);
//       } catch (error) {
//         console.error("Excel Export Error:", error);
//         showInfoToast("Failed to generate Excel file.");
//       }
//     },
//   }));

//   return (
//     <div className="employee-table-wrapper">
//       <div
//         className="table-wrapper"
//         style={{ maxHeight: 400, overflowY: "auto" }}
//       >
//         {loading ? (
//           <div style={{ padding: 20 }}>Loading leave data...</div>
//         ) : data.length === 0 ? (
//           <div style={{ padding: 20 }}>No leave records found for {year}.</div>
//         ) : (
//           <table className="employee-table">
//             <thead>
//               <tr>
//                 <th>Employee Code</th>
//                 <th>Employee Name</th>
//                 <th>Start Date</th>
//                 <th>End Date</th>
//                 <th>No.of Days</th>
//                 <th>Leave Type</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data
//                 .filter((l) => {
//                   const search = employeeSearch.toLowerCase();
//                   const name = l.employee?.employee_name?.toLowerCase() || "";
//                   const code = l.employee?.employee_code?.toLowerCase() || "";

//                   return name.includes(search) || code.includes(search);
//                 })
//                 .map((l, i) => (
//                   <tr key={i}>
//                     <td>{l.employee.employee_code}</td>
//                     <td>{l.employee.employee_name}</td>
//                     <td>
//                       {new Date(l.start_date).toLocaleDateString("en-GB")}
//                     </td>
//                     <td>{new Date(l.end_date).toLocaleDateString("en-GB")}</td>
//                     <td>{parseFloat(l.duration)}</td>
//                     <td>{l.leave_type.replace("_", " ")}</td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       <ToastContainerComponent />
//     </div>
//   );
// });

// export default LeaveTakenReport;

// src/pages/HR/Reports/LeaveTakenReport.jsx
import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useRef,
} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import config from "../../../config";
import {
  showInfoToast,
  ToastContainerComponent,
} from "../../../constants/Toastify";
import { createPortal } from "react-dom";

/* ---------- NEW: small helpers ---------- */
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const endOfDay = (d) => {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
};
const overlaps = (ls, le, rs, re) => ls <= re && le >= rs; // inclusive
/* --------------------------------------- */

const LeaveTakenReport = forwardRef(({ year, employeeSearch = "" }, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sorting
  // const [sortKey, setSortKey] = useState("employee_code"); // "employee_code" | "employee_name"
  // const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  const [sortKey, setSortKey] = useState(""); // "employee_code" | "employee_name"
  const [sortDir, setSortDir] = useState(""); // "asc" | "desc"

  // Header filter state
  const [startFrom, setStartFrom] = useState(null);
  const [startTo, setStartTo] = useState(null);
  const [endFrom, setEndFrom] = useState(null);
  const [endTo, setEndTo] = useState(null);

  const [selectedLeaveTypes, setSelectedLeaveTypes] = useState(new Set()); // empty = all

  // NEW: one global range from the toolbar button (next to search)
  const [globalRange, setGlobalRange] = useState({
    start: null,
    end: null,
    mode: "range",
  }); // mode: "range" | "month"

  // Simple header popover control
  const [openMenu, setOpenMenu] = useState(null); // "start" | "end" | "type" | null
  const popoverRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 280 }); // px

  // place near your other handlers
  const openMenuAt = (e, key) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const gap = 6;
    const width = key === "type" ? 240 : 280; // narrower for checkbox list

    // default: open below, left-aligned to button
    let left = rect.left;
    let top = rect.bottom + gap;

    // Clamp horizontally (flip to the left if overflowing right edge)
    const maxLeft = window.innerWidth - width - 8;
    if (left > maxLeft) {
      // anchor to button's right edge
      left = Math.max(8, rect.right - width);
    } else {
      left = Math.max(8, left);
    }

    // Rough vertical fit (if would overflow bottom, open above)
    const estHeight = key === "type" ? 260 : 240; // estimate; real height is bounded by CSS max-height
    if (top + estHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - gap - estHeight);
    }

    setMenuPos({ top, left, width });
    setOpenMenu((prev) => (prev === key ? null : key));
  };

  useEffect(() => {
    const onDocClick = () => setOpenMenu(null);
    const onEsc = (e) => e.key === "Escape" && setOpenMenu(null);
    const onScroll = () => setOpenMenu(null); // close if user scrolls
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    window.addEventListener("scroll", onScroll, true); // capture scrolls in any container
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/yearly-leaves/?year=${year}`)
      .then((res) => res.json())
      .then((json) => {
        const arr = Array.isArray(json) ? json : [];
        setData(arr);
        // initialize leave types to "all selected"
        const allTypes = new Set(
          arr
            .map((x) => x?.leave_type)
            .filter(Boolean)
            .map((t) => t.toString())
        );
        setSelectedLeaveTypes(allTypes); // default = all checked
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leave fetch error:", err);
        setLoading(false);
      });
  }, [year]);

  // close popover on outside click / ESC
  useEffect(() => {
    const onDocClick = (e) => {
      if (!popoverRef.current) return;
      if (!popoverRef.current.contains(e.target)) setOpenMenu(null);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  // Unique leave types (for the checkbox list)
  const allLeaveTypes = useMemo(() => {
    const s = new Set(
      data
        .map((x) => x?.leave_type)
        .filter(Boolean)
        .map((t) => t.toString())
    );
    return Array.from(s).sort();
  }, [data]);

  const rows = useMemo(() => {
    const search = employeeSearch.toLowerCase();

    const matchSearch = (l) => {
      const name = l.employee?.employee_name?.toLowerCase() || "";
      const code = l.employee?.employee_code?.toLowerCase() || "";
      const type = l.leave_type?.toLowerCase() || "";
      return (
        name.includes(search) || code.includes(search) || type.includes(search)
      );
    };

    // NEW: global overlap check (any part of leave within selected range)
    const matchGlobalRange = (l) => {
      if (!globalRange.start || !globalRange.end) return true;
      const ls = l?.start_date ? startOfDay(new Date(l.start_date)) : null;
      const le = l?.end_date ? endOfDay(new Date(l.end_date)) : ls;
      if (!ls) return false;
      const rs = startOfDay(globalRange.start);
      const re = endOfDay(globalRange.end);
      return overlaps(ls, le, rs, re);
    };

    const inStartRange = (l) => {
      if (!startFrom && !startTo) return true;
      const d = l?.start_date ? new Date(l.start_date) : null;
      if (!d || Number.isNaN(+d)) return false;
      const afterFrom = startFrom
        ? d >= new Date(startFrom.setHours(0, 0, 0, 0))
        : true;
      const beforeTo = startTo
        ? d <= new Date(startTo.setHours(23, 59, 59, 999))
        : true;
      return afterFrom && beforeTo;
    };

    const inEndRange = (l) => {
      if (!endFrom && !endTo) return true;
      const d = l?.end_date ? new Date(l.end_date) : null;
      if (!d || Number.isNaN(+d)) return false;
      const afterFrom = endFrom
        ? d >= new Date(endFrom.setHours(0, 0, 0, 0))
        : true;
      const beforeTo = endTo
        ? d <= new Date(endTo.setHours(23, 59, 59, 999))
        : true;
      return afterFrom && beforeTo;
    };

    const inLeaveType = (l) => {
      if (!l?.leave_type) return false;
      // If selectedLeaveTypes is empty, we interpret it as "all" selected after initial load,
      // but we already prefill it with all types. So here we simply test membership.
      return selectedLeaveTypes.has(l.leave_type.toString());
    };

    const filtered = data.filter(
      (l) =>
        matchSearch(l) &&
        matchGlobalRange(l) &&
        inStartRange(l) &&
        inEndRange(l) &&
        inLeaveType(l)
    );

    const sorted = [...filtered].sort((a, b) => {
      const aEmp = a.employee || {};
      const bEmp = b.employee || {};
      const aVal =
        (sortKey === "employee_name"
          ? aEmp.employee_name
          : aEmp.employee_code) || "";
      const bVal =
        (sortKey === "employee_name"
          ? bEmp.employee_name
          : bEmp.employee_code) || "";
      const res = cmp(
        aVal.toString().toLowerCase(),
        bVal.toString().toLowerCase()
      );
      return sortDir === "asc" ? res : -res;
    });

    return sorted;
  }, [
    data,
    employeeSearch,
    // ranges
    globalRange,
    startFrom,
    startTo,
    endFrom,
    endTo,
    sortKey,
    sortDir,
    selectedLeaveTypes,
  ]);

  const handleHeaderSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // toggle leave type checkbox
  const toggleType = (t) => {
    setSelectedLeaveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const selectAllTypes = () => setSelectedLeaveTypes(new Set(allLeaveTypes));
  const clearAllTypes = () => setSelectedLeaveTypes(new Set());

  useImperativeHandle(ref, () => ({
    downloadReport: async () => {
      if (rows.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Leave Report");

        const headers = [
          "S.No",
          "Employee Code",
          "Employee Name",
          "Start Date",
          "End Date",
          "No. of Days",
          "Leave Type",
        ];
        worksheet.addRow(headers);

        rows.forEach((leave, index) => {
          worksheet.addRow([
            index + 1,
            leave?.employee?.employee_code || "",
            leave?.employee?.employee_name || "",
            leave?.start_date ? new Date(leave.start_date) : "",
            leave?.end_date ? new Date(leave.end_date) : "",
            isNaN(parseFloat(leave?.duration))
              ? null
              : parseFloat(leave.duration),
            leave?.leave_type ? leave.leave_type.replace("_", " ") : "",
          ]);
        });

        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.alignment = { vertical: "middle", horizontal: "center" };
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

        worksheet.columns = [
          { key: "sno", width: 8 },
          { key: "empCode", width: 18 },
          { key: "empName", width: 25 },
          { key: "startDate", width: 15, style: { numFmt: "dd/mm/yyyy" } },
          { key: "endDate", width: 15, style: { numFmt: "dd/mm/yyyy" } },
          { key: "days", width: 15, style: { numFmt: "0.00" } },
          { key: "leaveType", width: 20 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const currentDate = new Date().toISOString().split("T")[0];
        saveAs(blob, `LeaveTakenReport_${currentDate}.xlsx`);
      } catch (error) {
        console.error("Excel Export Error:", error);
        showInfoToast("Failed to generate Excel file.");
      }
    },
  }));

  return (
    <div className="employee-table-wrapper">
      <div
        className="table-wrapper"
        style={{ maxHeight: 400, overflowY: "auto" }}
      >
        {loading ? (
          <div style={{ padding: 20 }}>Loading leave data...</div>
        ) : data.length === 0 ? (
          <div style={{ padding: 20 }}>No leave records found for {year}.</div>
        ) : (
          <div style={{ position: "relative" }}>
            {/* one shared popover anchored visually near the headers */}
            {openMenu &&
              createPortal(
                <div
                  className="th-popover"
                  style={{
                    position: "fixed",
                    top: menuPos.top,
                    left: menuPos.left,
                    width: menuPos.width,
                    maxHeight: "60vh",
                    overflowY: "auto",
                    zIndex: 9999,
                  }}
                  onMouseDown={(e) => e.stopPropagation()} // keep clicks inside
                >
                  {openMenu === "start" && (
                    <div className="th-popover-content">
                      <div className="th-popover-title">Start Date filter</div>
                      <div className="th-popover-row">
                        <span>From</span>
                        <DatePicker
                          selected={startFrom}
                          onChange={(d) => setStartFrom(d)}
                          dateFormat="dd/MM/yyyy"
                          isClearable
                          placeholderText="dd/mm/yyyy"
                          maxDate={startTo || undefined}
                        />
                      </div>
                      <div className="th-popover-row">
                        <span>To</span>
                        <DatePicker
                          selected={startTo}
                          onChange={(d) => setStartTo(d)}
                          dateFormat="dd/MM/yyyy"
                          isClearable
                          placeholderText="dd/mm/yyyy"
                          minDate={startFrom || undefined}
                        />
                      </div>
                      <div className="th-popover-actions">
                        <button
                          onClick={() => {
                            setStartFrom(null);
                            setStartTo(null);
                          }}
                        >
                          Clear
                        </button>
                        <button onClick={() => setOpenMenu(null)}>Done</button>
                      </div>
                    </div>
                  )}

                  {openMenu === "end" && (
                    <div className="th-popover-content">
                      <div className="th-popover-title">End Date filter</div>
                      <div className="th-popover-row">
                        <span>From</span>
                        <DatePicker
                          selected={endFrom}
                          onChange={(d) => setEndFrom(d)}
                          dateFormat="dd/MM/yyyy"
                          isClearable
                          placeholderText="dd/mm/yyyy"
                          maxDate={endTo || undefined}
                        />
                      </div>
                      <div className="th-popover-row">
                        <span>To</span>
                        <DatePicker
                          selected={endTo}
                          onChange={(d) => setEndTo(d)}
                          dateFormat="dd/MM/yyyy"
                          isClearable
                          placeholderText="dd/mm/yyyy"
                          minDate={endFrom || undefined}
                        />
                      </div>
                      <div className="th-popover-actions">
                        <button
                          onClick={() => {
                            setEndFrom(null);
                            setEndTo(null);
                          }}
                        >
                          Clear
                        </button>
                        <button onClick={() => setOpenMenu(null)}>Done</button>
                      </div>
                    </div>
                  )}

                  {openMenu === "type" && (
                    <div className="th-popover-content">
                      <div className="th-popover-title">Leave Type</div>
                      <div className="th-checkbox-list">
                        {allLeaveTypes.length === 0 ? (
                          <div style={{ fontSize: 12, opacity: 0.8 }}>
                            No types
                          </div>
                        ) : (
                          allLeaveTypes.map((t) => (
                            <label key={t} className="th-checkbox-item">
                              <input
                                type="checkbox"
                                checked={selectedLeaveTypes.has(t)}
                                onChange={() => toggleType(t)}
                              />
                              <span>{t.replaceAll("_", " ")}</span>
                            </label>
                          ))
                        )}
                      </div>
                      <div className="th-popover-actions">
                        <button onClick={selectAllTypes}>Select All</button>
                        <button onClick={clearAllTypes}>Clear</button>
                        <button onClick={() => setOpenMenu(null)}>Done</button>
                      </div>
                    </div>
                  )}
                </div>,
                document.body
              )}

            <table className="employee-table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleHeaderSort("employee_code")}
                    className="th-sortable"
                    title="Click to sort"
                  >
                    Employee Code{" "}
                    {sortKey === "employee_code" ? (
                      sortDir === "asc" ? (
                        <i className="fa-solid fa-sort-up"></i>
                      ) : (
                        <i className="fa-solid fa-sort-down"></i>
                      )
                    ) : (
                      <i className="fa-solid fa-sort"></i>
                    )}
                  </th>
                  <th
                    onClick={() => handleHeaderSort("employee_name")}
                    className="th-sortable"
                    title="Click to sort"
                  >
                    Employee Name{" "}
                    {sortKey === "employee_name" ? (
                      sortDir === "asc" ? (
                        <i className="fa-solid fa-sort-up"></i>
                      ) : (
                        <i className="fa-solid fa-sort-down"></i>
                      )
                    ) : (
                      <i className="fa-solid fa-sort"></i>
                    )}
                  </th>

                  <th className="th-with-filter">
                    <div className="th-label">Start Date</div>
                    <button
                      className="th-filter-btn"
                      title="Filter Start Date (From/To)"
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   setOpenMenu((m) => (m === "start" ? null : "start"));
                      // }}
                      onClick={(e) => openMenuAt(e, "start")}
                    >
                      <i className="fa-solid fa-calendar-days"></i>
                    </button>
                    {(startFrom || startTo) && (
                      <span className="th-chip">filtered</span>
                    )}
                  </th>

                  <th className="th-with-filter">
                    <div className="th-label">End Date</div>
                    <button
                      className="th-filter-btn"
                      title="Filter End Date (From/To)"
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   setOpenMenu((m) => (m === "end" ? null : "end"));
                      // }}
                      onClick={(e) => openMenuAt(e, "end")}
                    >
                      <i className="fa-solid fa-calendar-days"></i>
                    </button>
                    {(endFrom || endTo) && (
                      <span className="th-chip">filtered</span>
                    )}
                  </th>

                  <th>No.of Days</th>

                  <th className="th-with-filter">
                    <div className="th-label">Leave Type</div>
                    <button
                      className="th-filter-btn"
                      title="Filter by Leave Type"
                      // onClick={(e) => {
                      //   e.stopPropagation();
                      //   setOpenMenu((m) => (m === "type" ? null : "type"));
                      // }}
                      onClick={(e) => openMenuAt(e, "type")}
                    >
                      <i className="fa-solid fa-filter"></i>
                    </button>
                    {selectedLeaveTypes.size !== allLeaveTypes.length && (
                      <span className="th-chip">{selectedLeaveTypes.size}</span>
                    )}
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((l, i) => (
                  <tr key={i}>
                    <td>{l.employee?.employee_code}</td>
                    <td>{l.employee?.employee_name}</td>
                    <td>
                      {l.start_date
                        ? new Date(l.start_date).toLocaleDateString("en-GB")
                        : ""}
                    </td>
                    <td>
                      {l.end_date
                        ? new Date(l.end_date).toLocaleDateString("en-GB")
                        : ""}
                    </td>
                    <td>
                      {isNaN(parseFloat(l.duration))
                        ? ""
                        : parseFloat(l.duration)}
                    </td>
                    <td>{l.leave_type?.replaceAll("_", " ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ToastContainerComponent />
    </div>
  );
});

export default LeaveTakenReport;
