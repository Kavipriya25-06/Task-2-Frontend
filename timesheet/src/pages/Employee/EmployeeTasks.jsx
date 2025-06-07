import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { useAuth } from "../../AuthContext";

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseURL}/tasks-by-employee/${user.employee_id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Tasks:", data); // Debugging line
        setTasks(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskClick = (task_assign_id) => {
    navigate(`/employee/detail/tasks/${task_assign_id}`);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) return <p className="loading">Loading tasks...</p>;
  if (error) return <p className="error">Error loading tasks: {error}</p>;

  return (
    <div className="employee-tasks-wrapper">
      <div className="task-list">
        <h3>Employee Tasks</h3>
        <table className="employee-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Hours</th>
              <th>Building</th>
              <th>Project</th>
              <th>Start Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={task.task_assign_id}>
                <td
                  key={index}
                  onClick={() => handleTaskClick(task.task_assign_id)}
                  style={{
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {task?.task?.task_title || "N/A"}
                </td>
                <td>{task?.task_hours || "N/A"}</td>
                <td>
                  {task?.building_assign?.building
                    ? `${task.building_assign.building?.building_id} - ${task.building_assign.building?.building_title}`
                    : "N/A"}
                </td>
                <td>
                  {task?.building_assign?.project_assign?.project
                    ? `${task.building_assign.project_assign.project?.project_id} - ${task.building_assign.project_assign.project?.project_title}`
                    : "N/A"}
                </td>
                <td>{formatDate(task?.start_date || "")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTasks;
