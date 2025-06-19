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

const LeaveTakenReport = forwardRef(({ year }, ref) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/yearly-leaves/?year=${year}`)
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
      if (data.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      const exportData = data.map((leave) => ({
        "Employee Code": leave?.employee?.employee_code || "",
        "Employee Name": leave?.employee?.employee_name || "",
        "Start Date": leave?.start_date
          ? new Date(leave.start_date).toLocaleDateString("en-GB")
          : "",
        "End Date": leave?.end_date
          ? new Date(leave.end_date).toLocaleDateString("en-GB")
          : "",
        "No. of Days": isNaN(parseFloat(leave?.duration))
          ? ""
          : parseFloat(leave.duration),
        "Leave Type": leave?.leave_type
          ? leave.leave_type.replace("_", " ")
          : "",
      }));

      try {
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Report");

        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });

        const blob = new Blob([excelBuffer], {
          type: "application/octet-stream",
        });

        const currentDate = new Date().toISOString().split("T")[0];
        saveAs(blob, `LeaveReport_${currentDate}.xlsx`);
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
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>No.of Days</th>
                <th>Leave Type</th>
              </tr>
            </thead>
            <tbody>
              {data.map((l, i) => (
                <tr key={i}>
                  <td>{l.employee.employee_code}</td>
                  <td>{l.employee.employee_name}</td>
                  <td>{new Date(l.start_date).toLocaleDateString("en-GB")}</td>
                  <td>{new Date(l.end_date).toLocaleDateString("en-GB")}</td>
                  <td>{parseFloat(l.duration)}</td>
                  <td>{l.leave_type.replace("_", " ")}</td>
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

export default LeaveTakenReport;
