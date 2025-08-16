// src\pages\HR\Reports\LeaveTakenReport.jsx

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

const LeaveTakenReport = forwardRef(({ year, employeeSearch }, ref) => {
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
    downloadReport: async () => {
      if (data.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Leave Report");

        // Add headers with S.No
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

        // Add data rows with S.No
        data.forEach((leave, index) => {
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

        // Style header row
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D3D3D3" }, // Light gray
          };
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Set column widths and formatting
        worksheet.columns = [
          { key: "sno", width: 8 },
          { key: "empCode", width: 18 },
          { key: "empName", width: 25 },
          { key: "startDate", width: 15, style: { numFmt: "dd/mm/yyyy" } },
          { key: "endDate", width: 15, style: { numFmt: "dd/mm/yyyy" } },
          { key: "days", width: 15, style: { numFmt: "0.00" } },
          { key: "leaveType", width: 20 },
        ];

        // Generate Excel file and save
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
              {data
                .filter((l) => {
                  const search = employeeSearch.toLowerCase();
                  const name = l.employee?.employee_name?.toLowerCase() || "";
                  const code = l.employee?.employee_code?.toLowerCase() || "";

                  return name.includes(search) || code.includes(search);
                })
                .map((l, i) => (
                  <tr key={i}>
                    <td>{l.employee.employee_code}</td>
                    <td>{l.employee.employee_name}</td>
                    <td>
                      {new Date(l.start_date).toLocaleDateString("en-GB")}
                    </td>
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
