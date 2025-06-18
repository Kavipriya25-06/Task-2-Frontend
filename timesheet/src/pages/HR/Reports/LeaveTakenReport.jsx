import React, { useEffect, useState } from "react";
import config from "../../../config";
import { ToastContainerComponent } from "../../../constants/Toastify";

const LeaveTakenReport = ({year}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/yearly-leaves/?year=${year}`)
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error("Leave fetch error:", err);
        setLoading(false);
      });
  }, [year]);

  return (
    <div className="employee-table-wrapper">
      <div className="table-wrapper" style={{ maxHeight: 400, overflowY: 'auto' }}>
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
                  <td>{new Date(l.start_date).toLocaleDateString('en-GB')}</td>
                  <td>{new Date(l.end_date).toLocaleDateString('en-GB')}</td>
                  <td>{parseFloat(l.duration)}</td>
                  <td>{l.leave_type.replace('_', ' ')}</td>
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

export default LeaveTakenReport;
