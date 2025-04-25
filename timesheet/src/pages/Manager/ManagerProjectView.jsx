// src\pages\Manager\ManagerProjectView.jsx

import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";

const ManagerProjectView = () => {
  const navigate = useNavigate();
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [availableTeamleadManager, setAvailableTeamleadManager] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();
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
  const [showBuildingPopup, setShowBuildingPopup] = useState(false);
  const [showAreaPopup, setShowAreaPopup] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const { project_id } = useParams();
  const [editMode, setEditMode] = useState(false); //  Add this at the top

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };
  console.log("Project ID from URL:", project_id);

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

  const buildingClick = (building_assign_id) => {
    navigate(`/manager/detail/buildings/${building_assign_id}`);
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/projects/${project_id}/`,
        {
          method: "PUT", // or PATCH
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert("Project updated!");
        setEditMode(false);
        fetchProjectData(); // refresh
      } else {
        alert("Failed to update project");
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  useEffect(() => {
    fetchTeamleadManager();
    fetchAreas();
    fetchBuilding();
    fetchProjectData();
  }, [project_id]);

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/area-of-work/`);
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      console.error("Error fetching Area of work:", error);
    }
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

  const fetchBuilding = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/buildings/`);
      const data = await response.json();
      setBuildings(data);
      console.log("Buildings", data);
    } catch (error) {
      console.error("Error fetching Buildings:", error);
    }
  };

  const fetchProjectData = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/projects-screen/${project_id}/`
      );
      const data = await response.json();
      setProjectData(data);
      setAvailableBuildings(data.assigns[0].buildings);
      setAvailableTeamleadManager(data.assigns[0].employee);
      setAvailableAreas(data.area_of_work);

      console.log("Project data", data);
      console.log("Project assign data", data.assigns);
      console.log("buildings assign data", data.assigns[0].buildings); // Check here later Suriya
      setFormData(data); // clone for edit
    } catch (error) {
      console.error("Failed to fetch project:", error);
    }
  };

  if (!projectData) return <p>Loading...</p>;

  return (
    <div className="create-project-container">
      <h2>Project: {projectData.project_title}</h2>
      <div>
        <div className="input-elements">
          <div className="left-form">
            <div className="left-form-first">
              <div className="project-form-group">
                <label>Project Title</label>
                {editMode ? (
                  <input
                    name="project_title"
                    value={formData.project_title || ""}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projectData.project_title}</p>
                )}
              </div>
              <div className="project-form-group">
                <label>Project Type</label>
                {editMode ? (
                  <input
                    name="project_type"
                    value={formData.project_type}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projectData.project_type}</p>
                )}
              </div>

              <div className="project-form-group">
                <label>Project Code</label>
                {editMode ? (
                  <input
                    name="project_code"
                    value={formData.project_code}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projectData.project_code}</p>
                )}
              </div>
              <div className="project-form-group">
                <label>Discipline Code</label>
                {editMode ? (
                  <input
                    name="discipline_code"
                    value={formData.discipline_code}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projectData.discipline_code}</p>
                )}
              </div>
            </div>
            <div className="left-form-second">
              <div className="project-form-group">
                <label>Building(s)</label>
                {editMode ? (
                  <div className="building-row">
                    {availableBuildings.map((b, i) => (
                      <div key={i} className="building-tile">
                        <div className="building-tile-small">
                          {console.log("building individual", b)}
                          {b.building.building_title}
                        </div>
                        <div className="building-tile-small">
                          {b.building_hours} hrs
                        </div>
                        <button className="tag-button">×</button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowBuildingPopup(true)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="building-row">
                    {availableBuildings.map((b, i) => (
                      <div key={i} className="building-tile">
                        <div
                          onClick={() => buildingClick(b.building_assign_id)}
                          className="building-tile-small"
                        >
                          {console.log("building individual", b)}
                          {b.building?.building_title}
                        </div>
                        <div className="building-tile-small">
                          {b.building_hours} hrs
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="project-form-group">
                <label>Area of Work</label>
                {editMode ? (
                  <div className="area-row">
                    <div className="tags">
                      {areas
                        .filter((a) =>
                          formData.area_of_work.includes(a.area_name)
                        )
                        .map((a) => (
                          <span className="tag" key={a.area_name}>
                            {a.name}
                            <button className="tag-button">×</button>
                          </span>
                        ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAreaPopup(true)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div className="tags">
                    {areas
                      .filter((a) =>
                        formData.area_of_work.includes(a.area_name)
                      )
                      .map((a) => (
                        <span className="tag" key={a.area_name}>
                          {a.name}
                          <button className="tag-button">×</button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div className="project-form-group">
                <label>Sub Division</label>
                {editMode ? (
                  <input
                    name="subdivision"
                    value={formData.subdivision}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projectData.subdivision}</p>
                )}
              </div>
            </div>
          </div>
          <div className="right-form">
            <div className="right-form-first">
              <div className="project-form-group-small">
                <label>Start Date</label>
                {editMode ? (
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projectData.start_date}</p>
                )}
              </div>
              <div className="project-form-group-small">
                <label>Estd. Hours</label>
                {editMode ? (
                  <input
                    name="estimated_hours"
                    value={formData.estimated_hours}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projectData.estimated_hours}</p>
                )}
              </div>
            </div>
            <div className="right-form-second">
              <div className="roles-box">
                <label>Project Roles</label>
                {editMode ? (
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
                          checked={availableTeamleadManager.some(
                            (e) => e.employee_id === employee.employee_id
                          )}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            if (checked) {
                              setAvailableTeamleadManager((prev) => [
                                ...prev,
                                employee,
                              ]);
                            } else {
                              setAvailableTeamleadManager((prev) =>
                                prev.filter(
                                  (emp) =>
                                    emp.employee_id !== employee.employee_id
                                )
                              );
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="select-container">
                    {availableTeamleadManager.map((emp) => (
                      <p key={emp.employee_id}>
                        {emp.employee_name} - {emp.designation}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group-full-width">
                <label>Project Description</label>
                {editMode ? (
                  <textarea
                    name="project_description"
                    value={formData.project_description}
                    onChange={handleChange}
                  />
                ) : (
                  <p>{projectData.project_description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-buttons">
          {editMode ? (
            <>
              <button
                type="submit"
                onClick={handleUpdate}
                className="btn-green"
              >
                Save
              </button>
              <button
                type="reset"
                onClick={() => setEditMode(false)}
                className="btn-red"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="edit"
              onClick={() => setEditMode(true)}
              className="btn-orange"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      {showBuildingPopup && (
        <div className="popup">
          <h4>Select Buildings</h4>
          {buildings.map((b) => (
            <div key={b.building_id} style={{ marginBottom: "8px" }}>
              <input
                type="checkbox"
                value={b.building_id}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const existing = selectedBuildings.find(
                    (item) => item.building_id === b.building_id
                  );

                  if (checked && !existing) {
                    setSelectedBuildings((prev) => [
                      ...prev,
                      { ...b, hours: "" },
                    ]);
                  } else {
                    setSelectedBuildings((prev) =>
                      prev.filter((item) => item.building_id !== b.building_id)
                    );
                  }
                }}
              />
              {b.building_title}
              {selectedBuildings.some(
                (s) => s.building_id === b.building_id
              ) && (
                <input
                  type="number"
                  placeholder="Hours"
                  style={{ marginLeft: "10px" }}
                  onChange={(e) => {
                    setSelectedBuildings((prev) =>
                      prev.map((item) =>
                        item.building_id === b.building_id
                          ? { ...item, hours: e.target.value }
                          : item
                      )
                    );
                  }}
                />
              )}
            </div>
          ))}
          <button onClick={() => setShowBuildingPopup(false)}>Done</button>
          <button
            onClick={() => {
              setShowBuildingPopup(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}
      {showAreaPopup && (
        <div className="popup">
          <h4>Select Area of Work</h4>
          {areas.map((a) => (
            <div key={a.id}>
              <input
                type="checkbox"
                value={a.id}
                checked={selectedAreas.includes(a.id)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    setSelectedAreas((prev) => [...prev, a.id]);
                  } else {
                    setSelectedAreas((prev) =>
                      prev.filter((id) => id !== a.id)
                    );
                  }
                }}
              />
              {a.name}
            </div>
          ))}
          <button
            onClick={() => {
              setFormData((prev) => ({ ...prev, area_of_work: selectedAreas }));
              setShowAreaPopup(false);
            }}
          >
            Done
          </button>
          <button
            onClick={() => {
              setShowAreaPopup(false);
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default ManagerProjectView;
