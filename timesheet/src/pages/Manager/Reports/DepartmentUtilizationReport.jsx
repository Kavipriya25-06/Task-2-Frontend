import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import config from "../../../config";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../../constants/Toastify";

const DepartmentUtilizationReport = forwardRef(({ year, department }, ref) => {
  const [projectData, setProjectData] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/department-project-hours/${department}/`)
      .then((res) => res.json())
      .then((data) => {
        setProjectData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Project hours fetch error:", err);
        setLoading(false);
      });
  }, [department]);

  useEffect(() => {
    fetch(`${config.apiBaseURL}/weekly-employees/${department}/?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.weekly_stats)) {
          setWeeklyStats(data.weekly_stats); //  assign only the array part
        } else {
          console.warn("weekly_stats not found or invalid format:", data);
          setWeeklyStats([]); // fallback to empty array
        }
      })
      .catch((err) => {
        console.error("Weekly employees fetch error:", err);
        setWeeklyStats([]);
      });
  }, [department, year]);

  const getMetric = (week, projectCode) => {
    const project = projectData.find((p) => p.project_code === projectCode);
    if (!project || !project.task_consumed_hours_by_week) return 0;
    const entry = project.task_consumed_hours_by_week.find(
      (w) => w.week === week
    );
    return entry ? entry.hours : 0;
  };

  const weeksSorted = Array.isArray(weeklyStats)
    ? [...new Set(weeklyStats.map((w) => w.week))].sort()
    : [];

  const metricMap = {
    "Idle Hours": "idle",
    Training: "training",
    Standardization: "standardisation",
    Holiday: "holiday",
    "IT Failure": "it_failure",
    Permission: "permission",
    Leave: "leave",
  };

  const getSpecialMetric = (week, projectCode) => {
    const project = projectData.find((p) => p.project_code === projectCode);
    if (!project || !project.task_consumed_hours_by_week) return 0;
    const entry = project.task_consumed_hours_by_week.find(
      (w) => w.week === week
    );
    return entry ? entry.hours : 0;
  };

  const renderTableRows = () => {
    return weeksSorted.map((weekStr, idx) => {
      const weekObj = weeklyStats.find((w) => w.week === weekStr);
      const employees = weekObj ? weekObj.active_employees : 0;
      const days = weekObj ? weekObj.working_days : 0;
      const available = employees * days * 8;
      let totalBooked = 0;
      let projectHours = 0;

      const leave =
        getSpecialMetric(weekStr, "99002") +
        getSpecialMetric(weekStr, "99003") +
        getSpecialMetric(weekStr, "99004") +
        getSpecialMetric(weekStr, "99004a") +
        getSpecialMetric(weekStr, "99005") +
        getSpecialMetric(weekStr, "99006");

      const idle = getSpecialMetric(weekStr, "99000");
      const training = getSpecialMetric(weekStr, "99001");
      const std = getSpecialMetric(weekStr, "2001000");
      const holiday = getSpecialMetric(weekStr, "99009");
      const itFail =
        getSpecialMetric(weekStr, "99007") + getSpecialMetric(weekStr, "99008");

      projectData.forEach((project) => {
        if (
          project.discipline_code !== "0" &&
          project.discipline_code !== "1" &&
          project.discipline_code !== "99"
        ) {
          const val = getMetric(weekStr, project.project_code);
          projectHours += val;
          totalBooked += val;
        }
      });

      totalBooked += idle + training + std + leave + holiday + itFail;
      const utilizationRatio =
        available > 0
          ? ((projectHours / (available - leave - holiday)) * 100).toFixed(2)
          : 0;

      return (
        <tr key={idx}>
          <td>{idx + 1}</td>
          <td>{weekStr.split("-")[0]}</td>
          <td>{weekStr.split("-")[1]}</td>
          <td>{employees}</td>
          <td>{days}</td>
          <td>{available}</td>
          {/* <td>{totalBooked}</td> */}
          <td>{projectHours}</td>
          <td>{utilizationRatio}%</td>
          <td>{std}</td>
          <td>{idle}</td>
          <td>{training}</td>
          <td>{leave}</td>
          <td>{holiday}</td>
          <td>{itFail}</td>
        </tr>
      );
    });
  };

  useImperativeHandle(ref, () => ({
    downloadReport: async () => {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Department Utilization");

      // Title Row
      sheet.mergeCells("A1", "N1");
      const titleCell = sheet.getCell("A1");
      titleCell.value = `Project Utilization Ratio - ${department}`;
      titleCell.font = { size: 18, bold: true };
      titleCell.alignment = { horizontal: "center", vertical: "middle" };
      titleCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "D3D3D3" },
      };
      titleCell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      // Header Row
      const headerRow = sheet.addRow([
        "S.No",
        "Year",
        "Week",
        "No. of Employees",
        "Working Days",
        "Available Hours",
        "Project Hours",
        "Utilization Ratio",
        "Standardisation",
        "Idle Hours",
        "Training",
        "Leave / Permission",
        "Holiday",
        "IT / Power Failure",
      ]);

      headerRow.font = { bold: true, color: { argb: "FF000000" } };

      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D3D3D3" },
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
      });

      headerRow.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };

      // Column widths
      const widths = [6, 8, 8, 14, 14, 14, 14, 16, 16, 12, 10, 18, 10, 16];
      widths.forEach((w, i) => {
        sheet.getColumn(i + 1).width = w;
      });

      weeksSorted.forEach((weekStr, idx) => {
        const weekObj = weeklyStats.find((w) => w.week === weekStr);
        const employees = weekObj?.active_employees || 0;
        const days = weekObj?.working_days || 0;
        const available = employees * days * 8;

        const leave =
          getSpecialMetric(weekStr, "99002") +
          getSpecialMetric(weekStr, "99003") +
          getSpecialMetric(weekStr, "99004") +
          getSpecialMetric(weekStr, "99004a") +
          getSpecialMetric(weekStr, "99005") +
          getSpecialMetric(weekStr, "99006");
        const idle = getSpecialMetric(weekStr, "99000");
        const training = getSpecialMetric(weekStr, "99001");
        const std = getSpecialMetric(weekStr, "2001000");
        const holiday = getSpecialMetric(weekStr, "99009");
        const itFail =
          getSpecialMetric(weekStr, "99007") +
          getSpecialMetric(weekStr, "99008");

        let projectHours = 0;
        projectData.forEach((project) => {
          if (!["0", "1", "99"].includes(project.discipline_code)) {
            projectHours += getMetric(weekStr, project.project_code);
          }
        });

        const utilizationRatio =
          available > 0
            ? ((projectHours / (available - leave - holiday)) * 100).toFixed(2)
            : 0;

        const row = sheet.addRow([
          idx + 1,
          year,
          weekStr.split("-")[1],
          employees,
          days,
          available,
          projectHours,
          parseFloat(utilizationRatio) / 100,
          std,
          idle,
          training,
          leave,
          holiday,
          itFail,
        ]);

        row.getCell(8).numFmt = "0.00%";
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { horizontal: "center", vertical: "middle" };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `Utilization_${department}_${year}.xlsx`);
      showInfoToast("Excel exported successfully!");
    },
  }));

  return (
    <div className="employee-table-wrapper">
      <div className="table-wrapper">
        <table className="employee-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Year</th>
              <th>Week</th>
              <th>No. of Employees</th>
              <th>No. of Working Days</th>
              <th>Available Hours</th>
              {/* <th>Booked Hours</th> */}
              <th>Project Hours</th>
              <th>Utilization Ratio</th>
              <th>Standardisation</th>
              <th>Idle Hours</th>
              <th>Training</th>
              <th>Leave / Permission</th>
              <th>Holiday</th>
              <th>IT / Power Failure</th>
            </tr>
          </thead>
          <tbody>{!loading && renderTableRows()}</tbody>
        </table>
      </div>
      <ToastContainerComponent />
    </div>
  );
});

export default DepartmentUtilizationReport;
