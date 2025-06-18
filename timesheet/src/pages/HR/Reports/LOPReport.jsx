import React, { useEffect, useState } from "react";
import config from "../../../config";
import { ToastContainerComponent } from "../../../constants/Toastify";

const LOPReport = ({ year }) => {
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
};

export default LOPReport;
