import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../../config";
import { FaEdit } from "react-icons/fa";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../../constants/Toastify";

const ProjectSummaryReport = ({year}) => {
  //new onee
  const [selectedReport, setSelectedReport] = useState("Project Summary Report");
  const [projectData, setProjectData] = useState([]);

  useEffect(() => {
    if (selectedReport === "Project Summary Report") {
      fetch(`${config.apiBaseURL}/projects/`)
        .then((res) => res.json())
        .then((data) => {
          setProjectData(data);
        })
        .catch((err) => console.error("Error fetching project data:", err));
    }
  }, [selectedReport]);

  return (
    <div className="employee-table-wrapper">
      <div
        className="table-wrapper"
        style={{ maxHeight: "400px" }}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (
            scrollTop + clientHeight >= scrollHeight - 10 &&
            !isLoadingMoreEmployees &&
            hasMoreEmployees
          ) {
            setIsLoadingMoreEmployees(true);
            setTimeout(() => {
              const nextVisible = visibleEmployees + 10;
              if (nextVisible >= filteredEmployees.length) {
                setVisibleEmployees(filteredEmployees.length);
                setHasMoreEmployees(false);
              } else {
                setVisibleEmployees(nextVisible);
              }
              setIsLoadingMoreEmployees(false);
            }, 1000); // Simulate 2 seconds loading
          }
        }}
      >
    {selectedReport === "Project Summary Report" && (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Project Code</th>
                <th>Project Name</th>
                <th>Allocated Hours</th>
                <th>Consumed</th>
                <th>Utilization Ratio</th>
              </tr>
            </thead>
           <tbody>
            {projectData.map((project) => {
              const allocated = parseFloat(project.total_hours || 0);
              const consumed = parseFloat(project.consumed_hours || 0);
            const ratio = allocated > 0 ? ((consumed / allocated) * 100).toFixed(0) + "%" : "0%";

              return (
                <tr key={project.project_id}>
                  <td>{project.project_code}</td>
                  <td title={project.project_title}>{project.project_title}</td>
                  <td>{allocated.toFixed(2)}</td>
                  <td>{consumed.toFixed(2)}</td>
                  <td>{ratio}</td>
                </tr>
              );
            })}
          </tbody>
          </table>
        )}



        {/* {isLoadingMoreEmployees && (
          <div className="loading-message">Loading...</div>
        )}
        {!hasMoreEmployees && <div className="no-message">No more data</div>} */}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ProjectSummaryReport;
