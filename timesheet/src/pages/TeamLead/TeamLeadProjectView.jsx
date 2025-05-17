// // src\pages\Manager\ManagerProjectView.jsx

// import React, { useEffect, useState } from "react";
// import { FaEdit } from "react-icons/fa";
// import { useAuth } from "../../AuthContext";
// import config from "../../config";
// import { useNavigate, useParams } from "react-router-dom";

// const TeamLeadProjectView = () => {
//   const navigate = useNavigate();
//   const [teamleadManager, setTeamleadManager] = useState([]);

//   const [roleDropdown, setRoleDropdown] = useState("Team Lead");
//   // const [editMode, setEditMode] = useState(false);
//   // const [showBuildingPopup, setShowBuildingPopup] = useState(false);
//   // const [selectedBuildings, setSelectedBuildings] = useState([]);
//   // const [tempBuilding, setTempBuilding] = useState({ name: '', hours: '' });

//   const [availableTeamleadManager, setAvailableTeamleadManager] = useState([]);
//   const [projectData, setProjectData] = useState(null);
//   const [buildings, setBuildings] = useState([]);
//   const [areas, setAreas] = useState([]);
//   const { user } = useAuth();
//   const [formData, setFormData] = useState({
//     project_title: "",
//     project_type: "",
//     start_date: "",
//     estimated_hours: "",
//     project_description: "",
//     project_code: "",
//     subdivision: "",
//     discipline_code: "",
//     discipline: "",
//     area_of_work: [],
//   });
//   const [showBuildingPopup, setShowBuildingPopup] = useState(false);
//   const [showAreaPopup, setShowAreaPopup] = useState(false);
//   const [selectedBuildings, setSelectedBuildings] = useState([]);
//   const [availableBuildings, setAvailableBuildings] = useState([]);
//   const [selectedAreas, setSelectedAreas] = useState([]);
//   const [availableAreas, setAvailableAreas] = useState([]);
//   const { project_id } = useParams();
//   const [editMode, setEditMode] = useState(false); //  Add this at the top

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     console.log("Form data", formData);
//   };
//   console.log("Project ID from URL:", project_id);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const payload = {
//       ...formData,
//       area_of_work: formData.area_of_work.map(Number),
//       created_by: user.employee_id,
//     };

//     try {
//       const response = await fetch(`${config.apiBaseURL}/projects/`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         alert("Project created successfully!");
//         setFormData({ ...formData, project_title: "", project_code: "" });
//       } else {
//         console.error(data);
//         alert(" Failed to create project");
//       }
//     } catch (err) {
//       console.error("Request error:", err);
//     }
//   };

//   const buildingClick = (building_assign_id) => {
//     navigate(`/manager/detail/buildings/${building_assign_id}`);
//   };

//   const handleUpdate = async () => {
//     try {
//       const response = await fetch(
//         `${config.apiBaseURL}/projects/${project_id}/`,
//         {
//           method: "PUT", // or PATCH
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(formData),
//         }
//       );

//       if (response.ok) {
//         alert("Project updated!");
//         setEditMode(false);
//         fetchProjectData(); // refresh
//       } else {
//         alert("Failed to update project");
//       }
//     } catch (err) {
//       console.error("Update error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchTeamleadManager();
//     fetchAreas();
//     fetchBuilding();
//     fetchProjectData();
//   }, [project_id]);

//   const fetchAreas = async () => {
//     try {
//       const res = await fetch(`${config.apiBaseURL}/area-of-work/`);
//       const data = await res.json();
//       setAreas(data);
//     } catch (error) {
//       console.error("Error fetching Area of work:", error);
//     }
//   };

//   const fetchTeamleadManager = async () => {
//     try {
//       const response = await fetch(
//         `${config.apiBaseURL}/teamlead-and-managers/`
//       );
//       const data = await response.json();
//       setTeamleadManager(data);
//       console.log("Team leads and managers", data);
//     } catch (error) {
//       console.error("Error fetching employee data:", error);
//     }
//   };

//   const fetchBuilding = async () => {
//     try {
//       const response = await fetch(`${config.apiBaseURL}/buildings/`);
//       const data = await response.json();
//       setBuildings(data);
//       console.log("Buildings", data);
//     } catch (error) {
//       console.error("Error fetching Buildings:", error);
//     }
//   };

