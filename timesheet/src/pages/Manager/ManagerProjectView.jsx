// src\pages\Manager\ManagerProjectView.jsx

import React, { useEffect, useState, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import nextCode from "../../constants/nextCode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAttachmentManager } from "../../constants/useAttachmentManager";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";
import confirm from "../../constants/ConfirmDialog";

const ManagerProjectView = () => {
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [availableTeamleadManager, setAvailableTeamleadManager] = useState([]);
  const [additionalResources, setAdditionalResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [discipline, setDiscipline] = useState([]);
  const [areas, setAreas] = useState([]);
  const buildingPopupRef = useRef();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_title: "",
    project_type: "",
    start_date: "",
    estimated_hours: "",
    project_description: "",
    // project_code: "",
    subdivision: "",
    // discipline_code: "",
    // discipline: "",
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
  const [showVariationPopup, setShowVariationPopup] = useState(false);
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [variations, setVariations] = useState([
    { id: "", date: "", title: "", hours: "", project: "" },
  ]);
  const [newVariations, setNewVariations] = useState({
    date: "",
    title: "",
    hours: "",
  });
  const [showEditVariationPopup, setShowEditVariationPopup] = useState(false);
  const [editVariationData, setEditVariationData] = useState({
    id: null,
    date: "",
    title: "",
    hours: "",
  });

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
    navigate(`buildings/${building_assign_id}`);
  };

  const handleRemoveBuilding = async (building) => {
    // If the building has an assign ID, it exists in DB, so delete.
    if (building.building_assign_id) {
      // const confirmDelete = window.confirm(
      //   `Are you sure you want to remove building "${building?.building?.building_title}"?`
      // );
      const confirmDelete = await confirm({
        message: `Are you sure you want to remove building "${building?.building?.building_title}"?`,
      });
      if (!confirmDelete) return;

      try {
        const res = await fetch(
          `${config.apiBaseURL}/buildings-assigned/${building?.building_assign_id}/`,
          { method: "DELETE" }
        );

        if (res.ok) {
          setAvailableBuildings((prev) =>
            prev.filter(
              (b) => b.building_assign_id !== building.building_assign_id
            )
          );
          showSuccessToast("Sub-Division removed!");
        } else {
          showErrorToast("Failed to delete Sub-Division.");
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

  const handleVariationChange = (index, field, value) => {
    const existingVariations = [...variations];
    existingVariations[index][field] = value;
    setVariations(existingVariations);
  };

  const handleEditVariation = (variation) => {
    setEditVariationData({
      id: variation.id,
      date: variation.date ? new Date(variation.date) : null,
      title: variation.title,
      hours: variation.hours,
    });
    setShowEditVariationPopup(true);
  };

  const handleNewVariationChange = (index, field, value) => {
    const newOnes = [...newVariations];
    newOnes[index][field] = value;
    setNewVariations(newOnes);
  };

  const handleRemoveVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const handleDeleteVariation = async (variationId) => {
    const confirmDelete = await confirm({
      message: `Are you sure you want to delete this variation?`,
    });
    if (!confirmDelete) return;
    // if (!window.confirm("Are you sure you want to delete this variation?"))
    //   return;

    try {
      const response = await fetch(
        `${config.apiBaseURL}/variation/${variationId}/`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        showSuccessToast("Variation deleted successfully");
        fetchProjectData();
      } else {
        showErrorToast("Failed to delete variation");
      }
    } catch (err) {
      console.error("Error deleting variation", err);
      showErrorToast("Server error");
    }
  };

  const handleAddVariation = () => {
    const last = variations[variations.length - 1];
    if (!last || (last.date && last.title && last.hours)) {
      setNewVariations([
        ...newVariations,
        { date: "", title: "", hours: "", project: "" },
      ]);
    } else {
      showWarningToast(
        "Please fill the previous variation before adding a new one."
      );
    }
  };

  const handleUpdate = async () => {
    // 1️ Update Project
    const payload = {
      ...formData,
      start_date: formData.start_date
        ? format(new Date(formData.start_date), "yyyy-MM-dd")
        : null,
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
        showErrorToast("Failed to update project");
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
        showErrorToast("Failed to update project assign");
        return;
      }
    } catch (err) {
      console.error("Project assign update error:", err);
      return;
    }
    // 3️ Handle new and updated variations:
    // const updatedVariations = variations.map(async (variation) => {
    //   if (variation.id) {
    //     // Update existing variation using PATCH
    //     const updateResponse = await fetch(
    //       `${config.apiBaseURL}/variation/${variation.id}/`,
    //       {
    //         method: "PATCH",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(variation),
    //       }
    //     );
    //     if (!updateResponse.ok) {
    //       console.error("Failed to update variation:", variation);
    //       showErrorToast("Failed to update variations");
    //     }
    //   }
    // });

    // const newVariationRequests = newVariations.map(async (newVariation) => {
    //   // Create new variation using POST
    //   const postResponse = await fetch(`${config.apiBaseURL}/variation/`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(newVariation),
    //   });
    //   if (!postResponse.ok) {
    //     console.error("Failed to post new variation:", newVariation);
    //     // showErrorToast("Failed to add new variation");
    //   }
    // });

    // // Wait for all PATCH and POST requests to complete
    // await Promise.all([...updatedVariations, ...newVariationRequests]);

    // // Clear new variations after submission
    // setNewVariations([{ date: "", title: "", hours: "", project: "" }]);

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
        showErrorToast("Failed to update Sub-Division assignments");
        return;
      }
    } catch (err) {
      console.error("Building assign update error:", err);
      return;
    }

    // If all succeeded
    showSuccessToast("Project updated successfully!");
    setEditMode(false);
    setSearchQuery("");
    fetchProjectData(); // refresh UI
  };

  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingData((prev) => ({ ...prev, [name]: value }));
  };

  // console.log("The Project Assign Id isssss ",projectData.assign[0].project_assign_id);

  const handleAddVariationSubmit = async (e) => {
    e.preventDefault();

    if (!newVariations.date && !newVariations.title && !newVariations.hours) {
      showErrorToast("Fill in the details.");
      return;
    }

    const payload = {
      project: project_id,
      date: newVariations.date
        ? format(new Date(newVariations.date), "yyyy-MM-dd")
        : null,
      title: newVariations.title,
      hours: newVariations.hours,
    };

    try {
      const response = await fetch(`${config.apiBaseURL}/variation/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showSuccessToast("Variation added successfully");
        setShowVariationPopup(false);
        setNewVariations({ date: "", title: "", hours: "" });
        fetchProjectData(); // Refresh full data after insertion
      } else {
        showErrorToast("Failed to add variation");
      }
    } catch (err) {
      console.error("Error adding variation", err);
      showErrorToast("Server error");
    }
  };

  const handleEditVariationSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      date: editVariationData.date
        ? format(new Date(editVariationData.date), "yyyy-MM-dd")
        : null,
      title: editVariationData.title,
      hours: editVariationData.hours,
      project: project_id, // if your backend expects project
    };

    try {
      const response = await fetch(
        `${config.apiBaseURL}/variation/${editVariationData.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        showSuccessToast("Variation updated successfully");
        setShowEditVariationPopup(false);
        fetchProjectData(); // refresh variations list
      } else {
        showErrorToast("Failed to update variation");
      }
    } catch (err) {
      console.error("Error updating variation", err);
      showErrorToast("Server error");
    }
  };

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
        showSuccessToast("Sub-Division created successfully!");
        setBuildingData({});
        setShowBuildingPopup(false);
        fetchProjectData(); // Refresh UI
      } else {
        console.error(data);
        showErrorToast("Failed to create Sub-Division.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBuildingCancel = () => {
    setShowBuildingPopup(false);
    setBuildingData({});
    generateBuildingCode();
  };

  useEffect(() => {
    fetchTeamleadManager();
    fetchAdditionalResources();
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
        `${config.apiBaseURL}/emp-details/${user.employee_id}/`
      );
      const data = await response.json();
      setTeamleadManager(data);
      console.log("Team leads and managers", data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  const fetchAdditionalResources = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/additional-resource/${user.employee_id}/`
      );
      const data = await response.json();
      setAdditionalResources(data);
      console.log("Additional resources", data);
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
      setVariations(data.variation);
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

  useEffect(() => {
    generateBuildingCode();
  }, [availableBuildings]);

  const generateBuildingCode = () => {
    let code = availableBuildings?.at(-1)?.building?.building_code;
    let buildingCode = "";
    if (code) {
      buildingCode = code.trim().slice(-1);
    }

    let buildingLetter = buildingCode?.toUpperCase();
    const result = nextCode(buildingLetter);

    setBuildingData((prev) => ({
      ...prev,
      building_code: result,
    }));
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
                {/* <label>
                  Project Code <span className="required-star">*</span>
                </label>
                {editMode ? (
                  <input
                    name="project_code"
                    value={formData.project_code || ""}
                    onChange={handleChange}
                    required
                  />
                ) : (
                  <p className="view-data">{projectData.project_code}</p>
                )} */}
                <label>Project Code</label>
                <p>{projectData?.project_code || ""}</p>
              </div>
              <div className="project-form-group">
                <label>
                  Project Title <span className="required-star">*</span>
                </label>
                {editMode ? (
                  <input
                    name="project_title"
                    value={formData.project_title}
                    onChange={handleChange}
                    required
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
                <label>Discipline Code</label>
                {/* {editMode ? (
                  <select
                    name="discipline_code"
                    value={formData.discipline_code}
                    onChange={(e) => {
                      const selectedCodee = e.target.value;
                      const selectedCode = parseInt(selectedCodee);
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
                  <p className="view-data">
                    {projectData.discipline_code} - {projectData.discipline}
                  </p>
                )} */}
                <p>
                  {projectData.discipline_code} - {projectData.discipline}
                </p>
              </div>
            </div>
            <div className="left-form-second">
              <div className="roles-box">
                <label>Project Roles</label>
                {editMode ? (
                  <div className="select-container">
                    <input
                      type="text"
                      placeholder="Search employee..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "50%",
                        height: "30px",
                        marginLeft: "10px",
                      }}
                    />
                    <div>
                      {teamleadManager
                        .filter((employee) =>
                          employee.employee_name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((employee) => (
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
                    <div>
                      <h4
                        style={{
                          margin: "20px 0 10px",
                          color: "#333",
                          marginLeft: "10px",
                        }}
                      >
                        Additional Resources
                      </h4>
                      {additionalResources
                        .filter((employee) =>
                          employee.employee_name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                        )
                        .map((employee) => (
                          <div
                            key={employee.employee_id}
                            className="employee-checkbox"
                          >
                            {employee.employee_name} - {employee.designation}
                            <input
                              type="checkbox"
                              className="create-checkbox"
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
                                      (id) => id !== employee.employee_id
                                    )
                                  );
                                }
                              }}
                            />
                          </div>
                        ))}
                    </div>
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
                          <th>Title</th>
                          <th>Date</th>
                          <th>Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variations.map((variation, index) => (
                          <tr key={index}>
                            <td>
                              {editMode ? (
                                <div
                                  onClick={() => handleEditVariation(variation)}
                                  style={{
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                >
                                  {variation.title}
                                </div>
                              ) : (
                                variation.title
                              )}
                            </td>
                            <td>
                              {variation.date
                                ? format(
                                    new Date(variation.date),
                                    "dd-MMM-yyyy"
                                  )
                                : ""}
                            </td>
                            <td>
                              {variation.hours}
                              {editMode && (
                                <button
                                  className="tag-variation"
                                  onClick={() =>
                                    handleDeleteVariation(variation.id)
                                  }
                                >
                                  ×
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => setShowVariationPopup(true)}
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
                        src="/pin_svg.svg"
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
                                  src="/pin_svg.svg"
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
                      placeholderText="dd-mm-yyyy"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
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
                    type="number"
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
          {editMode && (
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
          )}
        </div>
        {showBuildingPopup && (
          <div className="building-popup" ref={buildingPopupRef}>
            <div className="create-building-container">
              <h2>Create Sub-Division</h2>
              <form onSubmit={handleBuildingSubmit}>
                <div className="building-elements">
                  <div className="bottom-element">
                    <div>
                      <label>Sub-Division code</label>
                      <br />
                      <input
                        name="building_code"
                        value={buildingData.building_code || ""}
                        onChange={handleBuildingChange}
                        className="bottom-inputs"
                        readOnly
                      />
                    </div>
                    <div>
                      <label>Sub-Division Title</label>
                      <br />
                      <input
                        name="building_title"
                        value={buildingData.building_title || ""}
                        onChange={handleBuildingChange}
                        className="bottom-inputs"
                      />
                    </div>
                  </div>
                  <div className="bottom-element">
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
                        type="number"
                        name="building_hours"
                        value={buildingData.building_hours || ""}
                        onChange={handleBuildingChange}
                        className="sub-division-hours"
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
        {showVariationPopup && (
          <div className="building-popup">
            <div className="create-variation-container">
              <h3>Add Variation</h3>

              <form onSubmit={handleAddVariationSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newVariations.title}
                    onChange={(e) =>
                      setNewVariations((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <div className="date-input-container">
                    <DatePicker
                      selected={newVariations.date}
                      onChange={(date) =>
                        setNewVariations((prev) => ({ ...prev, date }))
                      }
                      dateFormat="dd-MMM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      popperPlacement="right-start"
                      popperModifiers={[
                        {
                          name: "preventOverflow",
                          options: {
                            boundary: "viewport", // you can also try 'window' or 'scrollParent'
                          },
                        },
                      ]}
                      popperClassName="datepicker-popper"
                    />
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label>Hours</label>
                  <input
                    type="number"
                    value={newVariations.hours}
                    onChange={(e) =>
                      setNewVariations((prev) => ({
                        ...prev,
                        hours: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn-green">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-red"
                    onClick={() => {
                      setShowVariationPopup(false);
                      setNewVariations({ date: "", title: "", hours: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditVariationPopup && (
          <div className="building-popup">
            <div className="create-variation-container">
              <h3>Edit Variation</h3>

              <form onSubmit={handleEditVariationSubmit}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={editVariationData.title}
                    onChange={(e) =>
                      setEditVariationData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <div className="date-input-container">
                    <DatePicker
                      selected={editVariationData.date}
                      onChange={(date) =>
                        setEditVariationData((prev) => ({ ...prev, date }))
                      }
                      dateFormat="dd-MMM-yyyy"
                      placeholderText="dd-mm-yyyy"
                      popperPlacement="right-start"
                      popperModifiers={[
                        {
                          name: "preventOverflow",
                          options: {
                            boundary: "viewport", // you can also try 'window' or 'scrollParent'
                          },
                        },
                      ]}
                      popperClassName="datepicker-popper"
                    />
                    <i className="fas fa-calendar-alt calendar-icon"></i>
                  </div>
                </div>

                <div className="form-group">
                  <label>Hours</label>
                  <input
                    type="number"
                    value={editVariationData.hours}
                    onChange={(e) =>
                      setEditVariationData((prev) => ({
                        ...prev,
                        hours: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn-green">
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-red"
                    onClick={() => setShowEditVariationPopup(false)}
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
      <ToastContainerComponent />
    </div>
  );
};

export default ManagerProjectView;
