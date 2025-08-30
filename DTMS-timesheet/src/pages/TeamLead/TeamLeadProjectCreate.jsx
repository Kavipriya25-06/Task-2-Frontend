// src\pages\TeamLead\TeamLeadProjectCreate.jsx

import React, { useEffect, useState, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import nextCode from "../../constants/nextCode";
import "react-toastify/dist/ReactToastify.css";
import { useAttachmentManager } from "../../constants/useAttachmentManager";
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const TeamLeadProjectCreate = () => {
  const [teamleadManager, setTeamleadManager] = useState([]);
  const [additionalResources, setAdditionalResources] = useState([]);
  const [lastProject, setLastProject] = useState([]);
  const [lastProjectCode, setLastProjectCode] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const buildingPopupRef = useRef();
  // const { employee_id } = useParams();
  const [selectedTeamleadManager, setSelectedTeamleadManager] = useState([]);
  const [discipline, setDiscipline] = useState([]);
  const [client, setClient] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_title: "",
    project_type: "",
    start_date: "",
    due_date: "",
    estimated_hours: "",
    project_description: "",
    project_code: "",
    subdivision: "",
    discipline_code: "",
    discipline: "",
    client: "",
    project_budget: 0,
  });
  const [showBuildingPopup, setShowBuildingPopup] = useState(false);
  const [buildingData, setBuildingData] = useState({});
  const [selectedBuildings, setSelectedBuildings] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("Form data", formData);
  };

  const handleCancel = () => {
    navigate("/teamlead/detail/projects/");
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
    setIsSending(true);
    console.log("Form data", formData);
    console.log("buildings data", selectedBuildings);
    console.log("teamleads data", selectedTeamleadManager);

    if (
      Object.values(formData).every(
        (value) => value === "" || value.length === 0
      )
    ) {
      showErrorToast("Empty form");
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
      buildings:
        selectedBuildings.length > 0
          ? selectedBuildings.map((b) => ({
              building_title: b.building_title,
              building_description: b.building_description,
              building_code: b.building_code,
              employee: [],
              building_hours: b.building_hours,
              start_date: b.start_date,
              due_date: b.due_date,
              // status: "pending",
            }))
          : [
              {
                building_title: "-",
                building_description: "-",
                building_code: "-",
                employee: [],
                building_hours: formData.estimated_hours,
                // status: "pending",
              },
            ],
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
      if (!response.ok) {
        // Check for nested error structure
        const errorMessages = data.details
          ? Object.entries(data.details)
              .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
              .join("\n")
          : data.error || "Unknown error occurred";

        showErrorToast(` ${data.error}\n${errorMessages}`);
        return;
      }

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
        showSuccessToast("Project Created Successfully");

        navigate("/teamlead/detail/projects/");
      } else {
        showErrorToast("Failed to Create project " + data.error);
      }
      setSearchQuery("");
    } catch (err) {
      console.error("Request error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleBuildingChange = (e) => {
    const { name, value } = e.target;
    setBuildingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuildingSubmit = (e) => {
    e.preventDefault();

    const result = nextCode(selectedBuildings.at(-1)?.building_code);
    console.log("Generated next building code", result);

    if (
      !buildingData.building_code ||
      !buildingData.building_title ||
      !buildingData.building_hours
    ) {
      showWarningToast("Please fill all Sub-Division fields");
      return;
    }

    setSelectedBuildings((prev) => [...prev, buildingData]);

    setBuildingData({});
    setShowBuildingPopup(false);
  };

  const handleBuildingCancel = () => {
    setShowBuildingPopup(false);
    setBuildingData({});
    generateBuildingCode();
  };

  useEffect(() => {
    fetchTeamleadManager();
    fetchAdditionalResources();
    fetchDiscipline();
    fetchClient();
    fetchLastProject();
  }, []);

  const fetchDiscipline = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/discipline/`);
      const data = await res.json();
      setDiscipline(data);
      // console.log("Disciplines", data);
    } catch (error) {
      console.error("Error fetching Discipline:", error);
    }
  };

  const fetchClient = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/client/`);
      const data = await res.json();
      setClient(data);
      // console.log("Disciplines", data);
    } catch (error) {
      console.error("Error fetching Clients:", error);
    }
  };

  const fetchLastProject = async () => {
    try {
      const res = await fetch(`${config.apiBaseURL}/last-project/`);
      const data = await res.json();
      setLastProject(data);
      // console.log("Last project", data);
      setLastProjectCode(data.project_code);
    } catch (error) {
      console.error("Error fetching last project:", error);
    }
  };

  useEffect(() => {
    if (!formData.start_date || !lastProjectCode) return;
    if (
      formData.discipline_code === null ||
      formData.discipline_code === undefined ||
      formData.discipline_code === ""
    )
      return;
    // if (!formData.discipline_code || !formData.start_date || !lastProjectCode)
    // return;

    const generateProjectCode = () => {
      const year = new Date(formData.start_date)
        .getFullYear()
        .toString()
        .slice(-2); // e.g., "25"
      // const disciplineCode = String(formData.discipline_code).padStart(2, "0");
      const disciplineCode = String(formData.discipline_code);
      // console.log("Discipline code", disciplineCode);

      // Extract last 4 digits from last project's code // RNS_25_0001
      const lastSerial = lastProjectCode.slice(8); // e.g., from "RNS_25_0001" => "0001"
      // const validSerial = Math.max(parseInt(lastSerial), 800);
      const validSerial = parseInt(lastSerial);
      const nextSerial = String(parseInt(validSerial || "0") + 1).padStart(
        4,
        "0"
      );

      const newCode = `${disciplineCode}_${year}_${nextSerial}`;

      setFormData((prev) => ({
        ...prev,
        project_code: newCode,
      }));
    };

    generateProjectCode();
  }, [formData.discipline_code, lastProjectCode, formData.start_date]);

  useEffect(() => {
    generateBuildingCode();
  }, [selectedBuildings]);

  const generateBuildingCode = () => {
    let code = selectedBuildings.at(-1)?.building_code;
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
                  // readOnly
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
                <select
                  name="discipline_code"
                  value={formData.discipline_code}
                  onChange={(e) => {
                    const selectedCode = e.target.value;
                    // const selectedCode = parseInt(selectedCodee);
                    const selectedItem = discipline.find(
                      (item) => item.discipline_code === selectedCode
                    );
                    // console.log(
                    //   selectedCode,
                    //   "Selected code",
                    //   selectedItem,
                    //   "Item"
                    // );
                    setFormData({
                      ...formData,
                      discipline_code: selectedCode,
                      discipline: selectedItem ? selectedItem.name : "",
                    });
                  }}
                >
                  <option value="">Select Project Type</option>
                  {discipline.map((item) => (
                    <option key={item.id} value={item.discipline_code}>
                      {item.discipline_code} - {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="project-form-group">
                <label>Client</label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={(e) => {
                    const selectedCode = e.target.value;
                    setFormData({
                      ...formData,
                      client: selectedCode || "",
                    });
                  }}
                >
                  <option value="">Select Client</option>
                  {client.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.client_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="left-form-second">
              <div className="roles-box">
                <label>Project Roles</label>
                <div className="select-container">
                  <input
                    type="text"
                    placeholder="Search employee..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "80%",
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
                          <input
                            type="checkbox"
                            className="create-checkbox"
                            value={employee.employee_id}
                            checked={selectedTeamleadManager.includes(
                              employee.employee_id
                            )}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                setSelectedTeamleadManager((prev) => [
                                  ...prev,
                                  employee.employee_id,
                                ]);
                              } else {
                                setSelectedTeamleadManager((prev) =>
                                  prev.filter(
                                    (id) => id !== employee.employee_id
                                  )
                                );
                              }
                            }}
                          />
                          {employee.employee_name} - {employee.designation}
                        </div>
                      ))}
                  </div>
                  {/* --- Additional Resources Section --- */}
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
                          <input
                            type="checkbox"
                            className="create-checkbox"
                            value={employee.employee_id}
                            checked={selectedTeamleadManager.includes(
                              employee.employee_id
                            )}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked) {
                                setSelectedTeamleadManager((prev) => [
                                  ...prev,
                                  employee.employee_id,
                                ]);
                              } else {
                                setSelectedTeamleadManager((prev) =>
                                  prev.filter(
                                    (id) => id !== employee.employee_id
                                  )
                                );
                              }
                            }}
                          />
                          {employee.employee_name} - {employee.designation}
                        </div>
                      ))}
                  </div>
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
                              (item) => item.building_code !== b.building_code
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
                <label>End Date</label>
                <div className="date-input-container">
                  <DatePicker
                    selected={formData.due_date}
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        due_date: format(date, "yyyy-MM-dd"),
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
              <div className="project-form-group-small">
                <label>Project Budget</label>
                <input
                  type="number"
                  name="project_budget"
                  value={formData.project_budget}
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
          <button
            type="submit"
            className="btn-green"
            disabled={isSending}
            style={{ pointerEvents: isSending ? "none" : "auto" }}
          >
            {isSending ? (
              <>
                <span className="spinner-otp" /> Updating...
              </>
            ) : (
              "Create"
            )}
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
                  <div className="project-form-group-small">
                    <label>Start Date</label>
                    <br />
                    <div className="date-input-container">
                      <DatePicker
                        selected={buildingData.start_date}
                        onChange={(date) =>
                          setFormData({
                            ...buildingData,
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
                    <label>End Date</label>
                    <br />
                    <div className="date-input-container">
                      <DatePicker
                        selected={buildingData.due_date}
                        onChange={(date) =>
                          setFormData({
                            ...buildingData,
                            due_date: format(date, "yyyy-MM-dd"),
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
      <ToastContainerComponent />
    </div>
  );
};

export default TeamLeadProjectCreate;
