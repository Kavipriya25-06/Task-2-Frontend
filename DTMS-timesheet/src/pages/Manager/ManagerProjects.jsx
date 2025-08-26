// src\pages\Manager\ManagerProjects.jsx

import { useEffect, useState, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

import confirm from "../../constants/ConfirmDialog";

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
  const [visibleProjects, setVisibleProjects] = useState(10);
  const [isLoadingMoreProjects, setIsLoadingMoreProjects] = useState(false);
  const [hasMoreProjects, setHasMoreProjects] = useState(true);
  const [visibleBuildings, setVisibleBuildings] = useState(10);
  const [isLoadingMoreBuildings, setIsLoadingMoreBuildings] = useState(false);
  const [hasMoreBuildings, setHasMoreBuildings] = useState(true);
  const [visibleTasks, setVisibleTasks] = useState(10);
  const [isLoadingMoreTasks, setIsLoadingMoreTasks] = useState(false);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const searchTimeout = useRef(null);
  const [statusFilter, setStatusFilter] = useState(""); // "", "true", or "false"

  const tabLabels = ["Projects", "Sub-Division", "Tasks"];

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
      const response = await fetch(`${config.apiBaseURL}/other-buildings/`);
      const data = await response.json();
      setBuildings(data);
      setFilteredBuildings(data);
    } catch (err) {
      console.log("Unable to fetch buildings", err);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/other-tasks/`);
      const data = await response.json();
      setTasks(data);
      setFilteredTask(data);
    } catch (err) {
      console.log("Unable to fetch tasks", err);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/export-report/`, {
        method: "GET",
        headers: {
          "Content-Type": "text/csv",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      // Set default filename (optional: you can get it from headers too)
      const now = new Date();
      const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000); // Add 5.5 hours
      const formattedIST = istNow
        .toISOString()
        .slice(0, 19)
        .replace("T", "_")
        .replace(/:/g, "-");

      link.download = `projects_report_${formattedIST}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    }
  };

  // const handleReportClick = () => {
  //   fetchReports();
  // };

  const handleDeleteTask = async (task_id) => {
    const confirmDelete = await confirm({
      message: `Are you sure you want to delete this task?`,
    });
    if (!confirmDelete) return;
    try {
      const response = await fetch(
        `${config.apiBaseURL}/tasks/${task_id}/`, //  Match fetch URL
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        showSuccessToast("Task deleted successfully.");
        fetchTasks();
      } else {
        const errorData = await response.json();
        console.error("Failed to delete:", errorData);
        showErrorToast("Failed to delete the task.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showWarningToast("Something went wrong while deleting the project.");
    }
  };

  const handleAddClick = () => {
    navigate(`create`);
  };

  const handleTaskClick = (task_id) => {
    navigate(`/manager/detail/tasks/${task_id}`);
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
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      const lowerSearch = searchText.toLowerCase();
      const filtered = projects.filter((u) => {
        const code = u.project_code?.toLowerCase() || "";
        const name = u.project_title?.toLowerCase() || "";
        const discipline = u.discipline?.toLowerCase() || "";
        // const matchesStatus = String(u.status).toLowerCase() || "";
        // return (
        //   code.includes(lowerSearch) ||
        //   name.includes(lowerSearch) ||
        //   discipline.includes(lowerSearch) ||
        //   matchesStatus.includes(statusFilter)
        // );

        const matchesSearch =
          code.includes(lowerSearch) ||
          name.includes(lowerSearch) ||
          discipline.includes(lowerSearch);

        const matchesStatus =
          statusFilter === "" || String(u.status) === statusFilter;

        return matchesSearch && matchesStatus;
      });
      setFilteredProjects(filtered);
      setVisibleProjects(10);
      setHasMoreProjects(filtered.length > 10);

      if (searchText && filtered.length === 0) {
        // toast.info("No users found", {
        //   className: "custom-toast",
        //   bodyClassName: "custom-toast-body",
        //   progressClassName: "custom-toast-progress",
        //   position: "top-center",
        //   autoClose: 2000,
        //   hideProgressBar: true,
        // });
      }
    }, 100);

    return () => clearTimeout(searchTimeout.current);
  }, [searchText, projects, statusFilter]);

  // console.log("status filter", statusFilter);
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      const lowerSearch = searchBuild.toLowerCase();
      const filtered = buildings.filter((u) => {
        const bcode = u.building_code?.toLowerCase() || "";
        const bname = u.building_title?.toLowerCase() || "";
        return bcode.includes(lowerSearch) || bname.includes(lowerSearch);
      });
      setFilteredBuildings(filtered);
      setVisibleBuildings(10);
      setHasMoreBuildings(filtered.length > 10);

      if (searchText && filtered.length === 0) {
        // toast.info("No users found", {
        //   className: "custom-toast",
        //   bodyClassName: "custom-toast-body",
        //   progressClassName: "custom-toast-progress",
        //   position: "top-center",
        //   autoClose: 2000,
        //   hideProgressBar: true,
        // });
      }
    }, 100);

    return () => clearTimeout(searchTimeout.current);
  }, [searchBuild, buildings]);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
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
      setVisibleTasks(10);
      setHasMoreTasks(filtered.length > 10);

      if (searchText && filtered.length === 0) {
        // toast.info("No users found", {
        //   className: "custom-toast",
        //   bodyClassName: "custom-toast-body",
        //   progressClassName: "custom-toast-progress",
        //   position: "top-center",
        //   autoClose: 2000,
        //   hideProgressBar: true,
        // });
      }
    }, 100);

    return () => clearTimeout(searchTimeout.current);
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
                  placeholder="Search by code, title, or project type"
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
            <div
              className="table-wrapper"
              style={{ maxHeight: "400px" }}
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } =
                  e.currentTarget;
                if (
                  scrollTop + clientHeight >= scrollHeight - 10 &&
                  !isLoadingMoreProjects &&
                  hasMoreProjects
                ) {
                  setIsLoadingMoreProjects(true);
                  setTimeout(() => {
                    const nextVisible = visibleProjects + 10;
                    if (nextVisible >= filteredProjects.length) {
                      setVisibleProjects(filteredProjects.length);
                      setHasMoreProjects(false);
                    } else {
                      setVisibleProjects(nextVisible);
                    }
                    setIsLoadingMoreProjects(false);
                  }, 100); // Simulate 2 seconds loading
                }
              }}
            >
              <table className="holiday-table">
                <thead>
                  <tr>
                    <th>Project code</th>
                    <th>Project name</th>
                    <th>Estd. hours</th>
                    <th>Variation hours</th>
                    <th>Total hours</th>
                    <th>Consumed hours</th>
                    <th>Project Type</th>
                    <th>
                      Status&nbsp;
                      <span
                        onClick={() => {
                          if (statusFilter === "") {
                            setStatusFilter("true"); // In progress
                          } else if (statusFilter === "true") {
                            setStatusFilter("false"); // Completed
                          } else {
                            setStatusFilter(""); // All
                          }
                        }}
                        style={{ cursor: "pointer" }}
                        title={
                          statusFilter === ""
                            ? "Filter: All"
                            : statusFilter === "true"
                            ? "Filter: In progress"
                            : "Filter: Completed"
                        }
                      >
                        {statusFilter === "" && (
                          <i className="fas fa-filter"></i>
                        )}
                        {statusFilter === "true" && (
                          <i
                            className="fas fa-play-circle"
                            style={{ color: "orange" }}
                          ></i>
                        )}
                        {statusFilter === "false" && (
                          <i
                            className="fas fa-check-circle"
                            style={{ color: "green" }}
                          ></i>
                        )}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center" }}>
                        No Projects available.
                      </td>
                    </tr>
                  ) : (
                    filteredProjects
                      .slice(0, visibleProjects)
                      .map((project) => (
                        <tr key={project.project_id}>
                          <td
                            onClick={() =>
                              handleProjectClick(project.project_id)
                            }
                            style={{
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                          >
                            {project.project_code}
                          </td>
                          <td>{project.project_title}</td>
                          <td>{project.estimated_hours}</td>
                          <td>{project.variation_hours}</td>
                          <td>{project.total_hours}</td>
                          <td>{project.consumed_hours}</td>
                          <td>{project.discipline}</td>
                          <td>
                            {project.completed_status
                              ? "Completed"
                              : "In progress"}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
              {isLoadingMoreProjects && (
                <div className="loading-message">Loading...</div>
              )}
              {!hasMoreProjects && (
                <div className="no-message">No more data</div>
              )}
            </div>
            <ToastContainer />
          </div>
        );
      case 1:
        return (
          <div>
            <div className="user-header">
              <h2 className="employee-title">Sub-Division</h2>
              <div className="search-bar-containers">
                <input
                  type="text"
                  placeholder="Search by code, name"
                  value={searchBuild}
                  onChange={(e) => setSearchBuild(e.target.value)}
                  className="search-bar"
                />
              </div>
              {/* <div>
                <button
                  className="add-user-btn"
                  onClick={handleAddBuildingClick}
                >
                  Create Sub-Division
                </button>
              </div> */}
            </div>

            <div
              className="table-wrapper"
              style={{ maxHeight: "400px" }}
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } =
                  e.currentTarget;
                if (
                  scrollTop + clientHeight >= scrollHeight - 10 &&
                  !isLoadingMoreBuildings &&
                  hasMoreBuildings
                ) {
                  setIsLoadingMoreBuildings(true);
                  setTimeout(() => {
                    const nextVisible = visibleBuildings + 10;
                    if (nextVisible >= filteredBuildings.length) {
                      setVisibleBuildings(filteredBuildings.length);
                      setHasMoreBuildings(false);
                    } else {
                      setVisibleBuildings(nextVisible);
                    }
                    setIsLoadingMoreBuildings(false);
                  }, 100); // Simulate 2 seconds loading
                }
              }}
            >
              <table className="holiday-table">
                <thead>
                  <tr>
                    <th>Sub-Division code</th>
                    <th>Sub-Division name</th>
                    <th>Sub-Division Description</th>
                    {/* <th>Total hours</th>
                  <th>Estimated hours</th>
                  <th>Discipline</th>
                  <th>Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredBuildings.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        No Areas of work available.
                      </td>
                    </tr>
                  ) : (
                    filteredBuildings
                      .slice(0, visibleBuildings)
                      .map((building) => (
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
                      ))
                  )}
                </tbody>
              </table>
              {isLoadingMoreBuildings && (
                <div className="loading-message">Loading...</div>
              )}
              {!hasMoreBuildings && (
                <div className="no-message">No more data</div>
              )}
            </div>
            <ToastContainer />
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
                  placeholder="Search by code, name"
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
            <div
              className="table-wrapper"
              style={{ maxHeight: "400px" }}
              onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight } =
                  e.currentTarget;
                if (
                  scrollTop + clientHeight >= scrollHeight - 10 &&
                  !isLoadingMoreTasks &&
                  hasMoreTasks
                ) {
                  setIsLoadingMoreTasks(true);
                  setTimeout(() => {
                    const nextVisible = visibleTasks + 10;
                    if (nextVisible >= filteredTask.length) {
                      setVisibleTasks(filteredTask.length);
                      setHasMoreTasks(false);
                    } else {
                      setVisibleTasks(nextVisible);
                    }
                    setIsLoadingMoreTasks(false);
                  }, 100); // Simulate 2 seconds loading
                }
              }}
            >
              <table className="holiday-table">
                <thead>
                  <tr>
                    <th>Task code</th>
                    <th>Task name</th>
                    <th>Task Description</th>
                    {/* <th>Estimated hours</th> */}
                    <th>Priority</th>
                    {/* <th>Actions</th> */}
                    {/* <th>Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredTask.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center" }}>
                        No Tasks available.
                      </td>
                    </tr>
                  ) : (
                    filteredTask.slice(0, visibleTasks).map((task) => (
                      <tr key={task.task_id}>
                        <td
                          onClick={() => handleTaskClick(task.task_id)}
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          {task.task_code}
                        </td>
                        <td>{task.task_title}</td>
                        <td>{task.task_description}</td>
                        <td>{task.priority}</td>
                        {/* <td>
                        {
                          <i
                            onClick={() => handleDeleteTask(task.task_id)}
                            className="fas fa-trash-alt"
                            style={{ cursor: "pointer" }}
                          />
                        }
                      </td> */}
                        {/* <td>{task.status ? "Completed" : "In progress"}</td> */}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {isLoadingMoreTasks && (
                <div className="loading-message">Loading...</div>
              )}
              {!hasMoreTasks && <div className="no-message">No more data</div>}
            </div>
            <ToastContainer />
          </div>
        );
    }
  };

  return (
    <div>
      <div className="report-header">
        <div className="tab-header-report">
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

        {/* <button onClick={() => handleReportClick()} className="report-btn">
          Download report
        </button> */}
      </div>
      <div>{renderTabContent()}</div>
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerProjects;
