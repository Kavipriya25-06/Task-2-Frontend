import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const ManagerProjectCreate = () => {
  const [projectData, setProjectData] = useState({
    project_title: "",
    project_type: "",
    start_date: "",
    estimated_hours: "",
    project_code: "",
    discipline_code: "",
    area_of_work: [],
    subdivision: "",
    project_description: "",
    project_roles: [],
  });

  const [buildings, setBuildings] = useState([{ name: "", hours: "" }]);
  const [areaInput, setAreaInput] = useState("");
  const [employees, setEmployees] = useState([]);
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [roleDropdown, setRoleDropdown] = useState("Team Lead");

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
  }, []);

  const fetchTeamleadManager = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/teamlead-and-managers/`
      );
      const data = await response.json();
      setTeamleadManager(data);
      console.log("Team leads and managers", data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      project_title,
      project_type,
      start_date,
      estimated_hours,
      project_description,
      area_of_work: selectedAreas.join(", "), // Convert tags to string
      project_code,
      subdivision,
      discipline_code,
      discipline,
      status: true,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/projects/create/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Project created successfully!");
      } else {
        console.error(data);
        alert("Failed to create project.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="create-project-container">
      <h2>Create Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-elements">
          <div className="left-form">
            <div className="left-form-first">
              <div className="project-form-group">
                <label>Project Title</label>
                <input
                  name="project_title"
                  value={projectData.project_title}
                  onChange={handleChange}
                />
              </div>
              <div className="project-form-group">
                <label>Project Type</label>
                <input
                  name="project_type"
                  value={projectData.project_type}
                  onChange={handleChange}
                />
              </div>

              <div className="project-form-group">
                <label>Project Code</label>
                <input
                  name="project_code"
                  value={projectData.project_code}
                  onChange={handleChange}
                />
              </div>
              <div className="project-form-group">
                <label>Discipline Code</label>
                <input
                  name="discipline_code"
                  value={projectData.discipline_code}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="left-form-second">
              <div className="building-group">
                <label>Building(s)</label>
                {buildings.map((b, idx) => (
                  <div className="building-row" key={idx}>
                    {/* <input
                      placeholder="Building Name"
                      value={b.name}
                      onChange={(e) =>
                        handleBuildingChange(idx, "name", e.target.value)
                      }
                    /> */}
                    {/* <input
                      placeholder="Hours"
                      value={b.hours}
                      onChange={(e) =>
                        handleBuildingChange(idx, "hours", e.target.value)
                      }
                    /> */}
                    {/* <button type="button" onClick={() => removeBuilding(idx)}>
                      Delete
                    </button> */}
                    <button type="button" onClick={addBuilding}>
                      +
                    </button>
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
                    {projectData.area_of_work.map((area) => (
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
                    value={projectData.subdivision}
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
                  value={projectData.start_date}
                  onChange={handleChange}
                />
              </div>
              <div className="project-form-group-small">
                <label>Estd. Hours</label>
                <input
                  name="estimated_hours"
                  value={projectData.estimated_hours}
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
                      {employee.employee_name} - {employee.designation}
                      <input
                        type="checkbox"
                        value={employee.employee_id}
                        // checked={selectedEmployees.includes(
                        //   employee.employee_id
                        // )}
                        // onChange={() =>
                        //   handleCheckboxChange(employee.employee_id)
                        // }
                      />
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
                        checked={projectData.project_roles.includes(name)}
                        onChange={() => toggleRole(name)}
                      />
                      {name} <i>{roleDropdown}</i>
                    </label>
                  ))}
                </div> */}
              </div>

              <div className="form-group-full-width">
                <label>Project Description</label>
                <textarea
                  name="project_description"
                  value={projectData.project_description}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-green">
            Create
          </button>
          <button type="reset" className="btn-red">
            Delete
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerProjectCreate;
