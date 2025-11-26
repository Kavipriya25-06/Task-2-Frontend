// // src\pages\HR\Reports\LOPReport.jsx

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

// const LOPReport = forwardRef(({ year, employeeSearch }, ref) => {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     setLoading(true);
//     fetch(`${config.apiBaseURL}/employee-lop/?year=${year}`)
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

//   const getMonthsForYear = (year) => {
//     const formatter = new Intl.DateTimeFormat("en-GB", { month: "short" });
//     return Array.from({ length: 12 }, (_, i) => {
//       const date = new Date(year, i); // Jan = 0
//       return {
//         label: `${formatter.format(date)} ${year}`, // e.g., Jan 2025
//         key: `${year}-${String(i + 1).padStart(2, "0")}`, // e.g., 2025-01
//       };
//     });
//   };

//   const months = getMonthsForYear(year);

//   useImperativeHandle(ref, () => ({
//     downloadReport: async () => {
//       if (data.length === 0) {
//         showInfoToast("No data to export.");
//         return;
//       }

//       try {
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet("Monthly LOP");

//         // Header row with S.No and dynamic month columns
//         const headers = [
//           "S.No",
//           "Employee Code",
//           "Employee Name",
//           "DOJ",
//           "Present Status",
//           "Resigned",
//           ...months.map((m) => m.label),
//         ];
//         worksheet.addRow(headers);

//         // Add data rows
//         data.forEach((l, index) => {
//           const lopMap = {};
//           l.lop_by_month?.forEach((entry) => {
//             lopMap[entry.month] = entry.days;
//           });

//           worksheet.addRow([
//             index + 1,
//             l.employee_code || "",
//             l.employee_name || "",
//             l.doj ? new Date(l.doj) : "",
//             l.status || "",
//             l.resignation_date ? new Date(l.resignation_date) : "",
//             ...months.map((m) => lopMap[m.key] ?? 0),
//           ]);
//         });

//         // Style header
//         const headerRow = worksheet.getRow(1);
//         headerRow.eachCell((cell) => {
//           cell.font = { bold: true };
//           cell.alignment = { vertical: "middle", horizontal: "center" };
//           cell.fill = {
//             type: "pattern",
//             pattern: "solid",
//             fgColor: { argb: "D9D9D9" },
//           };
//           cell.border = {
//             top: { style: "thin" },
//             left: { style: "thin" },
//             bottom: { style: "thin" },
//             right: { style: "thin" },
//           };
//         });

//         // Set column widths and formats
//         const baseWidths = [8, 18, 22, 15, 18, 15];
//         worksheet.columns = [
//           ...baseWidths.map((width, idx) => ({
//             width,
//             style: idx === 3 || idx === 5 ? { numFmt: "dd/mm/yyyy" } : {},
//           })),
//           ...months.map(() => ({ width: 10 })),
//         ];

//         const buffer = await workbook.xlsx.writeBuffer();
//         const blob = new Blob([buffer], {
//           type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         });

//         const dateStr = new Date().toISOString().split("T")[0];
//         saveAs(blob, `LOP_Report_${dateStr}.xlsx`);
//       } catch (error) {
//         console.error("Excel export error:", error);
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
//                 {/* <th>DOJ</th>
//                 <th>Present Status</th> */}
//                 {/* <th>Resigned</th> */}
//                 {months.map((m) => (
//                   <th key={m.key}>{m.label}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {data
//                 .filter((l) => {
//                   const search = employeeSearch.toLowerCase();
//                   const name = l.employee_name?.toLowerCase() || "";
//                   const code = l.employee_code?.toLowerCase() || "";

//                   return name.includes(search) || code.includes(search);
//                 })
//                 .map((l, i) => {
//                   const lopMap = {};
//                   l.lop_by_month?.forEach((entry) => {
//                     lopMap[entry.month] = entry.days;
//                   });

//                   return (
//                     <tr key={i}>
//                       <td>{l.employee_code}</td>
//                       <td>{l.employee_name}</td>
//                       {/* <td>
//                         {(l.doj &&
//                           new Date(l.doj).toLocaleDateString("en-GB")) ||
//                           "-"}
//                       </td>
//                       <td>{l.status}</td>
//                       <td>
//                         {l.resignation_date
//                           ? new Date(l.resignation_date).toLocaleDateString(
//                               "en-GB"
//                             )
//                           : "-"}
//                       </td> */}
//                       {months.map((m) => (
//                         <td key={m.key}>{lopMap[m.key] ?? 0}</td>
//                       ))}
//                     </tr>
//                   );
//                 })}
//             </tbody>
//           </table>
//         )}
//       </div>
//       <ToastContainerComponent />
//     </div>
//   );
// });

// export default LOPReport;

// src/pages/HR/Reports/LOPReport.jsx

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
const normalize = (v = "") => String(v).trim().toLowerCase();

