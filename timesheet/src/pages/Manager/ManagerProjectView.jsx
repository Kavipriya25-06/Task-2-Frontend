// src\pages\Manager\ManagerProjectView.jsx

import React, { useEffect, useState, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAttachmentManager } from "../../constants/useAttachmentManager";

const ManagerProjectView = () => {
  const navigate = useNavigate();
  const buildingPopupRef = useRef();
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [availableTeamleadManager, setAvailableTeamleadManager] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [discipline, setDiscipline] = useState([]);
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

  const {
    attachments,
    setAttachments,
    newAttachments,
    setNewAttachments,
    handleAttachmentChange,
    removeExistingAttachment,
    removeNewAttachment,
  } = useAttachmentManager([]);

  const [showBuildingPopup, setShowBuildingPopup] = useState(false);
  const [buildingData, setBuildingData] = useState({});
  const [showAreaPopup, setShowAreaPopup] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
<<<<<<< HEAD

=======
>>>>>>> bb556be17e25b7bfbf4557297666448c0d5cde92
  const [availableAreas, setAvailableAreas] = useState([]);
  const { project_id } = useParams();
  const [editMode, setEditMode] = useState(false); //  Add this at the top

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };
  console.log("Project ID from URL:", project_id);

  const buildingClick = (building_assign_id) => {
    navigate(`/manager/detail/buildings/${building_assign_id}`);
  };

  const handleRemoveBuilding = async (building) => {
    // If the building has an assign ID, it exists in DB, so delete.
    if (building.building_assign_id) {
      const confirmDelete = window.confirm(
        `Are you sure you want to remove building "${building.building.building_title}"?`
      );
      if (!confirmDelete) return;

      try {
        const res = await fetch(
          `${config.apiBaseURL}/buildings-assigned/${building.building_assign_id}/`,
          { method: "DELETE" }
        );

        if (res.ok) {
          setAvailableBuildings((prev) =>
            prev.filter(
              (b) => b.building_assign_id !== building.building_assign_id
            )
          );
          alert("Building removed!");
        } else {
          alert("Failed to delete building.");
        }
      } catch (err) {
        console.error("Error deleting building:", err);
      }
    } else {
      // It's a new building not yet saved → just remove from state
      setAvailableBuildings((prev) =>
        prev.filter((b) => b.building_id !== building.building_id)
      );
    }
  };

  const [variations, setVariations] = useState([
    { date: "2025-05-01", title: "Project Planning", hours: "4" },
    { date: "2025-05-03", title: "Team Meeting", hours: "2" },
    { date: "2025-05-07", title: "Code Review", hours: "3" },
  ]);
<<<<<<< HEAD
  
