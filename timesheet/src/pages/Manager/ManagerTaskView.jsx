import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ManagerTaskView = () => {
  const { user } = useAuth();
  const { task_assign_id } = useParams(); // from URL
  const [editMode, setEditMode] = useState(false); //  Add this at the top
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [buildingsAssign, setBuildingsAssign] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    project_title: "",
    project_type: "",
    start_date: "",
    estimated_hours: "",
    project_description: "",
    project_code: "",
    subdivision: "",
    discipline_code: "",
    discipline: "",
    area_of_work: [],
  });
  const [projectData, setProjectData] = useState({
    project_title: "",
    project_type: "",
    start_date: "",
    estimated_hours: "",
    project_description: "",
    project_code: "",
    subdivision: "",
    discipline_code: "",
    discipline: "",
    area_of_work: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };

  const handleAreaChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setFormData((prev) => ({ ...prev, area_of_work: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      area_of_work: formData.area_of_work.map(Number),
      created_by: user.employee_id,
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Project created successfully!");
        setFormData({ ...formData, project_title: "", project_code: "" });
      } else {
        console.error(data);
        alert(" Failed to create project");
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  const location = useLocation();
  const isManagerPage = location.pathname.startsWith("/manager");


  useEffect(() => {
    fetchTeamleadManager();
    fetchAreas();
    fetchTasks();
    fetchTaskAssignment();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/area-of-work/`);
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      console.error("Error fetching Area of work:", error);
    }
  };

  const fetchTeamleadManager = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/teamlead-and-managers/`
      );
      const data = await response.json();
      setTeamleadManager(data);
      console.log("Team leads and managers", data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/tasks/`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const fetchTaskAssignment = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/tasks-building/${task_assign_id}/`
      );
      const data = await response.json();
      setTaskData(data);
      setAvailableEmployees(data.employee);
      console.log("Task Assignment:", data);
    } catch (error) {
      console.error("Error fetching task assignment:", error);
    }
  };

  // if (
  //   !taskData ||
  //   !taskData.building_assign ||
  //   !taskData.building_assign.project_assign
  // ) {
  //   return <p>Loading...</p>;
  // }

  const project = taskData?.building_assign?.project_assign?.project;
  const building = taskData?.building_assign?.building;
  const task = taskData?.task;

  return (
    <div className="create-project-container">
      <div className="project-header">
        <h2>Task Details </h2>
        {editMode ? (
          <div></div>
          ) : (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="btn-orange edit-btn"
              >
                <FaEdit className="edit-icon" />
              </button>
          )}

      </div>
      <form onSubmit={handleSubmit}>
        <div className="input-elements">
          <div className="left-form">
            <div className="left-form-first">
              <div className="project-form-group">
                <label>Project Code</label>
                <p>{project?.project_code || ""}</p>
              </div>
              <div className="project-form-group">
                <label>Project Title</label>
                <p>{project?.project_title || ""}</p>
              </div>
              <div className="project-form-group">
                <label>Building Code</label>
                <p>{building?.building_code || ""}</p>
              </div>
              <div className="project-form-group">
                <label>Building Title</label>
                <p>{building?.building_title || ""}</p>
              </div>
              <div className="project-form-group">
                <label>Task Code</label>
                <p>{task?.task_code || "N/A"}</p>
              </div>
              <div className="project-form-group">
                <label>Task Title</label>
                <p>{task?.task_title || "N/A"}</p>
              </div>
            </div>
            <div className="left-form-second">
              <div className="project-form-group">
                <label className="taskdescription">Task Description</label>
                <p>{task?.task_description || "N/A"}</p>
              </div>
              <div className="roles-box">
                <label className="taskroles">Task Roles</label>
                {editMode ? (
                  <div className="select-container">
                    {teamleadManager?.map((emp) => (
                      <div key={emp.employee_id}>
                        <input
                          type="checkbox"
                          value={emp.employee_id}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              setSelectedEmployees((prev) => [
                                ...prev,
                                emp.employee_id,
                              ]);
                            } else {
                              setSelectedEmployees((prev) =>
                                prev.filter((id) => id !== emp.employee_id)
                              );
                            }
                          }}
                        />
                        {emp.employee_name} - {emp.designation}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="select-container">
                    {availableEmployees?.map((emp) => (
                      <p key={emp.employee_id}>
                        {emp.employee_name} - {emp.designation}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="project-form-group">
                <label className="attaches">Attachments</label>
                {task?.attachments ? (
                  <a
                    href={task.attachments}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-attachment-link"
                  ><img
                    src="/src/assets/pin svg.svg" // replace this with your actual image path
                    alt="Attachment"
                    style={{ width: "16px", height: "16px", marginRight: "5px", verticalAlign: "middle" }}
                  />
                   View Attachment
                  </a>
                ) : (
                  <p>No attachments</p>
                )}
              </div>
            </div>
          </div>
          <div className="right-form">
            <div className="right-form-building-first">
              <div className="project-form-group-small">
                <label>Start Date</label>
                <p>{taskData?.start_date || ""}</p>
              </div>
              <div className="project-form-group-small">
                <label>End Date</label>
                <p>{taskData?.end_date || ""}</p>
              </div>
              <div className="project-form-group-small">
                <label>Project Hours</label>
                <p>{project?.estimated_hours || ""}</p>
              </div>
              <div className="project-form-group-small">
                <label>Building Hours</label>
                <p>{taskData?.building_assign?.building_hours || ""}</p>
              </div>
              <div className="project-form-group-small">
                <label>Task Hours</label>
                {editMode ? (
                  <input
                    name="task_hours"
                    value={formData.task_hours}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{taskData?.task_hours || ""}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {editMode ? (
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              Save
            </button>
            <button type="reset"  onClick={() => setEditMode(false)} className="btn-cancel">
              Cancel
            </button>
          </div>
        ) : (
          <div></div>
        )}
      </form>
    </div>
  );
};

export default ManagerTaskView;
