// src\pages\Manager\ManagerTeamLeaders.jsx

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const ManagerTeamLeaders = () => {
  const { user } = useAuth();
  const [teamLeads, setTeamLeads] = useState([]);
  const [managerName, setManagerName] = useState("");
  const [selectedProject, setSelectedProject] = useState(null); // State to track selected project
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetchTeamleadManager();
  }, []);

  const fetchTeamleadManager = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/teamlead-managers-projects/${user.employee_id}/`
      );
      const data = await response.json();
      setManagerName(data.manager_name);
      setTeamLeads(data.teamleads);
      console.log("User details", user);
      console.log("Data", data);
    } catch (err) {
      console.log("Unable to fetch details", err);
    }
  };

  const fetchProjects = async (ProjectId) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/projects/${ProjectId}`
      );
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.log("Unable to fetch projects", err);
    }
  };

  const handleProjectClick = (teamleadId, ProjectId) => {
    // Logic for handling project click
    // In a real-world scenario, you could fetch the project details here using its ID
    fetchProjects(ProjectId);
    const selected = teamLeads.find((tl) => tl.teamlead_id === teamleadId);
    // .projects.find((project) => project.name === projectName);

    setSelectedProject(selected); // Set selected project data
  };

  return (
    <div className="manager-team-leads">
      {/* <h2>Team Leads under Manager: {managerName}</h2> */}
      <div className="team-leads-container">
        {teamLeads.map((teamlead) => (
          <div className="teamlead-card" key={teamlead.teamlead_id}>
            <h3>{teamlead.teamlead_name}</h3>
            <div className="teamlead-stats">
              <div className="projects-container">
                <div className="projects">
                  <span>Projects: {teamlead.total_projects}</span>
                </div>
              </div>
              <div className="employees-container">
                <div className="employees">
                  <span>Employees: {teamlead.total_employees}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerTeamLeaders;
