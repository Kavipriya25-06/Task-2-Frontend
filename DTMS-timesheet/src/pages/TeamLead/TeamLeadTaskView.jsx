// src\pages\TeamLead\TeamLeadTaskView.jsx

import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAttachmentManager } from "../../constants/useAttachmentManager";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  ToastContainerComponent,
} from "../../constants/Toastify";
import confirm from "../../constants/ConfirmDialog";

const TeamLeadTaskView = () => {
  const { user } = useAuth();
  const { task_assign_id } = useParams(); // from URL
  const [taskId, setTaskId] = useState("");
  const [taskStatus, setTaskStatus] = useState(false);
  const [editMode, setEditMode] = useState(false); //  Add this at the top
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [additionalResources, setAdditionalResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [taskData, setTaskData] = useState({});
  const [showAttachments, setShowAttachments] = useState(false);
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
    due_date: "",
    completed_status: null,
  });

  const {
    attachments,
    setAttachments,
    newAttachments,
    setNewAttachments,
    handleAttachmentChange,
    removeExistingAttachment,
    removeNewAttachment,
  } = useAttachmentManager([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };

  const handleTaskComplete = async () => {
    const confirmDelete = await confirm({
      message: `Are you sure you want to mark this Task as completed?`,
    });
    if (!confirmDelete) return;
    const update = {
      completed_status: true,
    };
    try {
      const response = await fetch(
        `${config.apiBaseURL}/tasks/${taskId}/`, //  Match fetch URL
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        }
      );

      if (response.ok) {
        showSuccessToast("Task completed successfully.");
        fetchTaskAssignment();
      } else {
        const errorData = await response.json();
        console.error("Failed to change status:", errorData);
        showErrorToast("Failed to change status for the Task.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showWarningToast("Something went wrong while changing status.");
    }
  };

  const handleTaskInComplete = async () => {
    const confirmDelete = await confirm({
      message: `Are you sure you want to reopen this Task?`,
    });
    if (!confirmDelete) return;
    const update = {
      completed_status: false,
    };
    try {
      const response = await fetch(
        `${config.apiBaseURL}/tasks/${taskId}/`, //  Match fetch URL
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        }
      );

      if (response.ok) {
        showSuccessToast("Task reopened successfully.");
        fetchTaskAssignment();
      } else {
        const errorData = await response.json();
        console.error("Failed to change status:", errorData);
        showErrorToast("Failed to change status for the Task.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showWarningToast("Something went wrong while changing status.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const taskPayload = {
      start_date: formData.start_date,
      due_date: formData.due_date,
    };

    const payload = {
      ...formData,
      employee: formData.employee,
      status: "inprogress",
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/tasks/${taskId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPayload),
      });

      const data = await response.json();
      if (response.ok) {
        showSuccessToast("Task created successfully!");
      } else {
        console.error(data);
        showErrorToast(" Failed to create Task");
      }
    } catch (err) {
      console.error("Request error:", err);
    }

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
        showSuccessToast("Task created successfully!");
      } else {
        console.error(data);
        showErrorToast(" Failed to create Task");
      }
    } catch (err) {
      console.error("Request error:", err);
    }

    if (newAttachments.length > 0) {
      for (const file of newAttachments) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("task_assign", taskData.task_assign_id);

        const uploadRes = await fetch(`${config.apiBaseURL}/attachments/`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          console.error("Failed to upload file:", file.name);
        }
      }
      setNewAttachments([]);

      // Refresh the list after all uploads
      const attachResponse = await fetch(
        `${config.apiBaseURL}/attachments/project/${task_assign_id}`
      );
      const attachData = await attachResponse.json();
      setAttachments(attachData);
      setNewAttachments([]);
    }

    setEditMode(false);
    setSearchQuery("");
    fetchTaskAssignment(); // Re-fetch to reset form
  };

  useEffect(() => {
    fetchTeamleadManager();
    fetchAdditionalResources();
    fetchTaskAssignment();
  }, []);

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

  const fetchTaskAssignment = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/tasks-building/${task_assign_id}/`
      );
      const data = await response.json();
      setTaskData(data);
      setAvailableEmployees(data.employee);
      setTaskId(data.task?.task_id);
      setTaskStatus(data.task?.completed_status);

      setFormData({
        employee: data.employee?.map((emp) => emp.employee_id) || [],
        attachments: data.attachments || [],
        task_hours: data.task_hours || "",
        status: data.status || "",
        priority: data.priority || "",
        comments: data.comments || "",
        start_date: data.task?.start_date || "",
        due_date: data.task?.due_date || "",
        end_date: data.end_date || "",
        completed_status: data.task?.completed_status || "",
      });

      setAttachments(data.attachments || []); // Set attachments here directly from task data

      setNewAttachments([]); // Reset new attachments
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
        {/* <h2>Task details </h2> */}
        <h2>{editMode ? "Edit Task" : "View Task"}</h2>
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
                <label>Sub-Division Code</label>
                <p>{building?.building_code || ""}</p>
              </div>
              <div className="project-form-group">
                <label>Sub-Division Title</label>
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
                      {teamleadManager
                        ?.filter((employee) =>
                          employee.employee_name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((emp) => (
                          <div key={emp.employee_id}>
                            <input
                              type="checkbox"
                              value={emp.employee_id}
                              checked={formData.employee.includes(
                                emp.employee_id
                              )}
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
                        ?.filter((employee) =>
                          employee.employee_name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((emp) => (
                          <div key={emp.employee_id}>
                            <input
                              type="checkbox"
                              value={emp.employee_id}
                              checked={formData.employee.includes(
                                emp.employee_id
                              )}
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
                  </div>
                ) : (
                  <div className="select-container">
                    {availableEmployees?.map((emp) => (
                      <p key={emp.employee_id} className="view-roles">
                        {emp.employee_name} - {emp.designation}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="project-form-group">
                <label className="attaches">Attachments</label>

                {editMode ? (
                  <div className="plus-upload-wrappers">
                    {/* Upload button */}
                    <label
                      htmlFor="file-upload-input"
                      className="plus-upload-button"
                    >
                      +
                    </label>
                    <input
                      type="file"
                      id="file-upload-input"
                      name="attachments"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      onChange={handleAttachmentChange}
                      className="real-file-input"
                    />

                    {/* Show existing and new attachments */}
                    {attachments.length > 0 || newAttachments.length > 0 ? (
                      <div className="selected-files">
                        {/* Existing backend attachments */}
                        {attachments.map((file, index) => {
                          if (!file?.file) return null;
                          const fullFilename = file.file.split("/").pop();
                          const match = fullFilename.match(
                            /^(.+?)_[a-zA-Z0-9]+\.(\w+)$/
                          );
                          const filename = match
                            ? `${match[1]}.${match[2]}`
                            : fullFilename;

                          return (
                            <div
                              key={`existing-${index}`}
                              className="file-chip"
                            >
                              <a
                                href={`${config.apiBaseURL}${file.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="file-name"
                              >
                                {filename}
                              </a>
                              <button
                                type="button"
                                className="remove-file"
                                onClick={async () => {
                                  try {
                                    await fetch(
                                      `${config.apiBaseURL}/attachments/${file.id}/`,
                                      {
                                        method: "DELETE",
                                      }
                                    );
                                    setAttachments((prev) =>
                                      prev.filter((att) => att.id !== file.id)
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Failed to delete attachment:",
                                      error
                                    );
                                  }
                                }}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}

                        {/* New file attachments */}
                        {newAttachments.map((file, index) => (
                          <div key={`new-${index}`} className="file-chip">
                            <a
                              href={URL.createObjectURL(file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-name"
                            >
                              {file.name}
                            </a>
                            <button
                              type="button"
                              className="remove-file"
                              onClick={() => removeNewAttachment(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#666" }}>No attachments added.</p>
                    )}
                  </div>
                ) : attachments.length > 0 ? (
                  <>
                    {/*  Toggle View */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAttachments((prev) => !prev);
                      }}
                      className="view-attachment-link"
                      style={{
                        display: "inline-block",
                        marginBottom: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src="/pin_svg.svg"
                        alt="Attachment"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "5px",
                          verticalAlign: "middle",
                        }}
                      />
                      {showAttachments
                        ? "Hide Attachments"
                        : "View Attachments"}
                    </a>

                    {/* Render attachments from backend */}
                    {showAttachments && (
                      <ul className="attachment-list">
                        {attachments.map((file, index) => {
                          if (!file?.file) return null;
                          const fullFilename = file.file.split("/").pop();
                          const match = fullFilename.match(
                            /^(.+?)_[a-zA-Z0-9]+\.(\w+)$/
                          );
                          const filename = match
                            ? `${match[1]}.${match[2]}`
                            : fullFilename;

                          return (
                            <li key={index}>
                              <a
                                href={`${config.apiBaseURL}${file.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view-attachment-link"
                              >
                                <img
                                  src="/pin_svg.svg"
                                  alt="Attachment"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    marginRight: "5px",
                                    verticalAlign: "middle",
                                  }}
                                />
                                {filename}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <p style={{ color: "#666" }}>No attachments added.</p>
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
                      className="input1"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                  </div>
                ) : (
                  <p className="view-date">
                    {formData?.start_date
                      ? format(new Date(formData.start_date), "dd-MMM-yyyy")
                      : ""}
                  </p>
                )}
              </div>

              <div className="project-form-group-small">
                <label>Due Date</label>
                {editMode ? (
                  <div className="date-input-container">
                    <DatePicker
                      selected={
                        formData.due_date ? new Date(formData.due_date) : null
                      }
                      onChange={(date) =>
                        handleChange({
                          target: {
                            name: "due_date",
                            value: format(date, "yyyy-MM-dd"),
                          },
                        })
                      }
                      dateFormat="dd-MMM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      className="input1"
                      popperPlacement="bottom-start"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                  </div>
                ) : (
                  <p className="view-date">
                    {formData?.due_date
                      ? format(new Date(formData.due_date), "dd-MMM-yyyy")
                      : ""}
                  </p>
                )}
              </div>
              <div className="project-form-group-small">
                <label>Project Hours</label>
                <p>{project?.estimated_hours || ""}</p>
              </div>
              <div className="project-form-group-small">
                <label>Sub-Division Hours</label>
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
                  <p className="view-data">{taskData?.task_hours || ""}</p>
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
                  <p className="view-text">{taskData?.priority || ""}</p>
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
                  <p className="view-text">{taskData?.comments || ""}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-buttons">
          {!editMode ? (
            <>
              {!taskStatus ? (
                <button
                  type="button"
                  onClick={handleTaskComplete}
                  className="btn-complete"
                >
                  <i className="fas fa-check" /> Mark as Completed
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTaskInComplete}
                  className="btn-complete"
                >
                  <i className="fas fa-folder-open" /> Reopen
                </button>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </form>
      <ToastContainerComponent />
    </div>
  );
};

export default TeamLeadTaskView;
