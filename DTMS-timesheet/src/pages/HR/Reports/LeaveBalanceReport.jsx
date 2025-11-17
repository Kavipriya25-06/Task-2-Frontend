// // src\pages\HR\Reports\LeaveBalanceReport.jsx

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

// const LeaveBalanceReport = forwardRef(({ year, employeeSearch }, ref) => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     fetch(`${config.apiBaseURL}/leaves-available-report/?year=${year}`)
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
//       const filtered = data;
//       //   .filter(
//       //   (l) => new Date(l.employee.doj).getFullYear() === parseInt(year)
//       // );

//       if (filtered.length === 0) {
//         showInfoToast("No data to export.");
//         return;
//       }

//       try {
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet("Leave Balance");

//         // Add header row with S.No
//         const headers = [
//           "S.No",
//           "Employee Code",
//           "Employee Name",
//           "DOJ",
//           "Present Status",
//           "CL",
//           "SL",
//           // "EL",
//           "Comp-off",
//           "LOP",
//           "Total Leaves Available",
//         ];
//         worksheet.addRow(headers);

//         // Add data rows
//         filtered.forEach((l, index) => {
//           const cl = parseFloat(l.casual_leave || 0);
//           const sl = parseFloat(l.sick_leave || 0);
//           // const el = parseFloat(l.earned_leave || 0);
//           const comp = parseFloat(l.comp_off || 0);
//           const lop = parseFloat(l.lop || 0);
//           // const totalLeaves = cl + sl + el + comp;
//           const totalLeaves = cl + sl + comp;

//           worksheet.addRow([
//             index + 1,
//             l.employee?.employee_code || "",
//             l.employee?.employee_name || "",
//             l.employee?.doj ? new Date(l.employee.doj) : "",
//             l.employee?.status || "",
//             cl,
//             sl,
//             // el,
//             comp,
//             lop, // LOP
//             totalLeaves,
//           ]);
//         });

//         // Style header row
//         worksheet.getRow(1).eachCell((cell) => {
//           cell.font = { bold: true };
//           cell.alignment = { vertical: "middle", horizontal: "center" };
//           cell.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: "D3D3D3" }, // Light gray background
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
//           { width: 8 },
//           { width: 18 },
//           { width: 22 },
//           { width: 15, style: { numFmt: "dd/mm/yyyy" } },
//           { width: 18 },
//           { width: 10, style: { numFmt: "0.00" } },
//           { width: 10, style: { numFmt: "0.00" } },
//           { width: 10, style: { numFmt: "0.00" } },
//           { width: 12, style: { numFmt: "0.00" } },
//           { width: 10, style: { numFmt: "0.00" } },
//           { width: 20, style: { numFmt: "0.00" } },
//         ];

//         const buffer = await workbook.xlsx.writeBuffer();
//         const blob = new Blob([buffer], {
//           type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         });

//         const currentDate = new Date().toISOString().split("T")[0];
//         saveAs(blob, `LeaveBalanceReport_${currentDate}.xlsx`);
//       } catch (error) {
//         console.error("Excel export error:", error);
//         showInfoToast("Error generating Excel file.");
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
//           <div style={{ padding: 20 }}>No leave records found.</div>
//         ) : (
//           <table className="employee-table">
//             <thead>
//               <tr>
//                 <th>Employee Code</th>
//                 <th>Employee Name</th>
//                 {/* <th>DOJ</th> */}
//                 {/* <th>Present Status</th> */}
//                 <th>CL</th>
//                 <th>SL</th>
//                 {/* <th>EL</th> */}
//                 <th>Comp-off</th>
//                 <th>LOP</th>
//                 <th>Total Leaves Available</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data
//                 // .filter(
//                 //   (l) =>
//                 //     new Date(l.employee.doj).getFullYear() === parseInt(year)
//                 // )
//                 .filter((l) => {
//                   const search = employeeSearch.toLowerCase();
//                   const name = l.employee?.employee_name?.toLowerCase() || "";
//                   const code = l.employee?.employee_code?.toLowerCase() || "";