//   const fetchProjectData = async () => {
//     try {
//       const response = await fetch(
//         `${config.apiBaseURL}/projects-screen/${project_id}/`
//       );
//       const data = await response.json();
//       setProjectData(data);
//       setAvailableBuildings(data.assigns[0].buildings);
//       setAvailableTeamleadManager(data.assigns[0].employee);
//       setAvailableAreas(data.area_of_work);

//       console.log("Project data", data);
//       console.log("Project assign data", data.assigns);
//       console.log("buildings assign data", data.assigns[0].buildings); // Check here later Suriya
//       setFormData(data); // clone for edit
//     } catch (error) {
//       console.error("Failed to fetch project:", error);
//     }
//   };

//   if (!projectData) return <p>Loading...</p>;

//   return (
//     <div className="create-project-container">

// <div className="project-header">
//    <h2>{editMode ? "Edit Project" : "View Project"}</h2>
//   {editMode ? (
//             <div></div>
//           ) : (
//             <button
//               type="edit"
//               onClick={() => setEditMode(true)}
//               className="btn-orange"
//             >
//               <FaEdit className="edit-icon" />
//             </button>
//           )}
// </div>
//       <form onSubmit={handleSubmit}>
//       <div className="project-header">
//         <h2>Project: {projectData.project_title}</h2>
//         <div>
//           {!editMode ? (
//             <button
//               type="edit"
//               onClick={() => setEditMode(true)}
//               className="btn-orange"
//             >
//               Edit
//             </button>
//           ) : (
//             <div></div>
//           )}
//         </div>
//       </div>
//       <></>
//       <div>
//         <div className="input-elements">
//           <div className="left-form">
//             <div className="left-form-first">
//               <div className="project-form-group">
//                 <label>Project Title</label>
//                 {editMode ? (
//                   <input
//                     name="project_title"

//                 //     value={projects.project_title}
//                 //     onChange={handleChange}
//                 //   />
//                 // ) : (
//                 //   <p>{projects.project_title}</p>

//                     value={formData.project_title || ""}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   <p>{projectData.project_title}</p>
//                 )}
//               </div>
//               <div className="project-form-group">
//                 <label>Project Type</label>
//                 {editMode ? (
//                   <input
//                     name="project_type"

//                 //     value={projects.project_type}
//                 //     onChange={handleChange}
//                 //   />
//                 // ) : (
//                 //   <p>{projects.project_type}</p>

//                     value={formData.project_type}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   <p>{projectData.project_type}</p>
//                 )}
//               </div>

//               <div className="project-form-group">
//                 <label>Project Code</label>
//                 {editMode ? (
//                   <input
//                     name="project_code"
//                 //     value={projects.project_code}
//                 //     onChange={handleChange}
//                 //   />
//                 // ) : (
//                 //   <p>{projects.project_code}</p>

//                     value={formData.project_code}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   <p>{projectData.project_code}</p>
//                 )}
//               </div>
//               <div className="project-form-group">
//                 <label>Discipline Code</label>
//                 {editMode ? (
//                   <input
//                     name="discipline_code"

//                 //     value={projects.discipline_code}
//                 //     onChange={handleChange}
//                 //   />
//                 // ) : (
//                 //   <p>{projects.discipline_code}</p>

//                     value={formData.discipline_code}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   <p>{projectData.discipline_code}</p>
//                 )}
//               </div>
//             </div>
//             <div className="form-group-full-width">
//               <label>Project Description</label>
//               {editMode ? (
//                 <textarea
//                   name="project_description"
//                   value={projects.project_description}
//                   onChange={handleChange}
//                 />
//               ) : (
//                 <p>{projects.project_description || "No description available."}</p>
//               )}
//             </div>

//             <div className="left-form-second">
//               <div className="building-group">
//                 <label>Building(s)</label>
//                 {editMode ? (
//                   <div className="building-row">
//                     {availableBuildings.map((b, i) => (
//                       <div key={i} className="building-tile">
//                         <div className="building-tile-small">
//                           {console.log("building individual", b)}
//                           {b.building.building_title}
//                         </div>
//                         <div className="building-tile-small">
//                           {b.building_hours} hrs
//                         </div>
//                         <button className="tag-button">×</button>
//                       </div>
//                     ))}
//                     <button
//                       type="button"
//                       onClick={() => setShowBuildingPopup(true)}
//                     >
//                       +
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="building-row">
//                     {availableBuildings.map((b, i) => (
//                       <div key={i} className="building-tile">
//                         <div
//                           onClick={() => buildingClick(b.building_assign_id)}
//                           className="building-tile-small"
//                         >
//                           {console.log("building individual", b)}
//                           {b.building?.building_title}
//                         </div>
//                         <div className="building-tile-small">
//                           {b.building_hours} hrs
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