const LOPReport = forwardRef(({ year, employeeSearch = "" }, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0:A 1:I 2:R 3:All

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

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/employee-lop/?year=${year}`)
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

  const getMonthsForYear = (yr) => {
    const formatter = new Intl.DateTimeFormat("en-GB", { month: "short" });
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(yr, i);
      return {
        label: `${formatter.format(date)} ${yr}`, // Jan 2025
        key: `${yr}-${String(i + 1).padStart(2, "0")}`, // 2025-01
      };
    });
  };
  const months = getMonthsForYear(year);

  // Tab counts for badges
  const statusCounts = useMemo(() => {
    const counts = { active: 0, inactive: 0, resigned: 0, all: data.length };
    data.forEach((r) => {
      const s = normalize(r.status);
      if (s === "active") counts.active += 1;
      else if (s === "inactive") counts.inactive += 1;
      else if (s === "resigned") counts.resigned += 1;
    });
    return counts;
  }, [data]);

  // Single source of truth for displayed rows (tab + search)
  // filteredRows (ADD final sort stage)
  const filteredRows = useMemo(() => {
    const search = employeeSearch.trim().toLowerCase();

    const tabOk = (r) => {
      if (activeTab === 3) return true;
      const want = normalize(TAB_LABELS[activeTab]);
      return normalize(r.status) === want;
    };
    const searchOk = (r) => {
      if (!search) return true;
      const name = r.employee_name?.toLowerCase() || "";
      const code = r.employee_code?.toLowerCase() || "";
      return name.includes(search) || code.includes(search);
    };

    const rows = data.filter((r) => tabOk(r) && searchOk(r));

    if (!sortKey || !sortDir) return rows;

    return [...rows].sort((a, b) => {
      const aVal =
        (sortKey === "employee_name" ? a.employee_name : a.employee_code) || "";
      const bVal =
        (sortKey === "employee_name" ? b.employee_name : b.employee_code) || "";
      const res = cmp(
        aVal.toString().toLowerCase(),
        bVal.toString().toLowerCase()
      );
      return sortDir === "asc" ? res : -res;
    });
  }, [data, activeTab, employeeSearch, sortKey, sortDir]);

  useImperativeHandle(ref, () => ({
    downloadReport: async () => {
      if (filteredRows.length === 0) {
        showInfoToast("No data to export for the selected tab/search.");
        return;
      }

      try {
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet("Monthly LOP");

        // Header
        const headers = [
          "S.No",
          "Employee Code",
          "Employee Name",
          "Last Name",
          "DOJ",
          "Present Status",
          "Resigned",
          ...months.map((m) => m.label),
        ];
        ws.addRow(headers);

        // Rows
        filteredRows.forEach((l, index) => {
          const lopMap = {};
          l.lop_by_month?.forEach((e) => {
            lopMap[e.month] = e.days;
          });

          ws.addRow([
            index + 1,
            l.employee_code || "",
            l.employee_name || "",
            l.last_name || "",
            l.doj ? new Date(l.doj) : "",
            l.status || "",
            l.resignation_date ? new Date(l.resignation_date) : "",
            ...months.map((m) => lopMap[m.key] ?? 0),
          ]);
        });

        // Style header
        ws.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D9D9D9" },
          };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Column widths/formats
        const baseWidths = [8, 18, 18, 22, 15, 18, 15]; // until "Resigned"
        ws.columns = [
          ...baseWidths.map((width, idx) => ({
            width,
            style: idx === 3 || idx === 5 ? { numFmt: "dd/mm/yyyy" } : {},
          })),
          ...months.map(() => ({ width: 10 })),
        ];

        const buf = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const dateStr = new Date().toISOString().split("T")[0];
        const tabName = TAB_LABELS[activeTab].replace(/\s+/g, "");
        saveAs(blob, `LOP_Report_${tabName}_${dateStr}.xlsx`);
      } catch (error) {
        console.error("Excel export error:", error);
        showInfoToast("Failed to generate Excel file.");
      }
    },
  }));

  return (
    <div className="employee-table-wrapper">
      {/* Tabs */}
      <div className="leaves-tab" style={{ marginBottom: 10 }}>
        {TAB_LABELS.map((label, i) => {
          const key = normalize(label);
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

      <div className="table-wrapper" style={{ overflowY: "auto" }}>
        {loading ? (
          <div style={{ padding: 20 }}>Loading leave data...</div>
        ) : filteredRows.length === 0 ? (
          <div style={{ padding: 20 }}>
            No leave records found for {year} in “{TAB_LABELS[activeTab]}”.
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
                  Employee Code
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
                  Employee Name
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
                <th>Last Name</th>
                {/* <th>Present Status</th>
                <th>Resigned</th> */}
                {months.map((m) => (
                  <th key={m.key}>{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((l, i) => {
                const lopMap = {};
                l.lop_by_month?.forEach((entry) => {
                  lopMap[entry.month] = entry.days;
                });

                return (
                  <tr key={`${l.employee_code || "-"}_${i}`}>
                    <td>{l.employee_code}</td>
                    <td>{l.employee_name}</td>
                    <td>{l.last_name}</td>
                    {/* <td>{l.doj ? new Date(l.doj).toLocaleDateString("en-GB") : "-"}</td>
                    <td>{l.status || "-"}</td>
                    <td>
                      {l.resignation_date
                        ? new Date(l.resignation_date).toLocaleDateString("en-GB")
                        : "-"}
                    </td> */}
                    {months.map((m) => (
                      <td key={m.key}>{lopMap[m.key] ?? 0}</td>
                    ))}
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
});

export default LOPReport;
