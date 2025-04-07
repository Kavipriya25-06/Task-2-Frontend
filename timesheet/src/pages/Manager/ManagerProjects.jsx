// src\pages\Manager\ManagerProjects.jsx

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const ManagerProjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/projects/`);
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.log("Unable to fetch projects", err);
    }
  };

  const handleAddClick = () => {
    navigate(`create`);
  };

  const handleProjectClick = (project_id) => {
    navigate(`${project_id}`);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div>
      <h2 className="employee-title">Projects</h2>
      <div>
        <button onClick={handleAddClick}>Create Project</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Project code</th>
            <th>Project name</th>
            <th>Building</th>
            <th>Total hours</th>
            <th>Estimated hours</th>
            <th>Discipline</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
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
              <td></td>
              <td></td>
              <td>{project.estimated_hours}</td>
              <td>{project.discipline}</td>
              <td>{project.status ? "Completed" : "In progress"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagerProjects;
