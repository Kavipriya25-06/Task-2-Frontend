// src\pages\Manager\ManagerBuildingView.jsx

import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";
import confirm from "../../constants/ConfirmDialog";

const ManagerBuildingView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false); //  Add this at the top
  const { building_assign_id } = useParams(); // from URL
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [availableTeamleadManager, setAvailableTeamleadManager] = useState([]);
  const [additionalResources, setAdditionalResources] = useState([]);
  const [projectResources, setProjectResources] = useState([]);
  const [projectAssign, setProjectAssign] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [buildingsAssign, setBuildingsAssign] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskSelections, setTaskSelections] = useState([]);
  const [taskPopupVisible, setTaskPopupVisible] = useState(false);
  const [formData, setFormData] = useState({
    building_hours: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };

  const handleRemoveTask = async (task) => {
    // If the building has an assign ID, it exists in DB, so delete.
    if (task.task_assign_id) {
      // const confirmDelete = window.confirm(
      //   `Are you sure you want to remove building "${building?.building?.building_title}"?`
      // );
      const confirmDelete = await confirm({
        message: `Are you sure you want to remove Task "${task?.task_title}"?`,
      });
      if (!confirmDelete) return;

      try {
        const res = await fetch(
          `${config.apiBaseURL}/tasks-assigned/${task?.task_assign_id}/`,
          { method: "DELETE" }
        );

        if (res.ok) {
          setTaskSelections((prev) =>
            prev.filter((t) => t.task_assign_id !== task.task_assign_id)
          );
          showSuccessToast("Task removed!");
        } else {
          showErrorToast("Failed to delete Task.");
        }
      } catch (err) {
        console.error("Error deleting building:", err);
      }
    } else {
      // It's a new building not yet saved → just remove from state
      setTaskSelections((prev) =>
        prev.filter((t) => t.task_id !== task.task_id)
      );
    }
  };

  const handleUpdate = async () => {
    const buildingAssignPayload = {
      building_hours: formData.building_hours,
      employee: availableTeamleadManager.map((e) => e.employee_id),
      status: "inprogress",
    };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/buildings-assigned/${building_assign_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildingAssignPayload),
        }
      );

      if (response.ok) {
        console.log("Building updated!");
        showSuccessToast("Sub-Division Updated");
        setEditMode(false);
        setSearchQuery("");
      } else {
        showErrorToast("Failed to update project");
      }
    } catch (err) {
      console.error("Update error:", err);
      showErrorToast(err);
    }

    for (let task of taskSelections) {
      const taskPayload = {
        task: task.task_id,
        building_assign: building_assign_id,
        task_hours: task.task_hours || "0", // default or collect via UI
        status: "inprogress",
        // comments: "",
        start_date: task.start_date || null,
        end_date: task.end_date || null,
        // employee: [],
      };

      const method = task.task_assign_id ? "PATCH" : "POST";
      const url = task.task_assign_id
        ? `${config.apiBaseURL}/tasks-assigned/${task.task_assign_id}/`
        : `${config.apiBaseURL}/tasks-assigned/`;

      const finalPayload = task.task_assign_id
        ? taskPayload
        : { ...taskPayload, employee: [] };

      console.log("Final payload", finalPayload);

      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPayload),
        });
        if (response.ok) {
          console.log("Building updated!");
          // showSuccessToast("Sub-Division Updated");
          setEditMode(false);
          setSearchQuery("");
          // fetchProjectData(); // refresh
        } else {
          showErrorToast("Failed to update project");
        }
      } catch (err) {
        console.error("Update error:", err);
        showErrorToast(err);
      }
    }
    fetchBuildingsAssign(); // refresh state
  };

  useEffect(() => {
    fetchTeamleadManager();
    fetchAdditionalResources();
    fetchTasks();
    fetchBuildingsAssign();
  }, []);

  useEffect(() => {
    if (projectAssign) {
      fetchProjectResources();
    }
  }, [projectAssign]);

  const fetchProjectResources = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/projects-assigned-employee/${projectAssign}/`
      );
      const data = await response.json();
      setProjectResources(data);
      console.log("Project resources", data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchTeamleadManager = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/emp-details/${user.employee_id}/`
      );
      const data = await response.json();
      setTeamleadManager(data);
      console.log("Team leads and managers", data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchAdditionalResources = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/additional-resource/${user.employee_id}/`
      );
      const data = await response.json();
      setAdditionalResources(data);
      console.log("Additional resources", data);
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
      setFormData({ building_hours: data.building_hours || "" });
      setAvailableTeamleadManager(data.employee);

      // Merge existing tasks into selection state
      const mappedExistingTasks = data.tasks.map((t) => ({
        task_assign_id: t.task_assign_id,
        task_id: t.task.task_id,
        task_title: t.task.task_title,
        task_hours: t.task_hours,
        start_date: t.start_date,
        end_date: t.end_date,
        // employee: t.employee,
        isNew: false, // mark as pre-existing
      }));
      setTaskSelections(mappedExistingTasks);

      console.log("Buildings", data);
      console.log("Projects", data.project_assign);
      setProjectAssign(data.project_assign?.project_assign_id);
    } catch (error) {
      console.error("Error fetching Buildings:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/other-tasks/`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleTaskToggle = (task) => {
    const already = taskSelections.find((t) => t.task_id === task.task_id);
    if (already) {
      setTaskSelections((prev) =>
        prev.filter((t) => t.task_id !== task.task_id)
      );
    } else {
      setTaskSelections((prev) => [
        ...prev,
        {
          task_id: task.task_id,
          task_title: task.task_title,
          task_hours: "",
          isNew: true,
          start_date: null,
          end_date: null,
        },
      ]);
    }
  };

  const updateTaskHours = (task_id, hours) => {
    setTaskSelections((prev) =>
      prev.map((t) => (t.task_id === task_id ? { ...t, task_hours: hours } : t))
    );
  };

  const updateTaskDates = (task_id, field, value) => {
    setTaskSelections((prev) =>
      prev.map((t) => (t.task_id === task_id ? { ...t, [field]: value } : t))
    );
  };

  const saveTaskPopup = () => {
    const invalid = taskSelections.find(
      (t) => !t.task_hours || parseFloat(t.task_hours) <= 0
    );
    if (invalid) {
      showErrorToast(
        `Please enter valid hours for task "${invalid.task_title}".`
      );
      return;
    }

    // Avoid duplication
    const uniqueTasks = taskSelections.reduce((acc, curr) => {
      if (!acc.find((t) => t.task_id === curr.task_id)) {
        acc.push(curr);
      }
      return acc;
    }, []);

    setTaskSelections(uniqueTasks);
    setTaskPopupVisible(false);
  };

  if (!buildingsAssign || !buildingsAssign.project_assign) {
    return <p>Loading...</p>;
  }

  const { project } = buildingsAssign.project_assign;

  const taskClick = (task_assign_id) => {
    navigate(`tasks/${task_assign_id}`);
  };
  return (
    <div className="create-project-container">
      <div className="project-header">
        {/* <h2>Sub-Division {buildingsAssign.building?.building_title}</h2> */}
        <h2>{editMode ? "Edit Sub-Division" : "View Sub-Division"}</h2>
        {!editMode && (
          <button
            type="edit"
            onClick={() => setEditMode(true)}
            className="btn-orange"
          >
            <FaEdit className="edit-icon" />
          </button>
        )}
      </div>
      <div>
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
                <label>Sub-Division Code</label>
                <p>{buildingsAssign.building?.building_code}</p>
              </div>
              <div className="project-form-group">
                <label>Sub-Division Title</label>
                <p>{buildingsAssign.building?.building_title}</p>
              </div>
            </div>
            <div className="left-form-second">
              <div className="project-form-group">
                <label className="description">Sub-Division Description</label>
                <p>{buildingsAssign.building?.building_description}</p>
              </div>
              <div className="project-form-group">
                <label>Assign Task</label>
                {editMode ? (
                  <div className="select-container">
                    {taskSelections?.map((t) => (
                      <div key={t.task_id} className="task-tile">
                        <div
                          // onClick={() => taskClick(t.task_id)}

                          className="building-tile-small"
                        >
                          {t.task_title}
                        </div>
                        <div className="building-tile-small">
                          {t.task_hours} hours
                        </div>
                        <button
                          className="tag-button"
                          onClick={() => handleRemoveTask(t)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setTaskPopupVisible(true)}
                      // className="btn-green"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="select-container">
                    {buildingsAssign.tasks.map((t) => (
                      <div key={t.task_assign_id} className="task-tile">
                        <div
                          // onClick={() => taskClick(t.task_assign_id)}
                          className="building-tile-small"
                        >
                          {t.task.task_title}
                        </div>
                        <div className="building-tile-smalls">
                          {t.task_hours} hours
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="right-form">
            <div className="right-form-first">
              <div className="project-form-group-small">
                <label>Start Date</label>
                <p>
                  {project?.start_date
                    ? format(new Date(project.start_date), "dd-MMM-yyyy")
                    : ""}
                </p>
              </div>
              <div className="project-form-group-small">
                <label>Project Hours</label>
                <p>{project?.estimated_hours || ""}</p>
              </div>
              <div className="project-form-group-small">
                <label>Sub-Division Hours</label>
                {editMode ? (
                  <input
                    type="number"
                    name="building_hours"
                    value={formData.building_hours}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="view-data">
                    {buildingsAssign.building_hours || ""}
                  </p>
                )}
              </div>
            </div>
            <div className="right-form-second">
              <div className="roles-box">
                <label>Sub-Division Roles</label>
                {editMode ? (
                  <div className="select-container">
                    <input
                      type="text"
                      placeholder="Search employee..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "50%",
                        height: "30px",
                        marginLeft: "10px",
                      }}
                    />
                    <div>
                      {projectResources
                        .filter((employee) =>
                          employee.employee_name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((employee) => (
                          <div
                            key={employee.employee_id}
                            className="employee-checkbox"
                          >
                            {employee.employee_name} - {employee.designation}
                            <input
                              type="checkbox"
                              className="larger-checkbox"
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
                    {/*  
                    <div>
                      <h4
                        style={{
                          margin: "20px 0 10px",
                          color: "#333",
                          marginLeft: "10px",
                        }}
                      >
                        Additional Resources
                      </h4>
                      {additionalResources
                        .filter((employee) =>
                          employee.employee_name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((employee) => (
                          <div
                            key={employee.employee_id}
                            className="employee-checkbox"
                          >
                            {employee.employee_name} - {employee.designation}
                            <input
                              type="checkbox"
                              className="create-checkbox"
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
                                      (id) => id !== employee.employee_id
                                    )
                                  );
                                }
                              }}
                            />
                          </div>
                        ))}
                    </div>
                    */}
                  </div>
                ) : (
                  <div className="select-container">
                    {availableTeamleadManager.map((emp) => (
                      <p key={emp.employee_id} className="view-roles">
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
          {editMode && (
            <>
              <button type="submit" onClick={handleUpdate} className="btn-save">
                Save
              </button>
              <button onClick={() => setEditMode(false)} className="btn-cancel">
                Cancel
              </button>
            </>
          )}
        </div>
        {editMode && taskPopupVisible && (
          <div className="popup">
            <h4>Select Tasks & Enter Hours</h4>
            {tasks.map((task) => {
              const selected = taskSelections.find(
                (t) => t.task_id === task.task_id
              );
              return (
                <div key={task.task_id} style={{ marginBottom: "10px" }}>
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => handleTaskToggle(task)}
                  />
                  {task.task_title}
                  {selected && (
                    <>
                      <input
                        type="number"
                        value={selected.task_hours}
                        placeholder="Hours"
                        style={{ marginLeft: "10px" }}
                        onChange={(e) =>
                          updateTaskHours(task.task_id, e.target.value)
                        }
                      />
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          alignItems: "center",
                        }}
                      >
                        {/* <div className="date-input-container">
                          <DatePicker
                            selected={
                              selected.start_date
                                ? new Date(selected.start_date)
                                : null
                            }
                            onChange={(date) =>
                              updateTaskDates(
                                task.task_id,
                                "start_date",
                                format(date, "yyyy-MM-dd")
                              )
                            }
                            dateFormat="dd-MMM-yyyy"
                            placeholderText="dd-mm-yyyy"
                            className="custom-datepicker"
                            dropdownMode="select"
                          />
                          <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                        </div>
                        <div className="date-input-container">
                          <DatePicker
                            selected={
                              selected.end_date
                                ? new Date(selected.end_date)
                                : null
                            }
                            onChange={(date) =>
                              updateTaskDates(
                                task.task_id,
                                "end_date",
                                format(date, "yyyy-MM-dd")
                              )
                            }
                            dateFormat="dd-MMM-yyyy"
                            placeholderText="dd-mm-yyyy"
                            className="custom-datepicker"
                            dropdownMode="select"
                          />
                          <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                        </div> */}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            <div className="popup-footer">
              <button onClick={saveTaskPopup} className="btn-save">
                Done
              </button>
              <button
                onClick={() => setTaskPopupVisible(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerBuildingView;