//                   return name.includes(search) || code.includes(search);
//                 })
//                 .map((l, i) => (
//                   <tr key={i}>
//                     <td>{l.employee?.employee_code || "-"}</td>
//                     <td>{l.employee?.employee_name || "-"}</td>
//                     {/* <td>
//                       {new Date(l.employee?.doj).toLocaleDateString("en-GB")}
//                     </td> */}
//                     {/* <td>{l.employee?.status}</td> */}
//                     <td>{parseFloat(l.casual_leave)}</td>
//                     <td>{parseFloat(l.sick_leave)}</td>
//                     {/* <td>{parseFloat(l.earned_leave)}</td> */}
//                     <td>{parseFloat(l.comp_off)}</td>
//                     <td>{parseFloat(l.lop)}</td>
//                     <td>
//                       {Math.max(
//                         0,
//                         parseFloat(l.casual_leave || 0) +
//                           parseFloat(l.sick_leave || 0) +
//                           // parseFloat(l.earned_leave || 0) +
//                           parseFloat(l.comp_off || 0)
//                       )}
//                     </td>
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

// export default LeaveBalanceReport;

// src/pages/HR/Reports/LeaveBalanceReport.jsx

import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useMemo,
} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import config from "../../../config";
import {
  ToastContainerComponent,
  showInfoToast,
} from "../../../constants/Toastify";

const TAB_LABELS = ["Active", "Inactive", "Resigned"];

const normalizeStatus = (val = "") => String(val).trim().toLowerCase(); // "active" | "inactive" | "resigned" | etc.

