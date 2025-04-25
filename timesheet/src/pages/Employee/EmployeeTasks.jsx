import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/tasks-building/");
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

  const handleTaskClick = (task) => {
    navigate("detail", { state: { task } });
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p>Error loading tasks: {error}</p>;

  return (
    <div className="employee-tasks-wrapper">
      <div className="task-list">
        <h3>Employee Tasks</h3>
        <table className="employee-tasks-table">
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
              <tr key={index} onClick={() => handleTaskClick(task)}>
                <td>{task.task?.task_title || "N/A"}</td>
                <td>{task.task_hours || "N/A"}</td>
                <td>{task.building?.building_code || "N/A"}</td>
                <td>{task.project?.project_name || "N/A"}</td>
                <td>{task.start_date || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTasks;
