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

const LeaveBalanceReport = forwardRef(({ year }, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/leaves-available-report/`)
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

  useImperativeHandle(ref, () => ({
    downloadReport: () => {
      const filtered = data.filter(
        (l) => new Date(l.employee.doj).getFullYear() === parseInt(year)
      );

      if (filtered.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      const exportData = filtered.map((l) => ({
        "Employee Code": l.employee?.employee_code || "",
        "Employee Name": l.employee?.employee_name || "",
        DOJ: l.employee?.doj
          ? new Date(l.employee.doj).toLocaleDateString("en-GB")
          : "",
        "Present Status": l.employee?.status || "",
        CL: parseFloat(l.casual_leave || 0),
        SL: parseFloat(l.sick_leave || 0),
        EL: parseFloat(l.earned_leave || 0),
        "Comp-off": parseFloat(l.comp_off || 0),
        LOP: 0,
        "Total Leaves Available":
          parseFloat(l.casual_leave || 0) +
          parseFloat(l.sick_leave || 0) +
          parseFloat(l.earned_leave || 0) +
          parseFloat(l.comp_off || 0),
      }));

      try {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Balance");

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const blob = new Blob([excelBuffer], {
          type: "application/octet-stream",
        });

        const currentDate = new Date().toISOString().split("T")[0];
        saveAs(blob, `LeaveBalanceReport_${currentDate}.xlsx`);
      } catch (error) {
        console.error("Excel export error:", error);
        showInfoToast("Error generating Excel file.");
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
                <th>CL</th>
                <th>SL</th>
                <th>EL</th>
                <th>Comp-off</th>
                <th>LOP</th>
                <th>Total Leaves Available</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter(
                  (l) =>
                    new Date(l.employee.doj).getFullYear() === parseInt(year)
                )
                .map((l, i) => (
                  <tr key={i}>
                    <td>{l.employee.employee_code}</td>
                    <td>{l.employee.employee_name}</td>
                    <td>
                      {new Date(l.employee.doj).toLocaleDateString("en-GB")}
                    </td>
                    <td>{l.employee.status}</td>
                    <td>{parseFloat(l.casual_leave)}</td>
                    <td>{parseFloat(l.sick_leave)}</td>
                    <td>{parseFloat(l.earned_leave)}</td>
                    <td>{parseFloat(l.comp_off)}</td>
                    <td>0</td>
                    <td>
                      {Math.max(
                        0,
                        parseFloat(l.casual_leave || 0) +
                          parseFloat(l.sick_leave || 0) +
                          parseFloat(l.earned_leave || 0) +
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
