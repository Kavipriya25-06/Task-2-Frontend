import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";

const ManagerBuildingView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false); //  Add this at the top
  const { building_assign_id } = useParams(); // from URL
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [availableTeamleadManager, setAvailableTeamleadManager] = useState([]);
  const [buildingsAssign, setBuildingsAssign] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
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

  useEffect(() => {
    fetchTeamleadManager();
    fetchAreas();
    fetchTasks();
    fetchBuildingsAssign();
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

  const fetchBuildingsAssign = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/buildings-screen/${building_assign_id}/`
      );
      const data = await response.json();
      setBuildingsAssign(data);
      console.log("Buildings", data);
      console.log("Projects", data.project_assign);
    } catch (error) {
      console.error("Error fetching Buildings:", error);
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

  if (!buildingsAssign || !buildingsAssign.project_assign) {
    return <p>Loading...</p>;
  }

  const { project } = buildingsAssign.project_assign;

  return (
    <div className="create-project-container">
      <h2>Building {buildingsAssign.building?.building_title}</h2>
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
                <p>{buildingsAssign.building?.building_code}</p>
              </div>
              <div className="project-form-group">
                <label>Building Title</label>
                <p>{buildingsAssign.building?.building_title}</p>
              </div>
            </div>
            <div className="left-form-second">
              <div className="project-form-group">
                <label>Building Desciption</label>
                <p>{buildingsAssign.building?.building_description}</p>
              </div>
              <div className="project-form-group">
                <label>Assign Task</label>
                {editMode ? (
                  <div className="select-container">
                    {tasks.map((task) => (
                      <div key={task.task_id}>
                        <input
                          type="checkbox"
                          value={task.task_id}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              setSelectedTasks((prev) => [
                                ...prev,
                                task.task_id,
                              ]);
                            } else {
                              setSelectedTasks((prev) =>
                                prev.filter((id) => id !== task.task_id)
                              );
                            }
                          }}
                        />
                        {task.task_title}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>{buildingsAssign.task || ""}</p>
                )}
              </div>
            </div>
          </div>
          <div className="right-form">
            <div className="right-form-building-first">
              <div className="project-form-group-small">
                <label>Start Date</label>
                <p>{project?.start_date || ""}</p>
              </div>
              <div className="project-form-group-small">
                <label>Project Hours</label>
                <p>{project?.estimated_hours || ""}</p>
              </div>
              <div className="project-form-group-small">
                <label>Building Hours</label>
                {editMode ? (
                  <input
                    name="estimated_hours"
                    value={formData.building_hours}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{buildingsAssign.building_hours || ""}</p>
                )}
              </div>
            </div>
            <div className="right-form-second">
              <div className="roles-box">
                <label>Building Roles</label>
                {editMode ? (
                  <div className="select-container">
                    {teamleadManager.map((employee) => (
                      <div
                        key={employee.employee_id}
                        className="employee-checkbox"
                      >
                        {employee.employee_name} - {employee.designation}
                        <input
                          type="checkbox"
                          value={employee.employee_id}
                          checked={availableTeamleadManager.some(
                            (e) => e.employee_id === employee.employee_id
                          )}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              setAvailableTeamleadManager((prev) => [
                                ...prev,
                                employee,
                              ]);
                            } else {
                              setAvailableTeamleadManager((prev) =>
                                prev.filter(
                                  (emp) =>
                                    emp.employee_id !== employee.employee_id
                                )
                              );
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="select-container">
                    {availableTeamleadManager.map((emp) => (
                      <p key={emp.employee_id}>
                        {emp.employee_name} - {emp.designation}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-green">
            Save
          </button>
          <button type="reset" className="btn-red">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerBuildingView;
