// src\pages\Manager\ManagerProjects.jsx

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const ManagerProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [filteredTask, setFilteredTask] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchBuild, setSearchBuild] = useState("");
  const [searchTask, setSearchTask] = useState("");

  

  const tabLabels = ["Projects", "Buildings", "Tasks"];

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/project-creator/${user.employee_id}/`
      );
      const data = await response.json();
      setProjects(data);
      setFilteredProjects(data);
    } catch (err) {
      console.log("Unable to fetch projects", err);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/buildings/`);
      const data = await response.json();
      setBuildings(data);
      setFilteredBuildings(data);
    } catch (err) {
      console.log("Unable to fetch buildings", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/tasks/`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.log("Unable to fetch tasks", err);
    }
  };

  const handleAddClick = () => {
    navigate(`create`);
  };

  const handleAddBuildingClick = () => {
    navigate(`/manager/detail/buildings/create`);
  };

  const handleAddTaskClick = () => {
    navigate(`/manager/detail/tasks/create`);
  };

  const handleProjectClick = (project_id) => {
    navigate(`${project_id}`);
  };

  useEffect(() => {
    fetchProjects();
    fetchBuildings();
    fetchTasks();
  }, []);

    useEffect(() => {
      const lowerSearch = searchText.toLowerCase();
      const filtered = projects.filter((u) => {
        const code = u.project_code?.toLowerCase() || "";
        const name = u.project_title?.toLowerCase() || "";
        const discipline = u.discipline?.toLowerCase() || "";
        return (
          code.includes(lowerSearch) ||
          name.includes(lowerSearch) ||
          discipline.includes(lowerSearch)
        );
      });
      setFilteredProjects(filtered);
    }, [searchText, projects]);


      useEffect(() => {
      const lowerSearch = searchBuild.toLowerCase();
      const filtered = buildings.filter((u) => {
        const bcode = u.building_code?.toLowerCase() || "";
        const bname = u.building_title?.toLowerCase() || "";
        return (
          bcode.includes(lowerSearch) ||
          bname.includes(lowerSearch)
        );
      });
      setFilteredBuildings(filtered);
    }, [searchBuild, buildings]);


    useEffect(() => {
      const lowerSearch = searchTask.toLowerCase();
      const filtered = tasks.filter((u) => {
        const tcode = u.task_code?.toLowerCase() || "";
        const tname = u.task_title?.toLowerCase() || "";
        const priority = u.priority?.toLowerCase() || "";
        return (
          tcode.includes(lowerSearch) ||
          tname.includes(lowerSearch) ||
          priority.includes(lowerSearch)
        );
      });
      setFilteredTask(filtered);
    }, [searchTask, tasks]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div>
            <div className="user-header">
              <h2 className="employee-title">Projects</h2>
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Search by code, title, or discipline"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="search-bar"
                />
              </div>
              <div>
                <button className="add-user-btn" onClick={handleAddClick}>
                  Create Project
                </button>
              </div>
            </div>
            <div className="table-wrapper">
  <table className="holiday-table">
    <thead>
      <tr>
        <th>Project code</th>
        <th>Project name</th>
        <th>Estd. hours</th>
        <th>Total hours</th>
        <th>Discipline</th>
        <th>Status</th>
        <th>Discipline</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {filteredProjects.map((project) => (
        <tr key={project.project_id}>
          <td
            onClick={() => handleProjectClick(project.project_id)}
            style={{
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            {project.project_code}
          </td>
          <td>{project.project_title}</td>
          <td>{project.estimated_hours}</td>
          <td>-</td>
          <td>{project.discipline}</td>
          <td>{project.status ? "In progress" : "Completed"}</td>
          <td>{project.discipline}</td>
          <td>{project.status ? "In progress" : "Completed"}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          </div>
        );
      case 1:
        return (
          <div>
            <div className="user-header">
              <h2 className="employee-title">Buildings</h2>
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Search by code, title, or discipline"
                  value={searchBuild}
                  onChange={(e) => setSearchBuild(e.target.value)}
                  className="search-bar"
                />
              </div>
              <div>
                <button
                  className="add-user-btn"
                  onClick={handleAddBuildingClick}
                >
                  Create Building
                </button>
              </div>
            </div>
            <table className="holiday-table">
              <thead>
                <tr>
                  <th>Building code</th>
                  <th>Building name</th>
                  <th>Building Description</th>
                  {/* <th>Total hours</th>
                  <th>Estimated hours</th>
                  <th>Discipline</th>
                  <th>Status</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredBuildings.map((building) => (
                  <tr key={building.building_id}>
                    <td
                    // onClick={() => handleProjectClick(building.building_id)}
                    // style={{
                    //   cursor: "pointer",
                    //   textDecoration: "underline",
                    // }}
                    >
                      {building.building_code}
                    </td>
                    <td>{building.building_title}</td>
                    <td>{building.building_description}</td>
                    {/* <td>-</td>
                    <td>{building.estimated_hours?.estimated_hours || "-"}</td>
                    <td>{building.discipline?.discipline || "-"}</td>
                    <td>{building.status ? "Completed" : "In progress"}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 2:
        return (
          <div>
            <div className="user-header">
              <h2 className="employee-title">Tasks</h2>
              <div className="search-bar-container">
                <input
                  type="text"
                  placeholder="Search by code, title, or discipline"
                  value={searchTask}
                  onChange={(e) => setSearchTask(e.target.value)}
                  className="search-bar"
                />
              </div>
              <div>
                <button className="add-user-btn" onClick={handleAddTaskClick}>
                  Create Task
                </button>
              </div>
            </div>
            <table className="holiday-table">
              <thead>
                <tr>
                  <th>Task code</th>
                  <th>Task name</th>
                  <th>Task Description</th>
                  {/* <th>Estimated hours</th> */}
                  <th>Priority</th>
                  {/* <th>Status</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredTask.map((task) => (
                  <tr key={task.task_id}>
                    <td
                    // onClick={() => handleProjectClick(task.task_id)}
                    // style={{
                    //   cursor: "pointer",
                    //   textDecoration: "underline",
                    // }}
                    >
                      {task.task_code}
                    </td>
                    <td>{task.task_title}</td>
                    <td>{task.task_description}</td>
                    <td>{task.priority}</td>
                    {/* <td>{task.status ? "Completed" : "In progress"}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  return (
    <div>
      <div className="tab-header">
        {tabLabels.map((label, index) => (
          <button
            key={label}
            onClick={() => setActiveTab(index)}
            className={activeTab === index ? "tab-btn active" : "tab-btn"}
          >
            {label}
          </button>
        ))}
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default ManagerProjects;
