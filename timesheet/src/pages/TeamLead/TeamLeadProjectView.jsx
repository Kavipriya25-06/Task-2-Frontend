// src\pages\Manager\ManagerProjectView.jsx

import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";




const TeamLeadProjectView = () => {
  const [projectData, setProjectData] = useState({
    project_title: "",
    project_type: "",
    start_date: "",
    estimated_hours: "",
    project_code: "",
    discipline_code: "",
    discipline: "",
    area_of_work: [],
    subdivision: "",
    project_description: "",
    project_roles: [],
  });
  const [projects, setProjects] = useState({
    project_title: "",
    project_type: "",
    start_date: "",
    estimated_hours: "",
    project_code: "",
    discipline_code: "",
    discipline: "",
    area_of_work: [],
    subdivision: "",
    project_description: "",
    project_roles: [],
  });
  const { project_id } = useParams();
  const [buildings, setBuildings] = useState([{ name: "", hours: "" }]);
  const [areaInput, setAreaInput] = useState("");
  const [employees, setEmployees] = useState([]);
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [roleDropdown, setRoleDropdown] = useState("Team Lead");
  const [editMode, setEditMode] = useState(false); 
  const [showBuildingPopup, setShowBuildingPopup] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [tempBuilding, setTempBuilding] = useState({ name: '', hours: '' });


  
  const { user } = useAuth();
  // console.log("User details", user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuildingChange = (index, field, value) => {
    const newBuildings = [...buildings];
    newBuildings[index][field] = value;
    setBuildings(newBuildings);
  };

  const addBuilding = () => {
    setBuildings([...buildings, { name: "", hours: "" }]);
  };

  const removeBuilding = (index) => {
    setBuildings(buildings.filter((_, i) => i !== index));
  };

  const addAreaOfWork = () => {
    if (areaInput && !projectData.area_of_work.includes(areaInput)) {
      setProjectData((prev) => ({
        ...prev,
        area_of_work: [...prev.area_of_work, areaInput],
      }));
      setAreaInput("");
    }
  };

  const removeArea = (area) => {
    setProjectData((prev) => ({
      ...prev,
      area_of_work: prev.area_of_work.filter((a) => a !== area),
    }));
  };

  const toggleRole = (name) => {
    setProjectData((prev) => {
      const exists = prev.project_roles.includes(name);
      return {
        ...prev,
        project_roles: exists
          ? prev.project_roles.filter((r) => r !== name)
          : [...prev.project_roles, name],
      };
    });
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const payload = {
  //     ...projectData,
  //     buildings,
  //   };
  //   console.log("Submitting project:", payload);
  //   // send to backend via fetch/axios here
  // };

  useEffect(() => {
    fetchTeamleadManager();
    fetchProjects();
  }, []);

  const fetchTeamleadManager = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/teamlead-and-managers/`
      );
      const data = await response.json();
      setTeamleadManager(data);
      // console.log("Team leads and managers", data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/projects/${project_id}/`
      );
      const data = await response.json();
      setProjects(data);
      // console.log("Projects", data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const payload = {
    //   project_title,
    //   project_type,
    //   start_date,
    //   estimated_hours,
    //   project_description,
    //   area_of_work: selectedAreas.join(", "), // Convert tags to string
    //   project_code,
    //   subdivision,
    //   discipline_code,
    //   discipline,
    //   status: true,
    // };

    // try {
    //   const res = await fetch(`${config.apiBaseURL}/projects/`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });

    //   const data = await res.json();
    //   if (res.ok) {
    //     alert("Project created successfully!");
    //   } else {
    //     console.error(data);
    //     alert("Failed to create project.");
    //   }
    // } catch (error) {
    //   console.error("Error:", error);
    // }
  };

  if (!projects) return <p>Loading...</p>;

  return (
    <div className="create-project-container">

      <div className="project-header">
         <h2>{editMode ? "Edit Project" : "View Project"}</h2>
        {editMode ? (
                  <div></div>
                ) : (
                  <button
                    type="edit"
                    onClick={() => setEditMode(true)}
                    className="btn-orange"
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
                <label>Project Title</label>
                {editMode ? (
                  <input
                    name="project_title"
                    value={projects.project_title}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projects.project_title}</p>
                )}
              </div>
              <div className="project-form-group">
                <label>Project Type</label>
                {editMode ? (
                  <input
                    name="project_type"
                    value={projects.project_type}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projects.project_type}</p>
                )}
              </div>

              <div className="project-form-group">
                <label>Project Code</label>
                {editMode ? (
                  <input
                    name="project_code"
                    value={projects.project_code}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projects.project_code}</p>
                )}
              </div>
              <div className="project-form-group">
                <label>Discipline Code</label>
                {editMode ? (
                  <input
                    name="discipline_code"
                    value={projects.discipline_code}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projects.discipline_code}</p>
                )}
              </div>
            </div>
            <div className="form-group-full-width">
              <label>Project Description</label>
              {editMode ? (
                <textarea
                  name="project_description"
                  value={projects.project_description}
                  onChange={handleChange}
                />
              ) : (
                <p>{projects.project_description || "No description available."}</p>
              )}
            </div>

            <div className="left-form-second">
            <div className="building-group">
  <label>Building(s)</label>

  {buildings.map((b, idx) => (
    <div className="building-row" key={idx}>
      <span className="building-tile">
        {b.name}
        {b.hours && ` - ${b.hours} hrus`}
      </span>

      {editMode && b.name && b.hours && (
        <button
          className="tag-buttons"
          onClick={() => removeBuilding(idx)}
        >
          ×
        </button>
      )}
       {editMode && (
    <button
      className="plus-buttons"
      onClick={() => setShowBuildingPopup(true)}
    >
      +
    </button>
  )}
    </div>
  ))}
