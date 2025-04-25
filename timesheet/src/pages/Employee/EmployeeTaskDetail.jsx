import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EmployeeTaskDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.task) {
    return <div>No task selected.</div>;
  }

  const task = state.task;

  return (
    <div className="task-detail-view">
      <button onClick={() => navigate(-1)}>Back</button>
      <h3>Project Title: <span>{task.project?.project_name || "N/A"}</span></h3>
      <p>Project Type: <span>{task.project?.project_type || "N/A"}</span></p>
      <p>Start Date: <input type="text" value={task.start_date || "N/A"} readOnly /></p>
      <p>Estimated Hours: <input type="text" value={task.project?.estimated_hours || "N/A"} readOnly /></p>
      <p>Total Hours: <input type="text" value={task.project?.total_hours || "N/A"} readOnly /></p>
      <p>Task Title: <span>{task.task?.task_title || "N/A"}</span></p>
      <p>Task Description: <span>{task.task?.task_description || "N/A"}</span></p>
      <p>Task Priority: <span>{task.task?.priority || "N/A"}</span></p>
      <p>Building Code: <span>{task.building?.building_code || "N/A"}</span></p>
    </div>
  );
};

export default EmployeeTaskDetail;