=======
>>>>>>> bb556be17e25b7bfbf4557297666448c0d5cde92

  const handleVariationChange = (index, field, value) => {
    const newVariations = [...variations];
    newVariations[index][field] = value;
    setVariations(newVariations);
  };

  const handleAddVariation = () => {
    const last = variations[variations.length - 1];

    if (!last || (last.date && last.title && last.hours)) {
      setVariations([
        ...variations,
        { date: "", title: "", hours: "" }, // new empty row
      ]);
    } else {
      alert("Please fill the previous variation before adding a new one.");
    }
  };

  const handleUpdate = async () => {
    // 1️ Update Project
    const payload = {
      ...formData,
      area_of_work: formData.area_of_work,
      created_by: user.employee_id,
    };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/projects/${project_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        alert("Failed to update project");
        return;
      }
    } catch (err) {
      console.error("Project update error:", err);
      return;
    }

    // 2️ Update Project Assign (employees + hours)
    const assignId = projectData.assigns[0].project_assign_id;

    const assignPayload = {
      employee: availableTeamleadManager.map((e) => e.employee_id),
      project_hours: formData.estimated_hours,
      status: "pending",
    };

    try {
      const teamRes = await fetch(
        `${config.apiBaseURL}/projects-assign-update/${assignId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(assignPayload),
        }
      );

      if (!teamRes.ok) {
        alert("Failed to update project assign");
        return;
      }
    } catch (err) {
      console.error("Project assign update error:", err);
      return;
    }

    if (newAttachments.length > 0) {
      for (const file of newAttachments) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("project", project_id);

        const uploadRes = await fetch(`${config.apiBaseURL}/attachments/`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          console.error("Failed to upload file:", file.name);
        }
      }
      setNewAttachments([]);

      // Refresh the list after all uploads
      const attachResponse = await fetch(
        `${config.apiBaseURL}/attachments/project/${project_id}`
      );
      const attachData = await attachResponse.json();
      setAttachments(attachData);
      setNewAttachments([]);
    }

    // const buildingUpdates = availableBuildings.map((b) => ({
    //   building_assign_id: b.building_assign_id || null,
    //   building_id: b.building?.building_id || b.building_id,
    //   building_hours: b.building_hours || 0,
    //   status: "pending",
    // }));

    const buildingUpdates = availableBuildings.map((b) => {
      const update = {
        building_id: b.building?.building_id || b.building_id,
        building_hours: b.building_hours || 0,
        status: "pending",
      };
      if (b.building_assign_id) {
        update.building_assign_id = b.building_assign_id;
      }
      return update;
    });

    try {
      const buildingRes = await fetch(
        `${config.apiBaseURL}/buildings-assign-update/?project_assign_id=${assignId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildingUpdates),
        }
      );

      if (!buildingRes.ok) {
        alert("Failed to update building assignments");
        return;
      }
    } catch (err) {
      console.error("Building assign update error:", err);
      return;
    }

    // If all succeeded
    alert("Project updated successfully!");
    setEditMode(false);
    fetchProjectData(); // refresh UI
  };

  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingData((prev) => ({ ...prev, [name]: value }));
  };

  // console.log("The Project Assign Id isssss ",projectData.assign[0].project_assign_id);

  const handleBuildingSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      building: {
        building_code: buildingData.building_code,
        building_title: buildingData.building_title,
        building_description: buildingData.building_description,
      },
      assign: {
        building_hours: buildingData.building_hours,
        project_assign: projectData.assigns[0].project_assign_id,
        // Optionally omit these if not available
        // employee: [],
        // project_assign: null
      },
    };

    try {
      const res = await fetch(`${config.apiBaseURL}/buildings-create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Building created successfully!");
        setBuildingData({});
        setShowBuildingPopup(false);
        fetchProjectData(); // Refresh UI
      } else {
        console.error(data);
        alert("Failed to create Building.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBuildingCancel = () => {
    setShowBuildingPopup(false);
    setBuildingData({});
  };

  useEffect(() => {
    fetchTeamleadManager();
    fetchAreas();
    fetchBuilding();
    fetchProjectData();
    fetchDiscipline();
  }, [project_id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        buildingPopupRef.current &&
        !buildingPopupRef.current.contains(event.target)
      ) {
        setShowBuildingPopup(false);
      }
    }
    if (showBuildingPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBuildingPopup]);

  const fetchAreas = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/area-of-work/`);
      const data = await res.json();
      setAreas(data);
    } catch (error) {
      console.error("Error fetching Area of work:", error);
    }
  };

  const fetchDiscipline = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/discipline/`);
      const data = await res.json();
      setDiscipline(data);
    } catch (error) {
      console.error("Error fetching Discipline:", error);
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
      // setAvailableAreas(data.area_of_work);

      const attachResponse = await fetch(
        `${config.apiBaseURL}/attachments/project/${project_id}`
      );
      const attachData = await attachResponse.json();
      setAttachments(attachData);
      setNewAttachments([]);

      console.log("Project data", data);
      console.log("Project assign data", data.assigns);
      console.log("buildings assign data", data.assigns[0].buildings); // Check here later Suriya
      setFormData(data); // clone for edit
    } catch (error) {
      console.error("Failed to fetch project:", error);
    }
  };

  // const handleRemoveBuilding = (indexToRemove) => {
  //   setAvailableBuildings((prev) =>
  //     prev.filter((_, index) => index !== indexToRemove)
  //   );
  // };

  const handleRemoveBuildings = (areaName) => {
    setFormData((prevData) => ({
      ...prevData,
      area_of_work: prevData.area_of_work.filter((name) => name !== areaName),
    }));
  };

  if (!projectData) return <p>Loading...</p>;

  return (
    <div className="create-project-container">
      <div className="project-header">
        <h2>{editMode ? "Edit Project" : "View Project"}</h2>
        <div>
          {!editMode ? (
            <button
              type="edit"
              onClick={() => setEditMode(true)}
              className="btn-orange"
              title="Edit"
            >
              <FaEdit className="edit-icon" />
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
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
                  <p className="view-data">{projectData.project_title}</p>
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
                  <p className="view-data">{projectData.project_type}</p>
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
                  <p className="view-data">{projectData.project_code}</p>
                )}
              </div>
              <div className="project-form-group">
                <label>Discipline Code</label>
                {editMode ? (
                  <select
                    name="discipline_code"
                    value={formData.discipline_code}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      const selectedItem = discipline.find(
                        (item) => item.discipline_code === selectedCode
                      );
                      setFormData({
                        ...formData,
                        discipline_code: selectedCode,
                        discipline: selectedItem ? selectedItem.name : "",
                      });
                    }}
                  >
                    <option value="">Select Discipline</option>
                    {discipline.map((item) => (
                      <option key={item.id} value={item.discipline_code}>
                        {item.discipline_code} - {item.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="view-data">{projectData.discipline_code}</p>
                )}
              </div>
            </div>
            <div className="left-form-second">
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
                          className="larger-checkbox"
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
                      <p key={emp.employee_id} className="view-roles">
                        {emp.employee_name} - {emp.designation}
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className="project-form-group">
                <label>Sub-Division</label>
                {editMode ? (
                  <div className="building-row">
                    {availableBuildings.map((b, i) => (
                      <div key={i} className="building-tile">
                        <div className="building-tile-small">
                          {console.log("building individual", b)}
                          {b.building?.building_title || b.building_title}
                        </div>
                        <div className="building-tile-small">
                          {b.building_hours} hrs
                        </div>
                        <button
                          className="tag-button"
                          onClick={() => handleRemoveBuilding(b)}
                        >
                          ×
                        </button>
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
                          {b.building?.building_title}
                        </div>
                        <div className="building-tile-smalls">
                          {b.building_hours} hrs
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="project-form-group">
                <div className="variation-table-wrapper">
                  <label className="attaches">Variation Entries</label>
                  <div className="variation-table-container">
                    <table className="variation-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Title</th>
                          <th>Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variations.map((variation, index) => (
                          <tr key={index}>
                            <td>
                              {editMode ? (
                                <div className="date-wrapper">
                                  <DatePicker
                                    selected={
                                      variation.date
                                        ? new Date(variation.date)
                                        : null
                                    }
                                    onChange={(date) =>
                                      handleVariationChange(
                                        index,
                                        "date",
                                        date
                                          ? date.toISOString().slice(0, 10)
                                          : ""
                                      )
                                    }
                                    dateFormat="dd-MMM-yyyy"
                                    placeholderText="dd-mm-yyyy"
                                    className="input1"
                                    calendarClassName="custom-datepicker"
                                    popperPlacement="bottom-start"
                                    popperModifiers={[
                                      {
                                        name: "preventOverflow",
                                        options: {
                                          boundary: "viewport",
                                        },
                                      },
                                    ]}
                                    popperContainer={({ children }) => (
                                      <div className="datepicker-portal">
                                        {children}
                                      </div>
                                    )}
                                  />
                                  <i className="fas fa-calendar-alt calendar-icon"></i>
                                </div>
                              ) : variation.date ? (
                                format(new Date(variation.date), "dd-MMM-yyyy")
                              ) : (
                                ""
                              )}
                            </td>
                            <td>
                              {editMode ? (
                                <input
                                  type="text"
                                  placeholder="Enter title"
                                  value={variation.title}
                                  onChange={(e) =>
                                    handleVariationChange(
                                      index,
                                      "title",
                                      e.target.value
                                    )
                                  }
                                />
                              ) : (
                                variation.title
                              )}
                            </td>
                            <td>
                              {editMode ? (
                                <input
                                  type="number"
                                  placeholder="Hours"
                                  value={variation.hours}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (Number(value) >= 0 || value === "") {
                                      handleVariationChange(
                                        index,
                                        "hours",
                                        value
                                      );
                                    }
                                  }}
                                />
                              ) : (
                                variation.hours
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {editMode && (
                      <button
                        type="button"
                        onClick={handleAddVariation}
                        className="plus-button"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="project-form-group">
                <label className="attaches">Attachments</label>
<<<<<<< HEAD

                {editMode ? (
                  <div className="plus-upload-wrappers">
                    {/* Upload button */}
                    <label
                      htmlFor="file-upload-input"
                      className="plus-upload-button"
                    >
                      +
                    </label>
                    <input
                      type="file"
                      id="file-upload-input"
                      name="attachments"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      style={{ display: "none" }}
                      onChange={handleAttachmentChange}
                      className="real-file-input"
                    />

                    {/* Show existing and new attachments */}
                    {attachments.length > 0 || newAttachments.length > 0 ? (
                      <div className="selected-files">
                        {/* Existing backend attachments */}
                        {attachments.map((file, index) => {
                          if (!file?.file) return null;
                          const fullFilename = file.file.split("/").pop();
                          const match = fullFilename.match(
                            /^(.+?)_[a-zA-Z0-9]+\.(\w+)$/
                          );
                          const filename = match
                            ? `${match[1]}.${match[2]}`
                            : fullFilename;

                          return (
                            <div
                              key={`existing-${index}`}
                              className="file-chip"
                            >
                              <a
                                href={`${config.apiBaseURL}${file.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="file-name"
                              >
                                {filename}
                              </a>
                              <button
                                type="button"
                                className="remove-file"
                                onClick={async () => {
                                  try {
                                    await fetch(
                                      `${config.apiBaseURL}/attachments/${file.id}/`,
                                      {
                                        method: "DELETE",
                                      }
                                    );
                                    setAttachments((prev) =>
                                      prev.filter((att) => att.id !== file.id)
                                    );
                                  } catch (error) {
                                    console.error(
                                      "Failed to delete attachment:",
                                      error
                                    );
                                  }
                                }}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}

                        {/* New file attachments */}
                        {newAttachments.map((file, index) => (
                          <div key={`new-${index}`} className="file-chip">
                            <a
                              href={URL.createObjectURL(file)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-name"
                            >
                              {file.name}
                            </a>
                            <button
                              type="button"
                              className="remove-file"
                              onClick={() => removeNewAttachment(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#666" }}>No attachments added.</p>
                    )}
                  </div>
                ) : attachments.length > 0 ? (
                  <>
                    {/* 📎 Toggle View */}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowAttachments((prev) => !prev);
                      }}
                      className="view-attachment-link"
                      style={{
                        display: "inline-block",
                        marginBottom: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <img
                        src="/src/assets/pin svg.svg"
                        alt="Attachment"
                        style={{
                          width: "16px",
                          height: "16px",
                          marginRight: "5px",
                          verticalAlign: "middle",
                        }}
                      />
                      {showAttachments
                        ? "Hide Attachments"
                        : "View Attachments"}
                    </a>

                    {/* Render attachments from backend */}
                    {showAttachments && (
                      <ul className="attachment-list">
                        {attachments.map((file, index) => {
                          if (!file?.file) return null;
                          const fullFilename = file.file.split("/").pop();
                          const match = fullFilename.match(
                            /^(.+?)_[a-zA-Z0-9]+\.(\w+)$/
                          );
                          const filename = match
                            ? `${match[1]}.${match[2]}`
                            : fullFilename;

                          return (
                            <li key={index}>
                              <a
                                href={`${config.apiBaseURL}${file.file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="view-attachment-link"
                              >
                                <img
                                  src="/src/assets/pin svg.svg"
                                  alt="Attachment"
                                  style={{
                                    width: "16px",
                                    height: "16px",
                                    marginRight: "5px",
                                    verticalAlign: "middle",
                                  }}
                                />
                                {filename}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                ) : (
                  <p style={{ color: "#666" }}>No attachments added.</p>
                )}
=======
                <a
                  href="#"
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
>>>>>>> bb556be17e25b7bfbf4557297666448c0d5cde92
              </div>
              {/* <div className="project-form-group">
                <label className="area">Area of Work</label>
                <div className="area-row">
                  <div className="tags">
                    {formData.area_of_work.length === 0 ? (
                      <span className="no-data-text">No Area of Work</span>
                    ) : (
                      areas
                        .filter((a) =>
                          formData.area_of_work.includes(a.area_name)
                        )
                        .map((a) => (
                          <span className="tag" key={a.area_name}>
                            {a.name}
                          </span>
                        ))
                    )}
                  </div>

                  {editMode ? (
                    <button
                      className="plus-button"
                      onClick={() => setShowAreaPopup(true)}
                      type="button"
                    >
                      +
                    </button>
                  ) : (
                    <div className="tags">
                      {areas
                        .filter((a) =>
                          formData.area_of_work.includes(a.area_name)
                        )
                        .map((a) => (
                          <span className="tag" key={a.area_name}>
                            {a.name}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                <div className="project-form-group">
                  <label>Sub Division</label>
                  {editMode ? (
                    <input
                      className="subdivision"
                      value={formData.subdivision}
                      onChange={handleChange}
                    />
                  ) : (
                    <p>{projectData.subdivision}</p>
                  )}
                </div>
              </div> */}
            </div>
          </div>
          <div className="right-form">
            <div className="right-form-first">
              <div className="project-form-group-small">
                <label>Start Date</label>
                {editMode ? (
                  <div className="date-input-container">
                    <DatePicker
                      selected={
                        formData.start_date
                          ? new Date(formData.start_date)
                          : null
                      }
                      onChange={(date) =>
                        handleChange({
                          target: { name: "start_date", value: date },
                        })
                      }
                      dateFormat="dd-MMM-yyyy"
                      placeholderText="Select a date"
                    />
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                  </div>
                ) : (
                  <p className="view-date">
                    {formData.start_date &&
                      format(new Date(formData.start_date), "dd-MMM-yyyy")}
                  </p>
                )}
              </div>
              <div className="project-form-group-small">
                <label>Estd. Hours</label>
                {editMode ? (
                  <input
                    name="estimated_hours"
                    value={formData.estimated_hours}
                    onChange={handleChange}
                    className="estd"
                  />
                ) : (
                  <p className="view-data">{projectData.estimated_hours}</p>
                )}
              </div>
            </div>
            <div className="right-form-second">
              <div className="form-group-full-width">
                <label>Project Description</label>
                {editMode ? (
                  <textarea
                    name="project_description"
                    value={formData.project_description}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="view-description">
                    {projectData.project_description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="form-buttons">
          {editMode ? (
            <>
              <button type="submit" onClick={handleUpdate} className="btn-save">
                Save
              </button>
              <button
                type="reset"
                onClick={() => setEditMode(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
            </>
          ) : (
            // <button
            //   type="edit"
            //   onClick={() => setEditMode(true)}
            //   className="btn-orange"
            // >
            //   Edit
            // </button>
            <div></div>
          )}
        </div>
        {showBuildingPopup && (
          <div className="popup" ref={buildingPopupRef}>
            <div className="create-building-container">
              <h2>Create Sub-Division</h2>
              <form onSubmit={handleBuildingSubmit}>
                <div className="building-elements">
                  <div className="top-elements">
                    <div>
                      <label>Sub-Division code</label>
                      <br />
                      <input
                        name="building_code"
                        value={buildingData.building_code || ""}
                        onChange={handleBuildingChange}
                      />
                    </div>
                    <div>
                      <label>Sub-Division Title</label>
                      <br />
                      <input
                        name="building_title"
                        value={buildingData.building_title || ""}
                        onChange={handleBuildingChange}
                      />
                    </div>
                  </div>
                  <div className="bottom-elements">
                    <div>
                      <label>Sub-Division Description</label>
                      <br />
                      <textarea
                        name="building_description"
                        value={buildingData.building_description || ""}
                        onChange={handleBuildingChange}
                        rows={4}
                        className="textarea"
                      />
                    </div>
                    <div>
                      <label>Sub-Division Hours</label>
                      <br />
                      <input
                        name="building_hours"
                        value={buildingData.building_hours || ""}
                        onChange={handleBuildingChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="btn-green">
                    Create
                  </button>
                  <button
                    type="button"
                    className="btn-red"
                    onClick={handleBuildingCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAreaPopup && (
          <div className="popup">
            <h4>Select Area of Work</h4>
            {areas.map((a) => (
              <div key={a.id}>
                <input
                  type="checkbox"
                  value={a.area_name}
                  checked={formData.area_of_work.includes(a.area_name)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (checked) {
                      setFormData((prev) => ({
                        ...prev,
                        area_of_work: [...prev.area_of_work, a.area_name],
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        area_of_work: prev.area_of_work.filter(
                          (area) => area !== a.area_name
                        ),
                      }));
                    }
                  }}
                />
                {a.name}
              </div>
            ))}
            <button
              onClick={() => {
                setShowAreaPopup(false);
              }}
              className="btn-save"
            >
              Done
            </button>
            <button
              onClick={() => {
                setShowAreaPopup(false);
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerProjectView;