</div>





              <div className="area-group">
                <label>Area of Work</label>
                {/* <input
                  value={areaInput}
                  onChange={(e) => setAreaInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addAreaOfWork())
                  }
                /> */}
                <div className="area-row">
                  {/* <div className="tags">
                    {projects.area_of_work.map((area) => (
                      <span className="tag" key={area}>
                        {area}{" "}
                        <button onClick={() => removeArea(area)}>x</button>
                      </span>
                    ))}
                  </div> */}
                </div>
              </div>

              <div className="subdivision-group">
                <label>Sub Division</label>
                <div className="subdivision-row">
                  {/* <input
                    name="subdivision"
                    value={projects.subdivision}
                    onChange={handleChange}
                  /> */}
                </div>
              </div>
            </div>
          </div>
          <div className="right-form">
            <div className="right-form-first">
              <div className="project-form-group-small">
                <label>Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={projects.start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="project-form-group-small">
                <label>Estd. Hours</label>
                <input
                  name="estimated_hours"
                  value={projects.estimated_hours}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="right-form-second">
              <div className="roles-box">
                <label>Project Roles</label>
                <div className="select-container">
                  {teamleadManager.map((employee) => (
                    <div
                      key={employee.employee_id}
                      className="employee-checkbox"
                    >
                      {/* {employee.employee_name} - {employee.designation}
                      <input
                        type="checkbox"
                        value={employee.employee_id}
                        // checked={selectedEmployees.includes(
                        //   employee.employee_id
                        // )}
                        // onChange={() =>
                        //   handleCheckboxChange(employee.employee_id)
                        // }
                      /> */}
                    </div>
                  ))}
                </div>
                {/* <select
                  value={roleDropdown}
                  onChange={(e) => setRoleDropdown(e.target.value)}
                >
                  <option>Team Lead</option>
                  <option>Manager</option>
                  </select>

                <div className="role-checks">
                  {["Yash", "Aarav", "Kriti", "Sana"].map((name) => (
                    <label key={name}>
                      <input
                        type="checkbox"
                        checked={projects.project_roles.includes(name)}
                        onChange={() => toggleRole(name)}
                      />
                      {name} <i>{roleDropdown}</i>
                    </label>
                  ))}
                </div> */}
              </div>

              {/* <div className="form-group-full-width">
                <label>Project Description</label>
                <textarea
                  name="project_description"
                  value={projects.project_description}
                  onChange={handleChange}
                />
              </div> */}
            </div>
          </div>
        </div>
        {showBuildingPopup && (
  <div className="popup">
    <h4>Add Building</h4>

    <input
      type="text"
      placeholder="Building Name"
      value={tempBuilding.name}
      onChange={(e) =>
        setTempBuilding({ ...tempBuilding, name: e.target.value })
      }
    />

    <input
      type="number"
      placeholder="Hours"
      value={tempBuilding.hours}
      onChange={(e) =>
        setTempBuilding({ ...tempBuilding, hours: e.target.value })
      }
    />

    <button
      className="btn-save"
      onClick={() => {
        if (tempBuilding.name) {
          setBuildings([...buildings, tempBuilding]);
          setTempBuilding({ name: '', hours: '' });
          setShowBuildingPopup(false);
        }
      }}
    >
      Done
    </button>

    <button
      className="btn-cancel"
      onClick={() => {
        setTempBuilding({ name: '', hours: '' });
        setShowBuildingPopup(false);
      }}
    >
      Cancel
    </button>
  </div>
)}




        <div className="form-buttons">
          {editMode ? (
            <>
              <button
                type="submit"
                className="btn-save"
              >
                Create
              </button>
              <button
                type="reset"
                onClick={() => setEditMode(false)}
                className="btn-cancel"
              >
                Delete
              </button>
            </>
          ) : (
            <div></div>
          )}
        </div>
      </form>
    </div>
  );
};

export default TeamLeadProjectView;
