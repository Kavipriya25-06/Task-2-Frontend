// // src\pages\TeamLead\TeamLeadProjects.jsx

// import { useEffect, useState } from "react";
// import { FaEdit } from "react-icons/fa";
// import { useAuth } from "../../AuthContext";
// import config from "../../config";
// import { useNavigate } from "react-router-dom";

// const TeamLeadProjects = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState(0);
//   const [projects, setProjects] = useState([]);
//   const [buildings, setBuildings] = useState([]);
//   const [tasks, setTasks] = useState([]);

//   const tabLabels = ["Projects", "Buildings", "Tasks"];

//   const fetchProjects = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/projects/`);
//       const data = await response.json();
//       setProjects(data);
//     } catch (err) {
//       console.log("Unable to fetch projects", err);
//     }
//   };

//   const fetchBuildings = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/buildings/`);
//       const data = await response.json();
//       setBuildings(data);
//     } catch (err) {
//       console.log("Unable to fetch buildings", err);
//     }
//   };

//   const fetchTasks = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/tasks/`);
//       const data = await response.json();
//       setTasks(data);
//     } catch (err) {
//       console.log("Unable to fetch tasks", err);
//     }
//   };

//   const handleAddClick = () => {
//     navigate(`create`);
//   };

//   const handleAddBuildingClick = () => {
//     navigate(`/teamlead/detail/buildings/create`);
//   };

//   const handleAddTaskClick = () => {
//     navigate(`/teamlead/detail/tasks/create`);
//   };

//   const handleProjectClick = (project_id) => {
//     navigate(`${project_id}`);
//   };

//   useEffect(() => {
//     fetchProjects();
//     fetchBuildings();
//     fetchTasks();
//   }, []);

//   const renderTabContent = () => {
//     switch (activeTab) {
//       case 0:
//         return (
//           <div>
//             <h2 className="employee-title">Projects</h2>
//             <div>
//               <button onClick={handleAddClick}>Create Project</button>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Project code</th>
//                   <th>Project name</th>
//                   <th>Building</th>
//                   <th>Total hours</th>
//                   <th>Estimated hours</th>
//                   <th>Discipline</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {projects.map((project) => (
//                   <tr key={project.project_id}>
//                     <td
//                       onClick={() => handleProjectClick(project.project_id)}
//                       style={{
//                         cursor: "pointer",
//                         textDecoration: "underline",
//                       }}
//                     >
//                       {project.project_code}
//                     </td>
//                     <td>{project.project_title}</td>
//                     <td></td>
//                     <td></td>
//                     <td>{project.estimated_hours}</td>
//                     <td>{project.discipline}</td>
//                     <td>{project.status ? "Completed" : "In progress"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         );
//       case 1:
//         return (
//           <div>
//             <h2 className="employee-title">Buildings</h2>
//             <div>
//               <button onClick={handleAddBuildingClick}>Create Building</button>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Building code</th>
//                   <th>Building name</th>
//                   {/* <th>Building Description</th> */}
//                   <th>Total hours</th>
//                   <th>Estimated hours</th>
//                   <th>Discipline</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {buildings.map((building) => (
//                   <tr key={building.building_id}>
//                     <td
//                       onClick={() => handleProjectClick(building.building_id)}
//                       style={{
//                         cursor: "pointer",
//                         textDecoration: "underline",
//                       }}
//                     >
//                       {building.building_code}
//                     </td>
//                     <td>{building.building_title}</td>
//                     {/* <td>{building.building_description}</td> */}
//                     <td></td>
//                     <td>{building.estimated_hours}</td>
//                     <td>{building.discipline}</td>
//                     <td>{building.status ? "Completed" : "In progress"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <h2 className="employee-title">Tasks</h2>
//             <div>
//               <button onClick={handleAddTaskClick}>Create Task</button>
//             </div>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Task code</th>
//                   <th>Task name</th>
//                   <th>Total hours</th>
//                   <th>Estimated hours</th>
//                   <th>Priority</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tasks.map((task) => (
//                   <tr key={task.task_id}>
//                     <td
//                       onClick={() => handleProjectClick(task.task_id)}
//                       style={{
//                         cursor: "pointer",
//                         textDecoration: "underline",
//                       }}
//                     >
//                       {task.task_code}
//                     </td>
//                     <td>{task.task_title}</td>
//                     <td></td>
//                     <td>{task.estimated_hours}</td>
//                     <td>{task.priority}</td>
//                     <td>{task.status ? "Completed" : "In progress"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         );
//     }
//   };

//   return (
//     <div>
//       <div className="tab-header">
//         {tabLabels.map((label, index) => (
//           <button
//             key={label}
//             onClick={() => setActiveTab(index)}
//             className={activeTab === index ? "tab-btn active" : "tab-btn"}
//           >
//             {label}
//           </button>
//         ))}
//       </div>
//       <div>{renderTabContent()}</div>
//     </div>
//   );
// };

// export default TeamLeadProjects;

// src\pages\TeamLead\TeamLeadProjects.jsx

import { useEffect, useState, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeamLeadProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredBuildings, setFilteredBuildings] = useState([]);
  const [filteredTask, setFilteredTask] = useState([]);
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
    navigate(`/teamlead/detail/buildings/create`);
  };

  const handleAddTaskClick = () => {
    navigate(`/teamlead/detail/tasks/create`);
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
        return (
          code.includes(lowerSearch) ||
          name.includes(lowerSearch) ||
          discipline.includes(lowerSearch)
        );
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
    }, 500);

    return () => clearTimeout(searchTimeout.current);
  }, [searchText, projects]);

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
    }, 500);

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
    }, 500);

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
                  }, 1000); // Simulate 2 seconds loading
                }
              }}
            >
              <table className="holiday-table">
                <thead>
                  <tr>
                    <th>Project code</th>
                    <th>Project name</th>
                    {/* <th>Building</th> */}

                    <th>Estimated hours</th>
                    <th>Variation hours</th>
                    <th>Total hours</th>
                    <th>Consumed hours</th>
                    <th>Discipline</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.slice(0, visibleProjects).map((project) => (
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
                      {/* <td></td> */}
                      <td>{project.estimated_hours}</td>
                      <td>{project.variation_hours}</td>
                      <td>{project.total_hours}</td>
                      <td>{project.consumed_hours}</td>
                      <td>{project.discipline}</td>
                      <td>{project.status ? "Completed" : "In progress"}</td>
                    </tr>
                  ))}
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
                  }, 1000); // Simulate 2 seconds loading
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
                  {filteredBuildings
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
                        {/* <td></td>
                    <td>{building.estimated_hours}</td>
                    <td>{building.discipline}</td>
                    <td>{building.status ? "Completed" : "In progress"}</td> */}
                      </tr>
                    ))}
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
                  }, 1000); // Simulate 2 seconds loading
                }
              }}
            >
              <table className="holiday-table">
                <thead>
                  <tr>
                    <th>Task code</th>
                    <th>Task name</th>
                    <th>Task Description</th>
                    {/* <th>Total hours</th>
                  <th>Estimated hours</th> */}
                    <th>Priority</th>
                    {/* <th>Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredTask.slice(0, visibleTasks).map((task) => (
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
                      {/* <td></td>
                    <td>{task.estimated_hours}</td> */}
                      <td>{task.priority}</td>
                      {/* <td>{task.status ? "Completed" : "In progress"}</td> */}
                    </tr>
                  ))}
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

export default TeamLeadProjects;
