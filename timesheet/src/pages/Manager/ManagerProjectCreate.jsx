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

const ManagerProjectCreate = () => {
  const [teamleadManager, setTeamleadManager] = useState([]);
  const buildingPopupRef = useRef();
  // const { employee_id } = useParams();
  const [selectedTeamleadManager, setSelectedTeamleadManager] = useState([]);
  const [discipline, setDiscipline] = useState([]);
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
  });
  const [showBuildingPopup, setShowBuildingPopup] = useState(false);
  const [buildingData, setBuildingData] = useState({});
  const [selectedBuildings, setSelectedBuildings] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };

  const handleCancel = () => {
    navigate("/manager/detail/projects/");
  };

  const {
    attachments,
    setAttachments,
    newAttachments,
    setNewAttachments,
    handleAttachmentChange,
    removeExistingAttachment,
    removeNewAttachment,
  } = useAttachmentManager([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data", formData);
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

        created_by: user.employee_id,
      },
      assign: {
        employee: selectedTeamleadManager,
        status: "pending",
      },
      buildings: selectedBuildings.map((b) => ({
        building_title: b.building_title,
        building_description: b.building_description,
        building_code: b.building_code,
        employee: [],
        building_hours: b.building_hours,
        // status: "pending",
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
      console.log(data);

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
      }

      if (response.ok) {
        toast.success("Project Created Successfully", {
          className: "custom-toast",
          bodyClassName: "custom-toast-body",
          progressClassName: "custom-toast-progress",
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
        navigate("/manager/detail/projects/");
      } else {
        toast.error("Failed to Create project" + data.error);
      }
    } catch (err) {
      console.error("Request error:", err);
    }
  };

  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuildingSubmit = (e) => {
    e.preventDefault();

    if (
      !buildingData.building_code ||
      !buildingData.building_title ||
      !buildingData.building_hours
    ) {
      toast.warning("Please fill all Sub-Division fields");
      return;
    }

    setSelectedBuildings((prev) => [...prev, buildingData]);

    setBuildingData({});
    setShowBuildingPopup(false);
  };

  const handleBuildingCancel = () => {
    setShowBuildingPopup(false);
    setBuildingData({});
  };

  useEffect(() => {
    fetchTeamleadManager();
    fetchDiscipline();
  }, []);

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

  return (
    <div className="create-project-container">
      <h2>Create Project</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-elements">
          <div className="left-form">
            <div className="left-form-first">
              <div className="project-form-group">
                <label>
                  Project Code <span className="required-star">*</span>
                </label>
                <input
                  name="project_code"
                  value={formData.project_code}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="project-form-group">
                <label>
                  Project Title <span className="required-star">*</span>
                </label>
                <input
                  name="project_title"
                  value={formData.project_title}
                  onChange={handleChange}
                  required
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
                <label>Sub-Division(s)</label>

                <div className="building-row">
                  {selectedBuildings.map((b, i) => (
                    <div key={i} className="building-tile">
                      <div className="building-tile-small">
                        {b.building_title}
                      </div>
                      <div className="building-tile-small">
                        {b.building_hours} hrs
                      </div>
                      <button
                        type="button"
                        className="tag-button"
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
                <label className="file-upload-label">Attachments</label>

                <div className="file-upload-section">
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

                    {/* File chips go here */}
                    {(attachments.length > 0 || newAttachments.length > 0) && (
                      <div className="selected-files">
                        {attachments.map((file, index) => (
                          <div key={`existing-${index}`} className="file-chip">
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
                </div>
              </div>
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
                  type="number"
                  name="estimated_hours"
                  value={formData.estimated_hours}
                  onChange={handleChange}
                  className="estd"
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
    </div>
  );
};

export default ManagerProjectCreate;
