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
    discipline: "",
    area_of_work: [],
    subdivision: "",
    project_description: "",
    project_roles: [],
  });

  const [buildings, setBuildings] = useState([{ name: "", hours: "" }]);
  const [areas, setAreas] = useState([]);
  const [formData, setFormData] = useState({
    project_title: "",
    project_type: "",
    start_date: "",
    estimated_hours: "",
    project_description: "",
    project_code: "",
    subdivision: "",
    discipline_code: "",
    discipline: "",
    area_of_work: [],
  });

  const [teamleadManager, setTeamleadManager] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setFormData((prev) => ({ ...prev, area_of_work: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      area_of_work: formData.area_of_work.map(Number),
      created_by: user.employee_id,
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/projects/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Project created successfully!");
        setFormData({ ...formData, project_title: "", project_code: "" });
      } else {
        console.error(data);
        alert(" Failed to create project");
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  const addBuilding = () => {};

  useEffect(() => {
    fetchTeamleadManager();
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    const res = await fetch(`${config.apiBaseURL}/area-of-work/`);
    const data = await res.json();
    setAreas(data);
  };

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
              <div className="project-form-group">
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

              <div className="project-form-group">
                <label>Area of Work</label>
                {/* <input
                  // className="area-input-full"
                  type="text"
                  name="subdivision"
                  value={projectData.subdivision}
                  onChange={handleChange}
                /> */}
                <select
                  multiple
                  value={formData.area_of_work}
                  onChange={handleAreaChange}
                >
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>

                {/* <div className="area-row"> */}
                {/* <input
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addAreaOfWork())
                    }
                  /> */}
                {/* <input
                    type="text"
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    placeholder="Enter area and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAreaOfWork();
                      }
                    }}
                    className="area-input-full"
                  /> */}

                {/* <div className="tags">
                    {projectData.area_of_work.map((area) => (
                      <span className="tag" key={area}>
                        {area}{" "}
                        <button onClick={() => removeArea(area)}>x</button>
                      </span>
                    ))}
                  </div> */}
                {/* <input
                    type="text"
                    name="areaInput"
                    value={projectData.subdivision}
                    onChange={handleChange}
                  /> */}
                {/* </div> */}
              </div>

              <div className="project-form-group">
                <label>Sub Division</label>
                {/* <div className="subdivision-row"> */}
                <input
                  // className="subdivision-row"
                  name="subdivision"
                  value={projectData.subdivision}
                  onChange={handleChange}
                />
              </div>
              {/* </div> */}
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
