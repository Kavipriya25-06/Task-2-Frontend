import React, {
  useEffect,
  useMemo,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import config from "../../../config";
import { showInfoToast } from "../../../constants/Toastify";

const num = (v) => Number.parseFloat(v ?? 0);
const fmt = (v) => (v === null || v === undefined ? "-" : Number(v).toFixed(1));

/**
 * Props: year, month, employeeSearch
 * Exposes: downloadReport()
 */
const LeaveMonthlyLedger = forwardRef(
  ({ year, month, employeeSearch = "" }, ref) => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortKey, setSortKey] = useState("employee_code");
    const [sortDir, setSortDir] = useState("asc");

    // fetch
    useEffect(() => {
      const controller = new AbortController();

      setLoading(true);
      fetch(
        `${config.apiBaseURL}/leave/opening-monthly-all/${year}/?month=${month}`,
        { signal: controller.signal }
      )
        .then((r) => r.json())
        .then((json) => {
          const list = Array.isArray(json?.rows) ? json.rows : [];
          setRows(list);
        })
        .catch((e) => {
          if (e.name !== "AbortError") console.error("Ledger fetch error", e);
        })
        .finally(() => setLoading(false));
      return () => controller.abort();
    }, [year, month]);

    // sorting
    const onSort = (key) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortKey(key);
        setSortDir("asc");
      }
    };

    const sortedRows = useMemo(() => {
      const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
      const withKey = (r) => {
        switch (sortKey) {
          case "employee_name":
            return (r.employee_name || "").toLowerCase();
          case "status":
            return (r.status || r.employment_type || "").toLowerCase();
          case "doj":
            return r.doj || "";
          default:
            return (r.employee_code || "").toLowerCase();
        }
      };
      const sorted = [...rows].sort((a, b) => {
        const res = cmp(withKey(a), withKey(b));
        return sortDir === "asc" ? res : -res;
      });
      return sorted;
    }, [rows, sortKey, sortDir]);

    // expose Excel download
    useImperativeHandle(ref, () => ({
      downloadReport: async () => {
        if (!sortedRows.length) {
          showInfoToast("No data to export for this month.");
          return;
        }
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet("Monthly Leave Balance");

        // Row 1: title + month
        ws.mergeCells("A1", "N1");
        ws.getCell("A1").value = `Monthly Leave Balance — ${new Date(
          year,
          month - 1,
          1
        ).toLocaleString("en-GB", { month: "long", year: "numeric" })}`;
        ws.getCell("A1").font = { bold: true, size: 14 };
        ws.getCell("A1").alignment = {
          vertical: "middle",
          horizontal: "center",
        };

        // Header rows: group headers then subheaders
        // Row 2 (group labels)
        ws.addRow([
          "Emp Code",
          "Name",
          "Status",
          "Joining date",
          "Opening",
          "",
          "",
          "Availed",
          "",
          "",
          "Balance",
          "",
          "",
          "Date of Exit",
        ]);
        // merge group headers
        ws.mergeCells("E2", "G2");
        ws.mergeCells("H2", "J2");
        ws.mergeCells("K2", "M2");

        // Row 3 (sub headers)
        ws.addRow([
          "",
          "",
          "",
          "",
          "CL",
          "ML",
          "Comp OFF",
          "CL",
          "ML",
          "Comp OFF",
          "CL",
          "ML",
          "Comp OFF",
          "",
        ]);

        // Style headers
        [2, 3].forEach((r) => {
          ws.getRow(r).eachCell((c) => {
            c.font = { bold: true };
            c.alignment = { vertical: "middle", horizontal: "center" };
            c.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "D9D9D9" },
            };
            c.border = {
              top: { style: "thin" },
              bottom: { style: "thin" },
              left: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });

        // Data rows
        sortedRows.forEach((r) => {
          ws.addRow([
            r.employee_code || "",
            r.employee_name || "",
            r.employment_type || "",
            r.doj ? new Date(r.doj) : "",
            num(r.open_cl),
            num(r.open_ml),
            num(r.open_comp),
            num(r.availed_cl),
            num(r.availed_ml),
            num(r.availed_comp),
            num(r.bal_cl),
            num(r.bal_ml),
            num(r.bal_comp),
            r.resignation_date || "",
          ]);
        });

        // column widths + date format
        ws.columns = [
          { width: 12 },
          { width: 22 },
          { width: 12 },
          { width: 14, style: { numFmt: "dd/mm/yyyy" } },
          { width: 8 },
          { width: 8 },
          { width: 12 },
          { width: 8 },
          { width: 8 },
          { width: 12 },
          { width: 8 },
          { width: 8 },
          { width: 12 },
          { width: 14, style: { numFmt: "dd/mm/yyyy" } },
        ];

        const buf = await wb.xlsx.writeBuffer();
        const blob = new Blob([buf], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const fileName = `Monthly_Leave_Balance_${year}-${String(
          month
        ).padStart(2, "0")}.xlsx`;
        saveAs(blob, fileName);
      },
    }));

    return (
      <div style={{ overflowX: "auto" }}>
        {loading ? (
          <div style={{ padding: 16 }}>Loading…</div>
        ) : (
          <table className="employee-table">
            <thead>
              {/* Group header row */}
              <tr>
                <th
                  rowSpan={2}
                  onClick={() => onSort("employee_code")}
                  className="th-sortable"
                >
                  Emp Code
                </th>
                <th
                  rowSpan={2}
                  onClick={() => onSort("employee_name")}
                  className="th-sortable"
                >
                  Name
                </th>
                <th
                  rowSpan={2}
                  onClick={() => onSort("status")}
                  className="th-sortable"
                >
                  Status
                </th>
                <th
                  rowSpan={2}
                  onClick={() => onSort("doj")}
                  className="th-sortable"
                >
                  Joining date
                </th>
                <th colSpan={3} style={{ textAlign: "center" }}>
                  Opening
                </th>
                <th colSpan={3} style={{ textAlign: "center" }}>
                  Availed
                </th>
                <th colSpan={3} style={{ textAlign: "center" }}>
                  Balance
                </th>
                <th rowSpan={2}>Date of Exit</th>
              </tr>
              {/* Subheader row */}
              <tr>
                <th>CL</th>
                <th>ML</th>
                <th>Comp OFF</th>
                <th>CL</th>
                <th>ML</th>
                <th>Comp OFF</th>
                <th>CL</th>
                <th>ML</th>
                <th>Comp OFF</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: 16 }}>
                    No data.
                  </td>
                </tr>
              ) : (
                sortedRows.map((r, i) => (
                  <tr key={`${r.employee_id || r.employee_code || i}`}>
                    <td>{r.employee_code || "-"}</td>
                    <td>{r.employee_name || "-"}</td>
                    <td>{r.employment_type || "-"}</td>
                    <td>
                      {r.doj
                        ? new Date(r.doj).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td>{fmt(r.open_cl)}</td>
                    <td>{fmt(r.open_ml)}</td>
                    <td>{fmt(r.open_comp)}</td>
                    <td>{fmt(r.availed_cl)}</td>
                    <td>{fmt(r.availed_ml)}</td>
                    <td>{fmt(r.availed_comp)}</td>
                    <td>{fmt(r.bal_cl)}</td>
                    <td>{fmt(r.bal_ml)}</td>
                    <td>{fmt(r.bal_comp)}</td>
                    <td>
                      {r.resignation_date
                        ? new Date(r.resignation_date).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    );
  }
);

export default LeaveMonthlyLedger;
