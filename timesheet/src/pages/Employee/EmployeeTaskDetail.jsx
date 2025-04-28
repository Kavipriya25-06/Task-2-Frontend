import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const EmployeeTaskDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.task) {
    return <div>No task selected.</div>;
  }

  const task = state.task;

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.content}>
        {/* <div style={styles.backButtonWrapper}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>Back</button>
        </div> */}

        <div style={styles.projectInfo}>
          <p>
            <strong>Project Title :</strong>{" "}
            {task.building_assign.project_assign.project?.project_title ||
              "N/A"}{" "}
            &nbsp;&nbsp;
            <strong>Project Type :</strong>{" "}
            {task.building_assign.project_assign.project?.project_type || "N/A"}{" "}
            &nbsp;&nbsp;
            <strong>Start Date :</strong>{" "}
            <input
              type="text"
              value={task.start_date || "N/A"}
              readOnly
              style={styles.input}
            />{" "}
            &nbsp;&nbsp;
            <br></br>
            <strong>Estimated Hours :</strong>{" "}
            <input
              type="text"
              value={task?.task_hours || "N/A"}
              readOnly
              style={styles.input}
            />{" "}
            &nbsp;&nbsp;
            <strong>Total Hours :</strong>{" "}
            <input
              type="text"
              value={task.project?.total_hours || "N/A"}
              readOnly
              style={styles.input}
            />
          </p>
        </div>

        {/* Task Details Table Style */}
        <div style={styles.taskTableWrapper}>
          <p>Project Tasks</p>
          <table style={styles.taskTable}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Tasks</th>
                <th style={styles.tableHeader}>Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.tableCell}>
                  {task.task?.task_title || "N/A"}
                </td>
                <td style={styles.tableCell}>{task.task_hours || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    width: "220px",
    background: "#f9f9f9",
    padding: "20px",
    borderRight: "1px solid #ccc",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  sidebarItem: {
    padding: "15px",
    background: "#ddd",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "6px",
  },
  sidebarItemActive: {
    padding: "15px",
    background: "#f9f9aa",
    textAlign: "center",
    cursor: "pointer",
    borderRadius: "6px",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: "30px",
    background: "#f1f7fe",
  },
  backButtonWrapper: {
    marginBottom: "20px",
  },
  backButton: {
    padding: "10px 20px",
    background: "#ddd",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  projectInfo: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  input: {
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    width: "100px",
    textAlign: "center",
  },
  taskTableWrapper: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
  },
  taskTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeader: {
    textAlign: "left",
    paddingBottom: "10px",
    borderBottom: "1px solid #ccc",
  },
  tableCell: {
    padding: "10px 0",
    borderBottom: "1px solid #eee",
  },
};

export default EmployeeTaskDetail;
