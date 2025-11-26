// src\pages\HR\Reports\MonthlyAttendanceReport.jsx

import React, {
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
  forwardRef,
} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import config from "../../../config";
import {
  ToastContainerComponent,
  showInfoToast,
} from "../../../constants/Toastify";

const MonthlyAttendanceReport = forwardRef(
  ({ year, month, employeeSearch = "" }, ref) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch
    useEffect(() => {
      if (!year || !month) return;
      setLoading(true);
      fetch(
        `${config.apiBaseURL}/monthly-attendance-report/?year=${year}&month=${month}`
      )
        .then((r) => r.json())
        .then((json) => setRows(Array.isArray(json) ? json : []))
        .catch((e) => console.error("attendance fetch error", e))
        .finally(() => setLoading(false));
    }, [year, month]);

    // Search filter (by name or department)
    const filtered = useMemo(() => {
      const q = (employeeSearch || "").trim().toLowerCase();
      if (!q) return rows;
      return rows.filter((r) => {
        const dep = (r.department || "").toLowerCase();
        const name = (r.name || "").toLowerCase();
        const code = (r.employee_code || "").toLowerCase();
        return dep.includes(q) || name.includes(q) || code.includes(q);
      });
    }, [rows, employeeSearch]);

    // Sort by ABSENT desc (like your example)
    const displayRows = useMemo(() => {
      return [...filtered].sort((a, b) => (b.absent || 0) - (a.absent || 0));
    }, [filtered]);

    // Excel export
    useImperativeHandle(ref, () => ({
      downloadReport: async () => {
        if (!displayRows.length) {
          showInfoToast("No data to export.");
          return;
        }
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Monthly Attendance");

        // Header
        const header = [
          "DEPARTMENT",
          "EMP CODE",
          "NAME",
          "LAST NAME",
          "ABSENT",
          "Notes",
          "LATE",
          "OD",
          "WFH",
        ];
        ws.addRow(header);

        // Style header
        ws.getRow(1).eachCell((c) => {
          c.font = { bold: true, color: { argb: "FFFFFFFF" } };
          c.alignment = { vertical: "middle", horizontal: "center" };
          c.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "444444" },
          };
          c.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            bottom: { style: "thin" },
          };
        });

        // Rows
        displayRows.forEach((r) => {
          const row = ws.addRow([
            r.department || "-",
            r.employee_code || "-",
            r.name || "-",
            r.last_name || "-",
            Number(r.absent || 0),
            r.notes || "",
            Number(r.late || 0),
            Number(r.od || 0),
            Number(r.wfh || 0),
          ]);
          // Wrap notes
          row.getCell(4).alignment = { wrapText: true, vertical: "top" };
        });

        // Column widths
        ws.columns = [
          { width: 18 }, // DEPARTMENT
          { width: 14 }, // EMP CODE
          { width: 24 }, // NAME
          { width: 10 }, // LAST NAME
          { width: 10 }, // ABSENT
          { width: 45 }, // Notes (wider)
          { width: 10 }, // LATE
          { width: 10 }, // OD
          { width: 10 }, // WFH
        ];

        // Row height for readability if long notes
        for (let i = 2; i <= ws.rowCount; i++) {
          ws.getRow(i).height = 18;
        }

        const buf = await wb.xlsx.writeBuffer();
        saveAs(
          new Blob([buf], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          `Monthly_Attendance_${year}-${String(month).padStart(2, "0")}.xlsx`
        );
      },
    }));

    return (
      <div className="employee-table-wrapper">
        <div
          className="table-wrapper"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          {loading ? (
            <div style={{ padding: 20 }}>Loading monthly attendance…</div>
          ) : displayRows.length === 0 ? (
            <div style={{ padding: 20 }}>No records.</div>
          ) : (
            <table className="employee-table">
              <thead>
                <tr>
                  <th>DEPARTMENT</th>
                  <th>EMP CODE</th>
                  <th>NAME</th>
                  <th>LAST NAME</th>
                  <th>ABSENT</th>
                  <th>Notes</th>
                  <th>LATE</th>
                  <th>OD</th>
                  <th>WFH</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r, idx) => (
                  <tr key={`${r.employee_code}_${idx}`}>
                    <td>{r.department || "-"}</td>
                    <td>{r.employee_code || "-"}</td>
                    <td>{r.name || "-"}</td>
                    <td>{r.last_name || "-"}</td>
                    <td>{Number(r.absent || 0)}</td>
                    <td style={{ textAlign: "left", whiteSpace: "pre-wrap" }}>
                      {r.notes || ""}
                    </td>
                    <td>{Number(r.late || 0)}</td>
                    <td>{Number(r.od || 0)}</td>
                    <td>{Number(r.wfh || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <ToastContainerComponent />
      </div>
    );
  }
);

export default MonthlyAttendanceReport;
