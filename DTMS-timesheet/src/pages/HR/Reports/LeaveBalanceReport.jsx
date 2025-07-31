// src\pages\HR\Reports\LeaveBalanceReport.jsx

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
  }, []);

  useImperativeHandle(ref, () => ({
    downloadReport: async () => {
      const filtered = data;
      //   .filter(
      //   (l) => new Date(l.employee.doj).getFullYear() === parseInt(year)
      // );

      if (filtered.length === 0) {
        showInfoToast("No data to export.");
        return;
      }

      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Leave Balance");

        // Add header row with S.No
        const headers = [
          "S.No",
          "Employee Code",
          "Employee Name",
          "DOJ",
          "Present Status",
          "CL",
          "SL",
          "EL",
          "Comp-off",
          "LOP",
          "Total Leaves Available",
        ];
        worksheet.addRow(headers);

        // Add data rows
        filtered.forEach((l, index) => {
          const cl = parseFloat(l.casual_leave || 0);
          const sl = parseFloat(l.sick_leave || 0);
          const el = parseFloat(l.earned_leave || 0);
          const comp = parseFloat(l.comp_off || 0);
          const totalLeaves = cl + sl + el + comp;

          worksheet.addRow([
            index + 1,
            l.employee?.employee_code || "",
            l.employee?.employee_name || "",
            l.employee?.doj ? new Date(l.employee.doj) : "",
            l.employee?.status || "",
            cl,
            sl,
            el,
            comp,
            0, // LOP
            totalLeaves,
          ]);
        });

        // Style header row
        worksheet.getRow(1).eachCell((cell) => {
          cell.font = { bold: true };
          cell.alignment = { vertical: "middle", horizontal: "center" };
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D3D3D3" }, // Light gray background
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
          { width: 8 },
          { width: 18 },
          { width: 22 },
          { width: 15, style: { numFmt: "dd/mm/yyyy" } },
          { width: 18 },
          { width: 10, style: { numFmt: "0.00" } },
          { width: 10, style: { numFmt: "0.00" } },
          { width: 10, style: { numFmt: "0.00" } },
          { width: 12, style: { numFmt: "0.00" } },
          { width: 10, style: { numFmt: "0.00" } },
          { width: 20, style: { numFmt: "0.00" } },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
          <div style={{ padding: 20 }}>No leave records found.</div>
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
                // .filter(
                //   (l) =>
                //     new Date(l.employee.doj).getFullYear() === parseInt(year)
                // )
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
