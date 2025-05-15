import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const ManagerTaskView = () => {
  const { user } = useAuth();
  const { task_assign_id } = useParams(); // from URL
  const [editMode, setEditMode] = useState(false); //  Add this at the top
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [taskData, setTaskData] = useState({});
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employee: [],
    attachments: [],
    task_hours: "",
    status: "",
    priority: null,
    comments: "",
    start_date: "",
    end_date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      employee: formData.employee,
      status: "inprogress",
    };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/tasks-assigned/${task_assign_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("Project created successfully!");
      } else {
        console.error(data);
        alert(" Failed to create project");
      }
    } catch (err) {
      console.error("Request error:", err);
    }
    if (formData.attachments.length > 0) {
      await uploadAttachments();
    }
    setEditMode(false);
    fetchTaskAssignment(); // Re-fetch to reset form
  };

  const location = useLocation();
  const isManagerPage = location.pathname.startsWith("/manager");

  useEffect(() => {
    fetchTeamleadManager();
    fetchTaskAssignment();
  }, []);

  const uploadAttachments = async () => {
    for (let file of formData.attachments) {
      const form = new FormData();
      form.append("file", file);
      form.append("task_assign", task_assign_id); // attach to correct task

      try {
        const res = await fetch(`${config.apiBaseURL}/attachments/`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const err = await res.json();
          console.error("Upload failed:", err);
        }
      } catch (err) {
        console.error("Attachment upload error:", err);
      }
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

  const fetchTaskAssignment = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/tasks-building/${task_assign_id}/`
      );
      const data = await response.json();
      setTaskData(data);
      setAvailableEmployees(data.employee);

      setFormData({
        employee: data.employee?.map((emp) => emp.employee_id) || [],
        attachments: data.attachments,
        task_hours: data.task_hours || "",
        status: data.status || "",
        priority: data.priority || "",
        comments: data.comments || "",
        start_date: data.start_date || "",
        end_date: data.end_date || "",
      });
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
        <h2>Task details </h2>
        {editMode ? (
          <div></div>
        ) : (
          <button
            type="edit"
            onClick={() => setEditMode(true)}
            className="btn-btn-orange edit-btn"
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
                          checked={formData.employee.includes(emp.employee_id)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            const empId = emp.employee_id;
                            if (checked) {
                              setFormData((prev) => ({
                                ...prev,
                                employee: [...prev.employee, empId],
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                employee: prev.employee.filter(
                                  (id) => id !== empId
                                ),
                              }));
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
                {editMode && (
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        attachments: Array.from(e.target.files),
                      }))
                    }
                  />
                )}
                {taskData.attachments && taskData.attachments.length > 0 ? (
                  taskData.attachments.map((file, index) => (
                    <div key={index} style={{ marginBottom: "5px" }}>
                      <a
                        href={config.apiBaseURL + file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-attachment-link"
                      >
                        <img
                          src="/src/assets/pin svg.svg"
                          alt="Attachment"
                          style={{
                            width: "16px",
                            height: "16px",
                            marginRight: "5px",
                            verticalAlign: "middle",
                          }}
                        />
                        {file.file.split("/").pop()}
                      </a>
                    </div>
                  ))
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
                {editMode ? (
                  <div className="date-input-container">
                    <DatePicker
                      selected={
                        formData.start_date
                          ? new Date(formData.start_date)
                          : null
                      }
                      onChange={(date) =>
                        handleChange({
                          target: {
                            name: "start_date",
                            value: format(date, "yyyy-MM-dd"),
                          },
                        })
                      }
                      dateFormat="dd-MMM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      className="custom-datepicker"
                    />
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                  </div>
                ) : (
                  <p>{taskData?.start_date || ""}</p>
                )}
              </div>

              <div className="project-form-group-small">
                <label>End Date</label>
                {editMode ? (
                  <div className="date-input-container">
                    <DatePicker
                      selected={
                        formData.end_date ? new Date(formData.end_date) : null
                      }
                      onChange={(date) =>
                        handleChange({
                          target: {
                            name: "end_date",
                            value: format(date, "yyyy-MM-dd"),
                          },
                        })
                      }
                      dateFormat="dd-MMM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      className="custom-datepicker"
                      popperPlacement="bottom-start"
                    />
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                  </div>
                ) : (
                  <p>{taskData?.end_date || ""}</p>
                )}
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
            <div className="right-form-second">
              <div className="project-form-group">
                <label>Priority</label>
                {editMode ? (
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Priority --</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                ) : (
                  <p>{taskData?.priority || ""}</p>
                )}
              </div>
              <div className="project-form-group">
                <label>Comments</label>
                {editMode ? (
                  <textarea
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Enter comments"
                  />
                ) : (
                  <p>{taskData?.comments || ""}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {editMode && (
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                fetchTaskAssignment(); // Re-fetch to reset form
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ManagerTaskView;