// <div className="area-group">
//   <label>Area of Work</label>
//   {editMode ? (
//     <div className="area-row">
//       <div className="tags">
//         {areas
//           .filter((a) =>
//             formData.area_of_work.includes(a.area_name)
//           )
//           .map((a) => (
//             <span className="tag" key={a.area_name}>
//               {a.name}
//               <button className="tag-button">×</button>
//             </span>
//           ))}
//       </div>

//       <button
//         type="button"
//         onClick={() => setShowAreaPopup(true)}
//       >
//         +
//       </button>
//     </div>
//   ) : (
//     <div className="tags">
//       {areas
//         .filter((a) =>
//           formData.area_of_work.includes(a.area_name)
//         )
//         .map((a) => (
//           <span className="tag" key={a.area_name}>
//             {a.name}
//             <button className="tag-button">×</button>
//           </span>
//         ))}
//     </div>
//   )}
// </div>

//               <div className="project-form-group">
//                 <label>Sub Division</label>
//                 {editMode ? (
//                   <input
//                     name="subdivision"
//                     value={formData.subdivision}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   <p>{projectData.subdivision}</p>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="right-form">
//             <div className="right-form-first">
//               <div className="project-form-group-small">
//                 <label>Start Date</label>
//                 {editMode ? (
//                   <input
//                     type="date"
//                     name="start_date"
//                     value={formData.start_date}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   <p>{projectData.start_date}</p>
//                 )}
//               </div>
//               <div className="project-form-group-small">
//                 <label>Estd. Hours</label>
//                 {editMode ? (
//                   <input
//                     name="estimated_hours"
//                     value={formData.estimated_hours}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   <p>{projectData.estimated_hours}</p>
//                 )}
//               </div>
//             </div>
//             <div className="right-form-second">
//               <div className="roles-box">
//                 <label>Project Roles</label>
//                 {editMode ? (
//                   <div className="select-container">
//                     {teamleadManager.map((employee) => (
//                       <div
//                         key={employee.employee_id}
//                         className="employee-checkbox"
//                       >
//                         {employee.employee_name} - {employee.designation}
//                         <input
//                           type="checkbox"
//                           value={employee.employee_id}
//                           checked={availableTeamleadManager.some(
//                             (e) => e.employee_id === employee.employee_id
//                           )}
//                           onChange={(e) => {
//                             const checked = e.target.checked;
//                             if (checked) {
//                               setAvailableTeamleadManager((prev) => [
//                                 ...prev,
//                                 employee,
//                               ]);
//                             } else {
//                               setAvailableTeamleadManager((prev) =>
//                                 prev.filter(
//                                   (emp) =>
//                                     emp.employee_id !== employee.employee_id
//                                 )
//                               );
//                             }
//                           }}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="select-container">
//                     {availableTeamleadManager.map((emp) => (
//                       <p key={emp.employee_id}>
//                         {emp.employee_name} - {emp.designation}
//                       </p>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="form-group-full-width">
//                 <label>Project Description</label>

//                 {editMode ? (
//                   <textarea
//                     name="project_description"
//                     value={formData.project_description}
//                     onChange={handleChange}
//                   />
//                 ) : (
//                   <p>{projectData.project_description}</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         {showBuildingPopup && (
//   <div className="popup">
//     <h4>Add Building</h4>

//     <input
//       type="text"
//       placeholder="Building Name"
//       value={tempBuilding.name}
//       onChange={(e) =>
//         setTempBuilding({ ...tempBuilding, name: e.target.value })
//       }
//     />

//     <input
//       type="number"
//       placeholder="Hours"
//       value={tempBuilding.hours}
//       onChange={(e) =>
//         setTempBuilding({ ...tempBuilding, hours: e.target.value })
//       }
//     />

//     <button
//       className="btn-save"
//       onClick={() => {
//         if (tempBuilding.name) {
//           setBuildings([...buildings, tempBuilding]);
//           setTempBuilding({ name: '', hours: '' });
//           setShowBuildingPopup(false);
//         }
//       }}
//     >
//       Done
//     </button>

