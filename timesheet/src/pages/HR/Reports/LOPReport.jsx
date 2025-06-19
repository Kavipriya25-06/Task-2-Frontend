import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as XLSX from "xlsx";
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
    downloadReport: () => {
      if (data.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      const exportData = data.map((l) => {
        const row = {
          "Employee Code": l.employee_code,
          "Employee Name": l.employee_name,
          DOJ: l.doj ? new Date(l.doj).toLocaleDateString("en-GB") : "-",
          "Present Status": l.status,
          Resigned: l.resignation_date
            ? new Date(l.resignation_date).toLocaleDateString("en-GB")
            : "-",
        };

        // Fill monthly LOP values
        const lopMap = {};
        l.lop_by_month?.forEach((entry) => {
          lopMap[entry.month] = entry.days;
        });

        months.forEach((m) => {
          row[m.label] = lopMap[m.key] ?? 0;
        });

        return row;
      });

      try {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly LOP");

        const buffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const blob = new Blob([buffer], {
          type: "application/octet-stream",
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
