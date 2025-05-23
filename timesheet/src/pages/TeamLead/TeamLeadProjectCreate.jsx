import React, { useEffect, useState, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAttachmentManager } from "../../constants/useAttachmentManager";

const TeamLeadProjectCreate = () => {
  const [teamleadManager, setTeamleadManager] = useState([]);
  const buildingPopupRef = useRef();
  const [selectedTeamleadManager, setSelectedTeamleadManager] = useState([]);
  const [discipline, setDiscipline] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [selectedAreas, setSelectedAreas] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };

  //   const handleAttachmentChange = (e) => {
  //   const files = Array.from(e.target.files);
  //   setNewAttachments((prev) => [...prev, ...files]);
  //   e.target.value = ""; // Allow re-selecting same files
  // };

  const handleCancel = () => {
    navigate("/teamlead/detail/projects/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data", formData);
    console.log("Area of work data", selectedAreas);
    console.log("buildings data", selectedBuildings);
    console.log("teamleads data", selectedTeamleadManager);

    if (
      Object.values(formData).every(
        (value) => value === "" || value.length === 0
      )
    ) {
      toast.info("Empty Form", {
        className: "custom-toast",
        bodyClassName: "custom-toast-body",
        progressClassName: "custom-toast-progress",
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      return;
    }

    const payload = {
      project: {
        ...formData,
        area_of_work: formData.area_of_work,
        created_by: user.employee_id,
      },
      assign: {
        employee: selectedTeamleadManager,
        status: "pending",
      },
      buildings: selectedBuildings.map((b) => ({
        building_id: b.building_id,
        building_hours: b.hours,
        status: "pending",
      })),
    };
    console.log("Final payload to send:", payload);

    try {
      const response = await fetch(`${config.apiBaseURL}/projects/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (newAttachments.length > 0) {
        for (const file of newAttachments) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("project", data.project_id);

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
        // const attachResponse = await fetch(
        //   `${config.apiBaseURL}/attachments/project/${project_id}`
        // );
        // const attachData = await attachResponse.json();
        // setAttachments(attachData);
        // setNewAttachments([]);
      }
      if (response.ok) {
        toast.success("All Steps are Completed", {
          className: "custom-toast",
          bodyClassName: "custom-toast-body",
          progressClassName: "custom-toast-progress",
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
        navigate("/teamlead/detail/projects/");
      } else {
        toast.error(
          "Failed to Create Project",
          {
            className: "custom-toast",
            bodyClassName: "custom-toast-body",
            progressClassName: "custom-toast-progress",
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
          },
          data.error
        );
        // alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuildingSubmit = async (e) => {
    e.preventDefault();
    const payload = buildingData;
    try {
      const res = await fetch(`${config.apiBaseURL}/buildings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Buildings Created Successfully", {
          className: "custom-toast",
          bodyClassName: "custom-toast-body",
          progressClassName: "custom-toast-progress",
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
        setBuildingData({});
        setShowBuildingPopup(false);
        fetchBuilding();
      } else {
        console.error(data);
        // alert("Failed to create Building.");
        toast.error("Failed to Create Building.", {
          className: "custom-toast",
          bodyClassName: "custom-toast-body",
          progressClassName: "custom-toast-progress",
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        },data.error);
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
    fetchDiscipline();
  }, []);

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

  return (
    <div className="create-project-container">
      <h2>Create Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-elements">
          <div className="left-form">
            <div className="left-form-first">
              <div className="project-form-group">
                <label>Project Code</label>
                <input
                  name="project_code"
                  value={formData.project_code}
                  onChange={handleChange}
                />
              </div>
              <div className="project-form-group">
                <label>Project Title</label>
                <input
                  name="project_title"
                  value={formData.project_title}
                  onChange={handleChange}
                />
              </div>
              <div className="project-form-group">
                <label>Project Type</label>
                <input
                  name="project_type"
                  value={formData.project_type}
                  onChange={handleChange}
                />
              </div>

              <div className="project-form-group">
                <label>Discipline Code</label>
                <select
                  name="discipline_code"
                  value={formData.discipline_code}
                  onChange={(e) => {
                    const selectedCodee = e.target.value;
                    const selectedCode = parseInt(selectedCodee);
                    const selectedItem = discipline.find(
                      (item) => item.discipline_code === selectedCode
                    );
                    console.log(
                      selectedCode,
                      "Selected code",
                      selectedItem,
                      "Item"
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
              </div>
            </div>
            <div className="left-form-second">
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
                        className="create-checkbox"
                        value={employee.employee_id}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            setSelectedTeamleadManager((prev) => [
                              ...prev,
                              employee.employee_id,
                            ]);
                          } else {
                            setSelectedTeamleadManager((prev) =>
                              prev.filter((id) => id !== employee.employee_id)
                            );
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="project-form-group">
                <label>Sub-Division</label>

                <div className="building-row">
                  {selectedBuildings.map((b, i) => (
                    <div key={i} className="building-tile">
                      <div className="building-tile-small">
                        {b.building_title}
                      </div>
                      <div className="building-tile-small">{b.hours} hrs</div>
                      <button
                        className="tag-button"
                        type="button"
                        onClick={() =>
                          setSelectedBuildings((prev) =>
                            prev.filter(
                              (item) => item.building_id !== b.building_id
                            )
                          )
                        }
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
              </div>

              <div className="project-form-group">
                <div className="file-upload-section">
                  <label className="file-upload-label">Attachments</label>
                  <div className="plus-upload-wrappers">
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

                    {(attachments.length > 0 || newAttachments.length > 0) && (
                      <div className="selected-files">
                        {attachments.map((file, index) => (
                          <div key={index} className="file-chip">
                            <a
                              href={file.url || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="file-name"
                            >
                              {file.name}
                            </a>
                            <button
                              type="button"
                              className="remove-file"
                              onClick={() => removeExistingAttachment(index)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
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
                    )}
                  </div>

                  {/* File list can go here if needed */}
                </div>
              </div>

              {/* <div className="project-form-group">
                <label>Area of Work</label>
                <div className="area-row">
                  <div className="tags">
                    {areas
                      .filter((a) =>
                        formData.area_of_work.includes(a.area_name)
                      )
                      .map((a) => (
                        <div>
                          <span className="tag" key={a.area_name}>
                            {a.name}
                            <button
                              className="tags-button"
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  area_of_work: prev.area_of_work.filter(
                                    (area) => area !== a.area_name
                                  ),
                                }))
                              }
                            >
                              ×
                            </button>
                          </span>
                        </div>
                      ))}
                  </div>

                  <button
                    className="plus-button"
                    type="button"
                    onClick={() => setShowAreaPopup(true)}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="project-form-group">
                <label>Sub Division</label>

                <input
                  name="subdivision"
                  value={formData.subdivision}
                  onChange={handleChange}
                />
              </div> */}
            </div>
          </div>
          <div className="right-form">
            <div className="right-form-first">
              <div className="project-form-group-small">
                <label>Start Date</label>
                <div className="date-input-container">
                  <DatePicker
                    selected={formData.start_date}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        start_date: format(date, "yyyy-MM-dd"),
                      })
                    }
                    dateFormat="dd-MMM-yyyy"
                    placeholderText="dd-mm-yyyy"
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                  {/* Font Awesome Calendar Icon */}
                </div>
              </div>
              <div className="project-form-group-small">
                <label>Estd. Hours</label>
                <input
                  name="estimated_hours"
                  value={formData.estimated_hours}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="right-form-second">
              <div className="form-group-full-width">
                <label>Project Description</label>
                <textarea
                  name="project_description"
                  value={formData.project_description}
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
          <button onClick={() => handleCancel()} className="btn-red">
            Cancel
          </button>
        </div>
      </form>
      {showBuildingPopup && (
        <div className="popup" ref={buildingPopupRef}>
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
                      name="building_hours"
                      value={buildingData.building_hours || ""}
                      onChange={handleBuildingChange}
                      className="bottom-inputs"
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
            <div key={a.area_name}>
              <input
                type="checkbox"
                value={a.area_name}
                checked={selectedAreas.includes(a.area_name)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    setSelectedAreas((prev) => [...prev, a.area_name]);
                  } else {
                    setSelectedAreas((prev) =>
                      prev.filter((area_name) => area_name !== a.area_name)
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

export default TeamLeadProjectCreate;