//     <button
//       className="btn-cancel"
//       onClick={() => {
//         setTempBuilding({ name: '', hours: '' });
//         setShowBuildingPopup(false);
//       }}
//     >
//       Cancel
//     </button>
//   </div>
// )}

//         <div className="form-buttons">
//           {editMode ? (
//             <>
//               <button
//                 type="submit"
//                 onClick={handleUpdate}
//                 className="btn-save"
//               >
//                 Save
//               </button>
//               <button
//                 type="reset"
//                 onClick={() => setEditMode(false)}
//                 className="btn-cancel"
//               >
//                 Delete
//               </button>
//             </>
//           ) : (
//             // <button
//             //   type="edit"
//             //   onClick={() => setEditMode(true)}
//             //   className="btn-orange"
//             // >
//             //   Edit
//             // </button>
//             <div></div>
//           )}
//         </div>
//       </div>
//       {showBuildingPopup && (
//         <div className="popup">
//           <h4>Select Buildings</h4>
//           {buildings.map((b) => (
//             <div key={b.building_id} style={{ marginBottom: "8px" }}>
//               <input
//                 type="checkbox"
//                 value={b.building_id}
//                 onChange={(e) => {
//                   const checked = e.target.checked;
//                   const existing = selectedBuildings.find(
//                     (item) => item.building_id === b.building_id
//                   );

//                   if (checked && !existing) {
//                     setSelectedBuildings((prev) => [
//                       ...prev,
//                       { ...b, hours: "" },
//                     ]);
//                   } else {
//                     setSelectedBuildings((prev) =>
//                       prev.filter((item) => item.building_id !== b.building_id)
//                     );
//                   }
//                 }}
//               />
//               {b.building_title}
//               {selectedBuildings.some(
//                 (s) => s.building_id === b.building_id
//               ) && (
//                 <input
//                   type="number"
//                   placeholder="Hours"
//                   style={{ marginLeft: "10px" }}
//                   onChange={(e) => {
//                     setSelectedBuildings((prev) =>
//                       prev.map((item) =>
//                         item.building_id === b.building_id
//                           ? { ...item, hours: e.target.value }
//                           : item
//                       )
//                     );
//                   }}
//                 />
//               )}
//             </div>
//           ))}
//           <button onClick={() => setShowBuildingPopup(false)}>Done</button>
//           <button
//             onClick={() => {
//               setShowBuildingPopup(false);
//             }}
//           >
//             Cancel
//           </button>
//         </div>
//       )}
// {showAreaPopup && (
//   <div className="popup">
//     <h4>Select Area of Work</h4>
//     {areas.map((a) => (
//       <div key={a.id}>
//         <input
//           type="checkbox"
//           value={a.id}
//           checked={selectedAreas.includes(a.id)}
//           onChange={(e) => {
//             const checked = e.target.checked;
//             if (checked) {
//               setSelectedAreas((prev) => [...prev, a.id]);
//             } else {
//               setSelectedAreas((prev) =>
//                 prev.filter((id) => id !== a.id)
//               );
//             }
//           }}
//         />
//         {a.name}
//       </div>
//     ))}
//     <button
//       onClick={() => {
//         setFormData((prev) => ({ ...prev, area_of_work: selectedAreas }));
//         setShowAreaPopup(false);
//       }}
//     >
//       Done
//     </button>
//     <button
//       onClick={() => {
//         setShowAreaPopup(false);
//       }}
//     >
//       Cancel
//     </button>
//   </div>
// )}
//       </form>
//     </div>
//   );
// };

// export default TeamLeadProjectView;

////

// src\pages\Manager\ManagerProjectView.jsx

