import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import confirm from "../../constants/ConfirmDialog";
// import { showErrorToast, showSuccessToast } from "../../constants/Toastify";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const ManagerTaskEdit = () => {
  const [taskData, setTaskData] = useState({});
  const navigate = useNavigate();
  const { task_id } = useParams();
  const [editMode, setEditMode] = useState(false); //  Add this at the top

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setEditMode(false);
    // navigate("/manager/detail/projects/");
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/tasks/${task_id}`);
      const data = await response.json();
      setTaskData(data);
    } catch (err) {
      console.log("Unable to fetch tasks", err);
    }
  };

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
        setTimeout(() => navigate(`/manager/detail/projects/`), 1000);
        // navigate("/manager/detail/projects/");
        // fetchTasks();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = taskData;

    try {
      const res = await fetch(`${config.apiBaseURL}/tasks/${task_id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccessToast("Task saved successfully!");
      } else {
        console.error(data);

        const errorMessages =
          data && typeof data === "object"
            ? Object.entries(data)
                .map(([field, messages]) => {
                  if (Array.isArray(messages)) {
                    return `${field}: ${messages.join(", ")}`;
                  } else {
                    return `${field}: ${messages}`;
                  }
                })
                .join("\n")
            : data?.error || "Unknown error occurred";

        showErrorToast(errorMessages);
        return;
      }
      // setTimeout(() => navigate(`/manager/detail/projects/`), 1000);
      setEditMode(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="create-building-container">
      <div className="project-header">
        <h2>{editMode ? "Edit Task" : "View Task"}</h2>
        <div>
          {!editMode && (
            <button
              type="edit"
              onClick={() => setEditMode(true)}
              className="btn-orange"
              title="Edit"
            >
              <FaEdit className="edit-icon" />
            </button>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="building-elements">
          <div className="top-element">
            <div>
              <label>Task code</label>
              {editMode ? (
                <input
                  name="task_code"
                  value={taskData.task_code || ""}
                  onChange={handleChange}
                />
              ) : (
                // <p>{taskData.task_code || ""}</p>
                <input
                  name="task_code"
                  value={taskData.task_code || ""}
                  disabled
                />
              )}
            </div>
            <div>
              <label>Task Title</label>
              {editMode ? (
                <input
                  name="task_title"
                  value={taskData.task_title || ""}
                  onChange={handleChange}
                />
              ) : (
                // <p>{taskData.task_title || ""}</p>
                <input
                  name="task_title"
                  value={taskData.task_title || ""}
                  disabled
                />
              )}
            </div>
          </div>
          <div className="table-bottom-element">
            <div>
              <label>Task Description</label>
              <br />
              {editMode ? (
                <textarea
                  name="task_description"
                  value={taskData.task_description || ""}
                  onChange={handleChange}
                  rows={4}
                  className="textarea"
                />
              ) : (
                // <p>{taskData.task_description || ""}</p>
                <textarea
                  name="task_description"
                  value={taskData.task_description || ""}
                  disabled
                  rows={4}
                  className="textarea"
                />
              )}
            </div>
            <div>
              <label>Priority</label>
              <br />
              {editMode ? (
                <select
                  name="priority"
                  value={taskData.priority || ""}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                // <p>{taskData.priority || ""}</p>
                <input
                  name="priority"
                  value={taskData.priority || ""}
                  disabled
                  className="table-bottom-element-input"
                />
              )}
            </div>
          </div>
        </div>
        <div className="form-buttons">
          {!editMode ? (
            <>
              <button
                type="button"
                onClick={() => handleDeleteTask(task_id)}
                className="btn-delete"
              >
                <i className="fas fa-trash-alt" /> Delete
              </button>
            </>
          ) : (
            <>
              <button type="submit" className="btn-green">
                Save
              </button>
              <button
                type="reset"
                className="btn-red"
                onClick={() => handleCancel()}
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

export default ManagerTaskEdit;
