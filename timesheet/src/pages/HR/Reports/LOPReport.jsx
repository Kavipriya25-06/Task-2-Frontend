import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import config from "../../../config";
import { ToastContainerComponent } from "../../../constants/Toastify";

const LOPReport = forwardRef(({ year }, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/employee-lop/?year=${year}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leave fetch error:", err);
        setLoading(false);
      });
  }, [year]);

  const getMonthsForYear = (year) => {
    const formatter = new Intl.DateTimeFormat("en-GB", { month: "short" });
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(year, i); // Jan = 0
      return {
        label: `${formatter.format(date)} ${year}`, // e.g., Jan 2025
        key: `${year}-${String(i + 1).padStart(2, "0")}`, // e.g., 2025-01
      };
    });
  };

  const months = getMonthsForYear(year);

  useImperativeHandle(ref, () => ({
    downloadReport: async () => {
      if (data.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Monthly LOP");

        // Header row with S.No and dynamic month columns
        const headers = [
          "S.No",
          "Employee Code",
          "Employee Name",
          "DOJ",
          "Present Status",
          "Resigned",
          ...months.map((m) => m.label),
        ];
        worksheet.addRow(headers);

        // Add data rows
        data.forEach((l, index) => {
          const lopMap = {};
          l.lop_by_month?.forEach((entry) => {
            lopMap[entry.month] = entry.days;
          });

          worksheet.addRow([
            index + 1,
            l.employee_code || "",
            l.employee_name || "",
            l.doj ? new Date(l.doj) : "",
            l.status || "",
            l.resignation_date ? new Date(l.resignation_date) : "",
            ...months.map((m) => lopMap[m.key] ?? 0),
          ]);
        });

        // Style header
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
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

        // Set column widths and formats
        const baseWidths = [8, 18, 22, 15, 18, 15];
        worksheet.columns = [
          ...baseWidths.map((width, idx) => ({
            width,
            style: idx === 3 || idx === 5 ? { numFmt: "dd/mm/yyyy" } : {},
          })),
          ...months.map(() => ({ width: 10 })),
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const dateStr = new Date().toISOString().split("T")[0];
        saveAs(blob, `LOP_Report_${dateStr}.xlsx`);
      } catch (error) {
        console.error("Excel export error:", error);
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
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>DOJ</th>
                <th>Present Status</th>
                <th>Resigned</th>
                {months.map((m) => (
                  <th key={m.key}>{m.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((l, i) => {
                const lopMap = {};
                l.lop_by_month?.forEach((entry) => {
                  lopMap[entry.month] = entry.days;
                });

                return (
                  <tr key={i}>
                    <td>{l.employee_code}</td>
                    <td>{l.employee_name}</td>
                    <td>{new Date(l.doj).toLocaleDateString("en-GB")}</td>
                    <td>{l.status}</td>
                    <td>
                      {l.resignation_date
                        ? new Date(l.resignation_date).toLocaleDateString(
                            "en-GB"
                          )
                        : "-"}
                    </td>
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
