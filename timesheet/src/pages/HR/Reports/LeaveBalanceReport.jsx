import React, { useEffect, useState } from "react";
import config from "../../../config";
import { ToastContainerComponent } from "../../../constants/Toastify";

const LeaveBalanceReport = ({ year }) => {
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
    .filter((l) => new Date(l.employee.doj).getFullYear() === parseInt(year))
    .map((l, i) => (
      <tr key={i}>
        <td>{l.employee.employee_code}</td>
        <td>{l.employee.employee_name}</td>
        <td>{new Date(l.employee.doj).toLocaleDateString("en-GB")}</td>
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
};

export default LeaveBalanceReport;