import React, { useEffect, useState,useRef} from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate, useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const TeamLeadProjectView = () => {
  const navigate = useNavigate();
  const buildingPopupRef = useRef();
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
    const [discipline, setDiscipline] = useState([]);
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

  const buildingClick = (building_assign_id) => {
    navigate(`/teamlead/detail/buildings/${building_assign_id}`);
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
    { date: "2025-05-07", title: "Code Review", hours: "3" }
  ]);
  
  
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
        { date: "", title: "", hours: "" } // new empty row
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

  useEffect(() => {
    fetchTeamleadManager();
    fetchAreas();
    fetchBuilding();
    fetchProjectData();
    fetchDiscipline();
  }, [project_id]);

  useEffect(() => {
      function handleClickOutside(event) {
        if (buildingPopupRef.current && !buildingPopupRef.current.contains(event.target)) {
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
      <div className="project-header">
        <h2>{editMode ? "Edit Project" : "View Project"}</h2>
        {editMode ? (
          <div></div>
        ) : (
          <button
            type="edit"
            onClick={() => setEditMode(true)}
            className="btn-orange"
            title="Edit"
          >
            <FaEdit className="edit-icon" />
          </button>
        )}
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
                <label>Building(s)</label>
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
                                selected={variation.date ? new Date(variation.date) : null}
                                onChange={(date) =>
                                  handleVariationChange(
                                    index,
                                    "date",
                                    date ? date.toISOString().slice(0, 10) : ""
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
                                  <div className="datepicker-portal">{children}</div>
                                )}
                              />
                              <i className="fas fa-calendar-alt calendar-icon"></i>

                            </div>
                          ) : (
                            variation.date ? format(new Date(variation.date), "dd-MMM-yyyy") : ""
                            
                          )}
                        </td>
                        <td>
                          {editMode ? (
                            <input
                              type="text"
                              placeholder="Enter title"
                              value={variation.title}
                              onChange={(e) => handleVariationChange(index, "title", e.target.value)}
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
                                handleVariationChange(index, "hours", value);
                              }
                            }}                            />
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

              <div className="project-form-group">
                <label className="attaches">Attachments</label>
                {editMode && (
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        attachments: Array.from(e.target.files),
                      }))
                    }
                  />
                )}
                {projectData.attachments && projectData.attachments.length > 0 ? (
                  projectData.attachments.map((file, index) => (
                    <div key={index} style={{ marginBottom: "5px" }}>
                                        <a
                     href={config.apiBaseURL + file.file}
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
                    {file.file.split("/").pop()}
                  </a>

                    </div>
                  ))
                ) :  !editMode ?  (
                  <p>No attachments</p>
                ):null}
              </div>

            </div>
              {/* <div className="area-group">
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
                      className="plus-button"
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
                        selected={formData.start_date ? new Date(formData.start_date) : null}
                        onChange={(date) => handleChange({ target: { name: 'start_date', value: date } })}
                        dateFormat="dd-MMM-yyyy"
                        placeholderText="dd-mm-yyyy"
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
                  <p className="view-description">{projectData.project_description}</p>
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
            <div></div>
          )}
        </div>
      </div>
      {showBuildingPopup && (
        <div className="popup" ref={buildingPopupRef}>
          <h4>Select Buildings</h4>
          {buildings.map((b) => (
            <div key={b.building_id} style={{ marginBottom: "8px" }}>
              <input
                type="checkbox"
                value={b.building_id}
                checked={
                  selectedBuildings.some(
                    (item) => item.building_id === b.building_id
                  ) ||
                  availableBuildings.some(
                    (ab) => ab.building_id === b.building_id
                  )
                }
                onChange={(e) => {
                  const checked = e.target.checked;
                  const existing = selectedBuildings.find(
                    (item) => item.building_id === b.building_id
                  );

                  if (checked && !existing) {
                    const assigned = availableBuildings.find(
                      (ab) => ab.building_id === b.building_id
                    );
                    setSelectedBuildings((prev) => [
                      ...prev,
                      {
                        ...b,
                        building_hours: assigned ? assigned.building_hours : "",
                      },
                    ]);
                  } else if (!checked) {
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
                          ? { ...item, building_hours: e.target.value }
                          : item
                      )
                    );
                  }}
                />
              )}
            </div>
          ))}
          <button
            className="btn-save"
            onClick={() => {
              const invalid = selectedBuildings.find(
                (b) => !b.building_hours || parseFloat(b.building_hours) <= 0
              );

              if (invalid) {
                alert(
                  `Please enter valid hours for building "${invalid.building_title}".`
                );
                return;
              }
              setAvailableBuildings((prev) => [
                ...prev,
                ...selectedBuildings.filter(
                  (b) => !prev.some((ab) => ab.building_id === b.building_id)
                ),
              ]);
              setSelectedBuildings([]);
              setShowBuildingPopup(false);
            }}
          >
            Done
          </button>

          <button
            onClick={() => {
              setSelectedBuildings([]);
              setShowBuildingPopup(false);
            }}
            className="btn-cancel"
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
  );
};

export default TeamLeadProjectView;
