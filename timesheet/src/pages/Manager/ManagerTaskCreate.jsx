import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { showErrorToast, showSuccessToast } from "../../constants/Toastify";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const ManagerTaskCreate = () => {
  const [taskData, setTaskData] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate("/manager/detail/projects/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = taskData;

    try {
      const res = await fetch(`${config.apiBaseURL}/tasks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        // toast.success("Task created successfully", {
        //   className: "custom-toast",
        //   bodyClassName: "custom-toast-body",
        //   progressClassName: "custom-toast-progress",
        //   position: "top-center",
        //   autoClose: 2000,
        //   hideProgressBar: true,
        // });
        showSuccessToast("Task created successfully!");
      } else {
        console.error(data);
        // showErrorToast("Failed to create Task.");

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
      setTimeout(() => navigate(`/manager/detail/projects/`), 1000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="create-building-container">
      <h2>Create Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="building-elements">
          <div className="top-element">
            <div>
              <label>Task code</label>
              <input
                name="task_code"
                value={taskData.task_code || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Task Title</label>
              <input
                name="task_title"
                value={taskData.task_title || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="table-bottom-element">
            <div>
              <label>Task Description</label>
              <br />
              <textarea
                name="task_description"
                value={taskData.task_description || ""}
                onChange={handleChange}
                rows={4}
                className="textarea"
              />
            </div>
            <div>
              <label>Priority</label>
              <br />
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
            </div>
          </div>
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn-green">
            Create
          </button>
          <button
            type="reset"
            className="btn-red"
            onClick={() => handleCancel()}
          >
            Cancel
          </button>
        </div>
      </form>
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerTaskCreate;