const LeaveBalanceReport = forwardRef(({ year, employeeSearch = "" }, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // NEW: sorting state
  const [sortKey, setSortKey] = useState(""); // "employee_code" | "employee_name"
  const [sortDir, setSortDir] = useState(""); // "asc" | "desc"

  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const handleHeaderSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Tabs
  const [activeTab, setActiveTab] = useState(0); // 0: Active, 1: Inactive, 2: Resigned, 3: All

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/leaves-available-report/?year=${year}`)
      .then((res) => res.json())
      .then((json) => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leave fetch error:", err);
        setLoading(false);
      });
  }, [year]);

  // Counts for badges in tab labels
  const statusCounts = useMemo(() => {
    const counts = { active: 0, inactive: 0, resigned: 0, all: 0 };
    counts.all = data.length;
    data.forEach((l) => {
      const s = normalizeStatus(l.employee?.status);
      if (s === "active") counts.active += 1;
      else if (s === "inactive") counts.inactive += 1;
      else if (s === "resigned") counts.resigned += 1;
    });
    return counts;
  }, [data]);

  // Search + Tab filtering (single source of truth for displayed rows)
  // filteredRows (ADD final sort stage)
  const filteredRows = useMemo(() => {
    const search = employeeSearch.trim().toLowerCase();

    const tabOk = (l) => {
      if (activeTab === 3) return true;
      const statusWanted = normalizeStatus(TAB_LABELS[activeTab]);
      return normalizeStatus(l.employee?.status) === statusWanted;
    };
    const searchOk = (l) => {
      if (!search) return true;
      const name = l.employee?.employee_name?.toLowerCase() || "";
      const code = l.employee?.employee_code?.toLowerCase() || "";
      return name.includes(search) || code.includes(search);
    };

    const rows = data.filter((l) => tabOk(l) && searchOk(l));

    if (!sortKey || !sortDir) return rows;

    return [...rows].sort((a, b) => {
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
  }, [data, activeTab, employeeSearch, sortKey, sortDir]);

  useImperativeHandle(ref, () => ({
    downloadReport: async () => {
      const rowsToExport = filteredRows;

      if (rowsToExport.length === 0) {
        showInfoToast("No data to export for the selected tab/search.");
        return;
      }

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Leave Balance");

        // Header
        const headers = [
          "S.No",
          "Employee Code",
          "Employee Name",
          "DOJ",
          "Present Status",
          "CL",
          "SL",
          // "EL",
          "Comp-off",
          "LOP",
          "Total Leaves Available",
        ];
        worksheet.addRow(headers);

        // Rows
        rowsToExport.forEach((l, index) => {
          const cl = parseFloat(l.casual_leave || 0);
          const sl = parseFloat(l.sick_leave || 0);
          // const el = parseFloat(l.earned_leave || 0);
          const comp = parseFloat(l.comp_off || 0);
          const lop = parseFloat(l.lop || 0);
          const totalLeaves = cl + sl + comp; // + el (if re-enabled)

          worksheet.addRow([
            index + 1,
            l.employee?.employee_code || "",
            l.employee?.employee_name || "",
            l.employee?.doj ? new Date(l.employee.doj) : "",
            l.employee?.status || "",
            cl,
            sl,
            // el,
            comp,
            lop,
            totalLeaves,
          ]);
        });

        // Style header
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

        // Column widths
        worksheet.columns = [
          { width: 8 },
          { width: 18 },
          { width: 22 },
          { width: 15, style: { numFmt: "dd/mm/yyyy" } },
          { width: 18 },
          { width: 10, style: { numFmt: "0.00" } },
          { width: 10, style: { numFmt: "0.00" } },
          { width: 10, style: { numFmt: "0.00" } },
          { width: 12, style: { numFmt: "0.00" } },
          { width: 20, style: { numFmt: "0.00" } },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const date = new Date().toISOString().split("T")[0];
        const tabName = TAB_LABELS[activeTab].replace(/\s+/g, "");
        saveAs(blob, `LeaveBalanceReport_${tabName}_${date}.xlsx`);
      } catch (error) {
        console.error("Excel export error:", error);
        showInfoToast("Error generating Excel file.");
      }
    },
  }));

  return (
    <div className="employee-table-wrapper">
      {/* Tabs */}
      <div className="leaves-tab" style={{ marginBottom: 10 }}>
        {TAB_LABELS.map((label, i) => {
          const key = normalizeStatus(label); // active|inactive|resigned|all
          const count =
            key === "active"
              ? statusCounts.active
              : key === "inactive"
              ? statusCounts.inactive
              : key === "resigned"
              ? statusCounts.resigned
              : statusCounts.all;

          return (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={activeTab === i ? "button active" : "button"}
              style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
            >
              <span>{label}</span>
              {/* <span
                style={{
                  fontSize: 12,
                  padding: "2px 6px",
                  borderRadius: 10,
                  background: activeTab === i ? "#fff" : "#e5e5e5",
                  color: activeTab === i ? "#333" : "#555",
                }}
              >
                {count}
              </span> */}
            </button>
          );
        })}
      </div>

      <div
        className="table-wrapper"
        style={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        {loading ? (
          <div style={{ padding: 20 }}>Loading leave data...</div>
        ) : filteredRows.length === 0 ? (
          <div style={{ padding: 20 }}>
            No records found for “{TAB_LABELS[activeTab]}”.
          </div>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                {/* <th>Employee Code</th>
                <th>Employee Name</th> */}
                <th
                  onClick={() => handleHeaderSort("employee_code")}
                  className="th-sortable"
                  title="Click to sort"
                >
                  Employee Code{" "}
                  {sortKey === "employee_code" ? (
                    sortDir === "asc" ? (
                      <i className="fa-solid fa-sort-up" />
                    ) : (
                      <i className="fa-solid fa-sort-down" />
                    )
                  ) : (
                    <i className="fa-solid fa-sort" />
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
                      <i className="fa-solid fa-sort-up" />
                    ) : (
                      <i className="fa-solid fa-sort-down" />
                    )
                  ) : (
                    <i className="fa-solid fa-sort" />
                  )}
                </th>
                {/* <th>DOJ</th> */}
                {/* <th>Present Status</th> */}
                <th>CL</th>
                <th>SL</th>
                {/* <th>EL</th> */}
                <th>Comp-off</th>
                <th>LOP</th>
                <th>Total Leaves Available</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((l, i) => (
                <tr key={`${l.employee?.employee_code || "-"}_${i}`}>
                  <td>{l.employee?.employee_code || "-"}</td>
                  <td>{l.employee?.employee_name || "-"}</td>
                  {/* <td>
                    {l.employee?.doj
                      ? new Date(l.employee.doj).toLocaleDateString("en-GB")
                      : "-"}
                  </td> */}
                  {/* <td>{l.employee?.status || "-"}</td> */}
                  <td>{parseFloat(l.casual_leave || 0)}</td>
                  <td>{parseFloat(l.sick_leave || 0)}</td>
                  {/* <td>{parseFloat(l.earned_leave || 0)}</td> */}
                  <td>{parseFloat(l.comp_off || 0)}</td>
                  <td>{parseFloat(l.lop || 0)}</td>
                  <td>
                    {Math.max(
                      0,
                      parseFloat(l.casual_leave || 0) +
                        parseFloat(l.sick_leave || 0) +
                        // parseFloat(l.earned_leave || 0) +
                        parseFloat(l.comp_off || 0)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ToastContainerComponent />
    </div>
  );
});

export default LeaveBalanceReport;
