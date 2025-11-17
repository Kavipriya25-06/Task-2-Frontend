// src\pages\HR\Reports\AttritionReport.jsx

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

const AttritionReport = forwardRef(({ year }, ref) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---- fetch ----
  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/attrition-report/?year=${year}`)
      .then((r) => r.json())
      .then((json) => setRows(Array.isArray(json) ? json : []))
      .catch((e) => console.error("attrition fetch error", e))
      .finally(() => setLoading(false));
  }, [year]);

  // ---- totals row (simple sums; attrition shown as avg of monthly %) ----
  const totalRow = useMemo(() => {
    if (!rows.length) return null;
    const sum = (k) => rows.reduce((a, r) => a + (Number(r[k]) || 0), 0);
    const avgAttr =
      rows.length > 0
        ? (
            rows.reduce((a, r) => a + (Number(r.attrition_rate) || 0), 0) /
            rows.length
          ).toFixed(1)
        : "0.0";
    return {
      month: "TOTAL",
      fulltime: sum("fulltime"),
      interns: sum("interns"),
      trainees: sum("trainees"),
      contract: sum("contract"),
      total_resources: sum("total_resources"),
      resigned: sum("resigned"),
      new_recruits: sum("new_recruits"),
      attrition_rate: avgAttr, // displayed as % string
    };
  }, [rows]);

  // ---- Excel export ----
  useImperativeHandle(ref, () => ({
    downloadReport: async () => {
      if (!rows.length) {
        showInfoToast("No data to export.");
        return;
      }

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Attrition Trend");

      // Header
      const header = [
        "MM/YY",
        "Full Time",
        "Interns",
        "Trainees",
        "Contract",
        "Total resources",
        "Resigned",
        "New Recruits",
        "Attrition rate",
      ];
      ws.addRow(header);
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
      rows.forEach((r) => {
        const row = ws.addRow([
          r.month,
          r.fulltime,
          r.interns,
          r.trainees,
          r.contract,
          r.total_resources,
          r.resigned,
          r.new_recruits,
          (Number(r.attrition_rate) || 0) / 100, // write as fraction for % format
        ]);
        row.getCell(9).numFmt = "0.0%";
      });

      //   // Total row
      //   if (totalRow) {
      //     const tr = ws.addRow([
      //       totalRow.month,
      //       totalRow.fulltime,
      //       totalRow.interns,
      //       totalRow.trainees,
      //       totalRow.contract,
      //       totalRow.total_resources,
      //       totalRow.resigned,
      //       totalRow.new_recruits,
      //       Number(totalRow.attrition_rate) / 100,
      //     ]);
      //     tr.font = { bold: true };
      //     tr.getCell(9).numFmt = "0.0%";
      //   }

      // Column widths
      ws.columns = [
        { width: 16 },
        { width: 12 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 16 },
        { width: 10 },
        { width: 14 },
        { width: 14 },
      ];

      const buf = await wb.xlsx.writeBuffer();
      saveAs(
        new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `Attrition_Trend_${year}.xlsx`
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
          <div style={{ padding: 20 }}>Loading attrition trend…</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: 20 }}>No data.</div>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>MM/YY</th>
                <th>Full Time</th>
                <th>Interns</th>
                <th>Trainees</th>
                <th>Contract</th>
                <th>Total resources</th>
                <th>Resigned</th>
                <th>New Recruits</th>
                <th>Attrition rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.month}>
                  <td style={{ textAlign: "left" }}>{r.month}</td>
                  <td>{r.fulltime}</td>
                  <td>{r.interns}</td>
                  <td>{r.trainees}</td>
                  <td>{r.contract}</td>
                  <td>{r.total_resources}</td>
                  <td>{r.resigned}</td>
                  <td>{r.new_recruits}</td>
                  <td>{Number(r.attrition_rate).toFixed(1)}%</td>
                </tr>
              ))}
              {/* {totalRow && (
                <tr>
                  <td style={{ fontWeight: "bold" }}>{totalRow.month}</td>
                  <td style={{ fontWeight: "bold" }}>{totalRow.fulltime}</td>
                  <td style={{ fontWeight: "bold" }}>{totalRow.interns}</td>
                  <td style={{ fontWeight: "bold" }}>{totalRow.trainees}</td>
                  <td style={{ fontWeight: "bold" }}>{totalRow.contract}</td>
                  <td style={{ fontWeight: "bold" }}>
                    {totalRow.total_resources}
                  </td>
                  <td style={{ fontWeight: "bold" }}>{totalRow.resigned}</td>
                  <td style={{ fontWeight: "bold" }}>
                    {totalRow.new_recruits}
                  </td>
                  <td style={{ fontWeight: "bold" }}>
                    {totalRow.attrition_rate}%
                  </td>
                </tr>
              )} */}
            </tbody>
          </table>
        )}
      </div>
      <ToastContainerComponent />
    </div>
  );
});

export default AttritionReport;
