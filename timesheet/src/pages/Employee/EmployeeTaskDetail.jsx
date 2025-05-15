import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

const EmployeeTaskDetail = () => {
  const { user } = useAuth();
  const { task_assign_id } = useParams(); // from URL
  const [taskData, setTaskData] = useState([]);

  useEffect(() => {
    fetchTaskAssignment();
  }, []);

  const fetchTaskAssignment = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/tasks-building/${task_assign_id}/`
      );
      const data = await response.json();
      setTaskData(data);
      console.log("Task Assignment:", data);
    } catch (error) {
      console.error("Error fetching task assignment:", error);
    }
  };

  const project = taskData?.building_assign?.project_assign?.project;
  const building = taskData?.building_assign?.building;
  const task = taskData?.task;

  return (
    <div className="create-project-container">
      <div className="project-header">
        <h2>Task details </h2>
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
              <div className="project-form-group">
                <label className="attaches">Attachments</label>
                {task?.attachments ? (
                  <a
                    href={task.attachments}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-attachment-link"
                  >
                    <img
                      src="/src/assets/pin svg.svg" // replace this with your actual image path
                      alt="Attachment"
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "5px",
                        verticalAlign: "middle",
                      }}
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
                <p>{taskData?.task_hours || ""}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeTaskDetail;
