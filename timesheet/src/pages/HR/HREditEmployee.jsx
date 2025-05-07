// src\pages\HR\HREditEmployee.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config";
import { cleanFormData } from "../../utils/cleanFormData";
import cameraIcon from "../../assets/camera.png";
import userPlaceholder from "../../assets/user.png";
import plusIcon from "../../assets/plus.png";

import { FaEdit } from "react-icons/fa";



import { useAttachmentManager } from "../../constants/useAttachmentManager";
import { useEmployeeFormHandler } from "../../constants/useEmployeeFormHandler";
import { defaultEmployeeFormData } from "../../constants/defaultEmployeeFormData";


const tabLabels = [
  "Employee details",
  "Employment details",
  "Bank details",
  "Emergency contact",
];

const EditEmployee = () => {
  const { employee_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const [isEditMode, setIsEditMode] = useState(false);
  const [managers, setManagers] = useState([]);

  const [editMode, setEditMode] = useState(false); //  Add this at the top
  const {
    attachments,
    setAttachments,
    newAttachments,
    handleAttachmentChange,
    removeExistingAttachment,
    removeNewAttachment,
    profilePicture,
    setProfilePicture,
    profilePictureUrl,
    setProfilePictureUrl,
  } = useAttachmentManager([]);

  const [experienceUI, setExperienceUI] = useState({
    arris_years: "",
    arris_months: "",
    total_years: "",
    total_months: "",
    previous_years: "",
    previous_months: "",
  });

  const { formData, setFormData, errors, setErrors, handleChange } =
    useEmployeeFormHandler({
      defaultEmployeeFormData,
    });

  useEffect(() => {
    fetchEmployee();
    fetchManagers();
  }, [employee_id]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/employees/${employee_id}/`
      );
      const data = await response.json();
      setFormData(data);

      // Set Profile Picture if exists
      if (data.profile_picture) {
        setProfilePictureUrl(config.apiBaseURL + data.profile_picture);
      }

      // Set experience years/months
      setExperienceUI({
        arris_years: Math.floor((data.arris_experience || 0) / 12),
        arris_months: (data.arris_experience || 0) % 12,
        total_years: Math.floor((data.total_experience || 0) / 12),
        total_months: (data.total_experience || 0) % 12,
        previous_years: Math.floor((data.previous_experience || 0) / 12),
        previous_months: (data.previous_experience || 0) % 12,
      });

      // Fetch Attachments separately
      const attachResponse = await fetch(
        `${config.apiBaseURL}/attachments/employee/${employee_id}`
      );
      const attachData = await attachResponse.json();
      console.log(attachData, "attachments");
      setAttachments(attachData); // assuming attachData is a list of attachments

      setLoading(false);
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/teamlead-and-managers/`
      );
      const data = await response.json();
      setManagers(data); // Store managers data
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleExperienceChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...experienceUI, [name]: value };

    const arrisMonths =
      parseInt(updated.arris_years || 0) * 12 +
      parseInt(updated.arris_months || 0);
    const totalMonths =
      parseInt(updated.total_years || 0) * 12 +
      parseInt(updated.total_months || 0);
    let previousMonths =
      parseInt(updated.previous_years || 0) * 12 +
      parseInt(updated.previous_months || 0);
    setExperienceUI(updated);
    setFormData((prev) => ({
      ...prev,
      arris_experience: arrisMonths,
      total_experience: totalMonths,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode) return;

    const updatedEmployee = { ...formData };
    console.log(updatedEmployee);

    const fieldsToNullify = [
      "dob",
      "doj",
      "passport_validity",
      "probation_confirmation_date",
      "resignation_date",
      "relieving_date",
      "year_of_passing",
      "arris_experience",
      "total_experience",
      "personal_email",
      "employee_email",
      "contact_number",
      "aadhaar_number",
      "PAN",
      "UAN",
      "pf_number",
      "esi_number",
      "passport_number",
    ];

    const cleanedData = cleanFormData(formData, fieldsToNullify);

    try {
      const response = await fetch(
        `${config.apiBaseURL}/employees/${employee_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedData),
        }
      );

      if (profilePicture) {
        const picturePayload = new FormData();
        picturePayload.append("profile_picture", profilePicture);

        const imageUploadResponse = await fetch(
          `${config.apiBaseURL}/employees/${employee_id}/`,
          {
            method: "PATCH",
            body: picturePayload,
          }
        );

        if (!imageUploadResponse.ok)
          throw new Error("Failed to upload profile picture");
      }

      if (newAttachments.length > 0) {
        for (const file of newAttachments) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("employee", employee_id);

          const uploadRes = await fetch(`${config.apiBaseURL}/attachments/`, {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            console.error("Failed to upload file:", file.name);
          }
        }

        // Refresh the list after all uploads
        const attachResponse = await fetch(
          `${config.apiBaseURL}/attachments/employee/${employee_id}`
        );
        const attachData = await attachResponse.json();
        setAttachments(attachData);
        // setNewAttachments([]);
      }

      if (!response.ok) throw new Error("Failed to update employee");
      navigate("/hr/detail/employee-details");
    } catch (error) {
      console.error("Error submitting employee data:", error);
    }
  };

  if (loading) return <p>Loading employee data...</p>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="tab-content">
            <div className="profile-picture-wrapper">
            <h4>Profile Photo: </h4>
              <img
                src={
                  profilePicture
                    ? URL.createObjectURL(profilePicture)
                    : profilePictureUrl || userPlaceholder
                }
                alt="Profile"
                className="profile-picture-img"
              />

              {/* Hidden file input */}
              {editMode && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    id="profile-picture-input"
                    className="profile-picture-input"
                    onChange={(e) => setProfilePicture(e.target.files[0])}
                  />

                  {/* Camera Icon */}
                  <label
                    htmlFor="profile-picture-input"
                    className="camera-icon-label"
                  > 
                    <img
                      src={cameraIcon}
                      alt="Edit"
                      className="camera-icon-img"
                    />
                  </label>
                </>
              )}
            </div>

            <div className="attachments-box">
              <h4>Attachments:</h4>
              <ul className="attachments-list">
                {attachments.map((file, index) => {
                  const filename = file.file
                    .split("/")
                    .pop()
                    .split("_")
                    .slice(1)
                    .join("_"); // Extract original name
                  return (
                    <li key={file.id} className="attachment-item">
                      <a
                        href={config.apiBaseURL + file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {filename}
                      </a>
                      {editMode && (
                        <button
                          className="remove-attachment"
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
                          &times;
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>


            {/* <div className="individual-tabs">
              <label>Employee Code</label>
              {isEditMode ? (
              <input
                // style={{ marginTop: "10px" }}
                name="employee_code"
                value={formData.employee_code}
                onChange={handleChange}
                placeholder="Employee Code"
                disabled={!isEditMode}
                required
              />
            ) : (
              <p className="data">{formData.employee_code}</p>
            )}
            </div> */}
            {/* <div className="individual-tabs">
              <label>Employee Name</label> */}
              {/* {isEditMode ? (
              {newAttachments.length > 0 && (
                <>
                  <h5>New Attachments (to be uploaded):</h5>
                  <ul className="attachments-list">
                    {newAttachments.map((file, index) => (
                      <li key={`new-${index}`} className="attachment-item">
                        {file.name}
                        {editMode && (
                          <button
                            type="button"
                            className="remove-attachment"
                            onClick={() => removeNewAttachment(index)}
                          >
                            &times;
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )} */}

              {/* Hidden file input for new attachments */}
              <input
                type="file"
                multiple
                id="new-attachments-input"
                className="profile-picture-input"
                style={{ display: "none" }}
                onChange={handleAttachmentChange}
              />

              {/* Plus icon button */}
              {editMode && (
                <label
                  htmlFor="new-attachments-input"
                  className="add-attachment-button"
                >
                  <img
                    src={plusIcon}
                    alt="Add Attachments"
                    className="add-attachment-icon"
                  />
                </label>
              )}
            </div>

            <div className="individual-tabs">
              <label>Employee Code</label>
              {editMode ? (
                <input
                  // style={{ marginTop: "10px" }}
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  placeholder="Employee Code"
                  disabled={!editMode}
                  required
                />
              ) : (
                <div className="uneditable">
                  {formData.employee_code || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Employee Name</label>
              {editMode ? (
                <input
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleChange}
                  placeholder="Employee Name"
                  required
                />
              ) : (
                <div className="uneditable">
                  {formData.employee_name || "-"}
                </div>
              )}
            </div>

            <div className="individual-tabs">
              <label>Father's Name</label>

              {/* {isEditMode ? (
              <input
                name="fathers_name"
                value={formData.fathers_name}
                onChange={handleChange}
                placeholder="Father's Name"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.fathers_name}</p> */}

              {editMode ? (
                <input
                  name="fathers_name"
                  value={formData.fathers_name}
                  onChange={handleChange}
                  placeholder="Father's Name"
                />
              ) : (
                <div className="uneditable">{formData.fathers_name || "-"}</div>

              )}
            </div>
            <div className="individual-tabs">
              <label>Gender</label>

              {/* {isEditMode ? (
              <input
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                placeholder="Gender"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.gender}</p> */}

              {editMode ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              ) : (
                <div className="uneditable">{formData.gender || "-"}</div>

              )}
            </div>
            <div className="individual-tabs">
              <label>Date of Birth</label>

              {/* {isEditMode ? (
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.dob}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Date of joining</label>
              {isEditMode ? (
              <input
                type="date"
                name="doj"
                value={formData.doj}
                onChange={handleChange}
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.doj}</p> */}

              {editMode ? (
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              ) : (
                <div className="uneditable">{formData.dob || "-"}</div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Date of joining</label>
              {editMode ? (
                <input
                  type="date"
                  name="doj"
                  value={formData.doj}
                  onChange={handleChange}
                />
              ) : (
                <div className="uneditable">{formData.doj || "-"}</div>

              )}
            </div>
            <div className="individual-tabs">
              <label>Personal Email</label>

              {/* {isEditMode ? (
              <input
                name="personal_email"
                value={formData.personal_email}
                onChange={handleChange}
                placeholder="Personal Email"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.personal_email}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Phone Number</label>
              {isEditMode ? (
              <input
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="Phone Number"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.contact_number}</p> */}

              {editMode ? (
                <input
                  name="personal_email"
                  value={formData.personal_email}
                  onChange={handleChange}
                  placeholder="Personal Email"
                  className={errors.personal_email ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">
                  {formData.personal_email || "-"}
                </div>
              )}
              {errors.personal_email && (
                <span className="error-message">{errors.personal_email}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Phone Number</label>
              {editMode ? (
                <input
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={errors.contact_number ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">
                  {formData.contact_number || "-"}
                </div>
              )}
              {errors.contact_number && (
                <span className="error-message">{errors.contact_number}</span>

              )}
            </div>
            <div className="individual-tabs">
              <label>Aadhaar</label>
{/* 
              {isEditMode ? (
              <input
                name="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={handleChange}
                placeholder="Aadhaar"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.aadhaar_number}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>PAN Number</label>
              {isEditMode ? (
              <input
                name="PAN"
                value={formData.PAN}
                onChange={handleChange}
                placeholder="PAN Number"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.PAN}</p> */}

              {editMode ? (
                <input
                  name="aadhaar_number"
                  value={formData.aadhaar_number}
                  onChange={handleChange}
                  placeholder="Aadhaar"
                  className={errors.aadhaar_number ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">
                  {formData.aadhaar_number || "-"}
                </div>
              )}
              {errors.aadhaar_number && (
                <span className="error-message">{errors.aadhaar_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>PAN Number</label>
              {editMode ? (
                <input
                  name="PAN"
                  value={formData.PAN}
                  onChange={handleChange}
                  placeholder="PAN Number"
                  className={errors.PAN ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">{formData.PAN || "-"}</div>
              )}
              {errors.PAN && (
                <span className="error-message">{errors.PAN}</span>

              )}
            </div>
            <div className="individual-tabs">
              <label>UAN</label>
              {/* {isEditMode ? (
              <input
                name="UAN"
                value={formData.UAN}
                onChange={handleChange}
                placeholder="UAN"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.UAN}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>PF Number</label>
              {isEditMode ? (
              <input
                name="pf_number"
                value={formData.pf_number}
                onChange={handleChange}
                placeholder="PF Number"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.pf_number}</p> */}
              {editMode ? (
                <input
                  name="UAN"
                  value={formData.UAN}
                  onChange={handleChange}
                  placeholder="UAN"
                  className={errors.UAN ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">{formData.UAN || "-"}</div>
              )}
              {errors.UAN && (
                <span className="error-message">{errors.UAN}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>PF Number</label>
              {editMode ? (
                <input
                  name="pf_number"
                  value={formData.pf_number}
                  onChange={handleChange}
                  placeholder="PF Number"
                  className={errors.pf_number ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">{formData.pf_number || "-"}</div>
              )}
              {errors.pf_number && (
                <span className="error-message">{errors.pf_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>ESI Number</label>
              {/* {isEditMode ? (
              <input
                name="esi_number"
                value={formData.esi_number}
                onChange={handleChange}
                placeholder="ESI Number"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.esi_number}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Passport Number</label>
              {isEditMode ? (
              <input
                name="passport_number"
                value={formData.passport_number}
                onChange={handleChange}
                placeholder="Passport Number"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.passport_number}</p> */}
              {editMode ? (
                <input
                  name="esi_number"
                  value={formData.esi_number}
                  onChange={handleChange}
                  placeholder="ESI Number"
                  className={errors.esi_number ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">{formData.esi_number || "-"}</div>
              )}
              {errors.esi_number && (
                <span className="error-message">{errors.esi_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Passport Number</label>
              {editMode ? (
                <input
                  name="passport_number"
                  value={formData.passport_number}
                  onChange={handleChange}
                  placeholder="Passport Number"
                  className={errors.passport_number ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">
                  {formData.passport_number || "-"}
                </div>
              )}
              {errors.passport_number && (
                <span className="error-message">{errors.passport_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Passport validity</label>
              {/* {isEditMode ? (
              <input
                type="date"
                name="passport_validity"
                value={formData.passport_validity}
                onChange={handleChange}
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.passport_validity}</p> */}
              {editMode ? (
                <input
                  type="date"
                  name="passport_validity"
                  value={formData.passport_validity}
                  onChange={handleChange}
                />
              ) : (
                <div className="uneditable">
                  {formData.passport_validity || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Status</label>
              {/* {isEditMode ? (
              <input
                name="status"
                value={formData.status}
                onChange={handleChange}
                placeholder="Status"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.status}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Permanent Address</label>
              {isEditMode ? (
              <textarea
                name="permanent_address"
                value={formData.permanent_address}
                onChange={handleChange}
                placeholder="Permanent Address"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.permanent_address}</p> */}
              {editMode ? (
                <input
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  placeholder="Status"
                />
              ) : (
                <div className="uneditable">{formData.status || "-"}</div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Permanent Address</label>
              {editMode ? (
                <textarea
                  name="permanent_address"
                  value={formData.permanent_address}
                  onChange={handleChange}
                  placeholder="Permanent Address"
                />
              ) : (
                <div className="uneditable">
                  {formData.permanent_address || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Local Address</label>
              {/* {isEditMode ? (
              <textarea
                name="local_address"
                value={formData.local_address}
                onChange={handleChange}
                placeholder="Current Address"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.local_address}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Remarks</label>
              {isEditMode ? (
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Remarks"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.remarks}</p> */}
              {editMode ? (
                <textarea
                  name="local_address"
                  value={formData.local_address}
                  onChange={handleChange}
                  placeholder="Current Address"
                />
              ) : (
                <div className="uneditable">
                  {formData.local_address || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Remarks</label>
              {editMode ? (
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Remarks"
                />
              ) : (
                <div className="uneditable">
                  {formData.remarks || "-"}
                </div>
              )}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="tab-content">
            <div className="individual-tabs">
              <label>Employment Type</label>
              {/* {isEditMode ? (
              <input
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                placeholder="Employment Type"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.employment_type}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Designation</label>
              {isEditMode ? (
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Designation"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.designation}</p> */}

              {editMode ? (
                <input
                  name="employment_type"
                  value={formData.employment_type}
                  onChange={handleChange}
                  placeholder="Employment Type"
                />
              ) : (
                <div className="uneditable">
                  {formData.employment_type || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Designation</label>
              {editMode ? (
                <input
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Designation"
                />
              ) : (
                <div className="uneditable">{formData.designation || "-"}</div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Department</label>
              {/* {isEditMode ? (
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.department}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Qualification</label>
              {isEditMode ? (
              <input
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="Qualification"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.qualification}</p> */}

              {editMode ? (
                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department"
                />
              ) : (
                <div className="uneditable">{formData.department || "-"}</div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Qualification</label>
              {editMode ? (
                <input
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  placeholder="Qualification"
                />
              ) : (
                <div className="uneditable">
                  {formData.qualification || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Year of Passing</label>
              {/* {isEditMode ? (
              <input
                type="number"
                name="year_of_passing"
                value={formData.year_of_passing}
                onChange={handleChange}
                placeholder="Year of Passing"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.year_of_passing}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Previous Company Name</label>
              {isEditMode ? (
              <input
                name="previous_company_name"
                value={formData.previous_company_name}
                onChange={handleChange}
                placeholder="Previous Company Name"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.previous_company_name}</p> */}

              {editMode ? (
                <input
                  type="number"
                  name="year_of_passing"
                  value={formData.year_of_passing}
                  onChange={handleChange}
                  placeholder="Year of Passing"
                />
              ) : (
                <div className="uneditable">
                  {formData.year_of_passing || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Previous Company Name</label>
              {editMode ? (
                <input
                  name="previous_company_name"
                  value={formData.previous_company_name}
                  onChange={handleChange}
                  placeholder="Previous Company Name"
                />
              ) : (
                <div className="uneditable">
                  {formData.previous_company_name || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Previous Experience</label>
              {editMode ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    name="previous_years"
                    value={experienceUI.previous_years}
                    onChange={handleExperienceChange}
                    // disabled
                  >
                    <option value="">Years</option>
                    {[...Array(31).keys()].map((year) => (
                      <option key={year} value={year}>
                        {year} Years
                      </option>
                    ))}
                  </select>
                  <select
                    name="previous_months"
                    value={experienceUI.previous_months}
                    onChange={handleExperienceChange}
                    // disabled
                  >
                    <option value="">Months</option>
                    {[...Array(12).keys()].map((month) => (
                      <option key={month} value={month}>
                        {month} Months
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="uneditable">
                  {experienceUI.previous_years} Years, {experienceUI.previous_months}{" "}
                  Months
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Arris Experience</label>
              {/* {isEditMode ? (
              <input
                type="number"
                name="arris_experience"
                value={formData.arris_experience}
                onChange={handleChange}
                placeholder="Arris Experience"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.arris_experience}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Total Experience</label>
              {isEditMode ? (
              <input
                name="total_experience"
                value={formData.total_experience}
                onChange={handleChange}
                placeholder="Total Experience"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.total_experience}</p> */}

              {editMode ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    name="arris_years"
                    value={experienceUI.arris_years}
                    // onChange={handleExperienceChange}
                    disabled
                  >
                    <option value="">Years</option>
                    {[...Array(31).keys()].map((year) => (
                      <option key={year} value={year}>
                        {year} Years
                      </option>
                    ))}
                  </select>
                  <select
                    name="arris_months"
                    value={experienceUI.arris_months}
                    // onChange={handleExperienceChange}
                    disabled
                  >
                    <option value="">Months</option>
                    {[...Array(12).keys()].map((month) => (
                      <option key={month} value={month}>
                        {month} Months
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="uneditable">
                  {experienceUI.arris_years} Years, {experienceUI.arris_months}{" "}
                  Months
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Total Experience</label>
              {editMode ? (
                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    name="total_years"
                    value={experienceUI.total_years}
                    onChange={handleExperienceChange}
                  >
                    <option value="">Years</option>
                    {[...Array(31).keys()].map((year) => (
                      <option key={year} value={year}>
                        {year} Years
                      </option>
                    ))}
                  </select>
                  <select
                    name="total_months"
                    value={experienceUI.total_months}
                    onChange={handleExperienceChange}
                  >
                    <option value="">Months</option>
                    {[...Array(12).keys()].map((month) => (
                      <option key={month} value={month}>
                        {month} Months
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="uneditable">
                  {experienceUI.total_years} Years, {experienceUI.total_months}{" "}
                  Months
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Probation confirmation date</label>
              {/* {isEditMode ? (
              <input
                type="date"
                name="probation_confirmation_date"
                value={formData.probation_confirmation_date}
                onChange={handleChange}
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.probation_confirmation_date}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Official Email</label>
              {isEditMode ? (
              <input
                name="employee_email"
                value={formData.employee_email}
                onChange={handleChange}
                placeholder="Official Email"
                disabled={!isEditMode}
              />
              ) : (
                <p className="data">{formData.employee_email}</p> */}

              {editMode ? (
                <input
                  type="date"
                  name="probation_confirmation_date"
                  value={formData.probation_confirmation_date}
                  onChange={handleChange}
                />
              ) : (
                <div className="uneditable">
                  {formData.probation_confirmation_date || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Official Email</label>
              {editMode ? (
                <input
                  name="employee_email"
                  value={formData.employee_email}
                  onChange={handleChange}
                  placeholder="Official Email"
                  className={errors.employee_email ? "input-error" : ""}
                />
              ) : (
                <div className="uneditable">
                  {formData.employee_email || "-"}
                </div>
              )}
              {errors.employee_email && (
                <span className="error-message">{errors.employee_email}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Reporting Manager</label>
              {/* {isEditMode ? (
              <input
                name="reporting_manager"
                value={formData.reporting_manager}
                onChange={handleChange}
                placeholder="Reporting Manager"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.reporting_manager}</p>
            )} */}

              {editMode ? (
                <select
                  name="reporting_manager"
                  value={formData.reporting_manager}
                  onChange={handleChange}
                >
                  <option value="">Select Reporting Manager</option>
                  {managers.map((manager) => (
                    <option
                      key={manager.employee_id}
                      value={manager.employee_id}
                    >
                      {manager.employee_code} - {manager.employee_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="uneditable">
                  {managers.find(
                    (m) => m.employee_id === formData.reporting_manager
                  )
                    ? `${
                        managers.find(
                          (m) => m.employee_id === formData.reporting_manager
                        ).employee_code
                      } - ${
                        managers.find(
                          (m) => m.employee_id === formData.reporting_manager
                        ).employee_name
                      }`
                    : "-"}
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="tab-content">
            <div className="individual-tabs">
              <label>Account Number</label>
              {/* {isEditMode ? (
              <input
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Account Number"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.account_number}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>IFSC Code</label>
              {isEditMode ? (
              <input
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
                placeholder="IFSC Code"
                disabled={!isEditMode}
              />
              ) : (
              <p className="data">{formData.ifsc_code}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Bank Name</label>
              {isEditMode ? (
              <input
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="Bank Name"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.bank_name}</p>
            )} */}

              {editMode ? (
                <input
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleChange}
                  placeholder="Account Number"
                />
              ) : (
                <div className="uneditable">
                  {formData.account_number || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>IFSC Code</label>
              {editMode ? (
                <input
                  name="ifsc_code"
                  value={formData.ifsc_code}
                  onChange={handleChange}
                  placeholder="IFSC Code"
                />
              ) : (
                <div className="uneditable">{formData.ifsc_code || "-"}</div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Bank Name</label>
              {editMode ? (
                <input
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleChange}
                  placeholder="Bank Name"
                />
              ) : (
                <div className="uneditable">{formData.bank_name || "-"}</div>
              )}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="tab-content">
            <div className="individual-tabs">
              <label>Emergency Contact Name</label>
              {/* {isEditMode ? (
              <input
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="Emergency Contact Name"
                disabled={!isEditMode}
              />
              ) : (
              <p className="data">{formData.emergency_contact_name}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Emergency Contact Number</label>
              {isEditMode ? (
              <input
                name="emergency_contact_number"
                value={formData.emergency_contact_number}
                onChange={handleChange}
                placeholder="Emergency Contact Number"
                disabled={!isEditMode}
              />
              ) : (
              <p className="data">{formData.emergency_contact_number}</p>
            )}
            </div>
            <div className="individual-tabs">
              <label>Blood Group</label>
              {isEditMode ? (
              <input
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                placeholder="Blood Group"
                disabled={!isEditMode}
              />
            ) : (
              <p className="data">{formData.blood_group}</p>
            )} */}

              {editMode ? (
                <input
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Emergency Contact Name"
                />
              ) : (
                <div className="uneditable">
                  {formData.emergency_contact_name || "-"}
                </div>
              )}
            </div>
            <div className="individual-tabs">
              <label>Emergency Contact Number</label>
              {editMode ? (
                <input
                  name="emergency_contact_number"
                  value={formData.emergency_contact_number}
                  onChange={handleChange}
                  placeholder="Emergency Contact Number"
                  className={
                    errors.emergency_contact_number ? "input-error" : ""
                  }
                />
              ) : (
                <div className="uneditable">
                  {formData.emergency_contact_number || "-"}
                </div>
              )}
              {errors.emergency_contact_number && (
                <span className="error-message">
                  {errors.emergency_contact_number}
                </span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Blood Group</label>
              {editMode ? (
                <input
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  placeholder="Blood Group"
                />
              ) : (
                <div className="uneditable">{formData.blood_group || "-"}</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="add-employee-wrapper">
        {/* <h2 className="employee-title">
          {isEditMode ? "Edit Employee" : "Employee"}
        </h2>
        {!isEditMode && (
          <button onClick={() => setIsEditMode(true)} className="edit-toggle-btn">
            <FaEdit />
          </button>
        )} */}
      <h2 className="employee-title">
        {editMode ? "Edit Employee" : "View Employee"}
      </h2>
      {!editMode && (
          <button onClick={() => setEditMode(true)} className="edit-toggle-btn">
            <FaEdit className="edit-icon" />
          </button>
      )}
      <div className="tab-header">
        {tabLabels.map((label, index) => (
          <button
            key={label}
            onClick={() => setActiveTab(index)}
            className={activeTab === index ? "tab-btn active" : "tab-btn"}
          >
            {label}
          </button>
        ))}
        {/* {!editMode && (
          <button
            type="button"
            onClick={() => setEditMode(true)}
            className="btn-orange"
          >
            Edit
          </button>
        )} */}
      </div>

      <form className="add-employee-form" onSubmit={handleSubmit}>
        {renderTabContent()}
        {/* {isEditMode && (
        <div className="form-buttons">
          <button type="submit" className="btn-save">
            Save
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/hr/detail/employee-details")}
          >
            Cancel
          </button>
        </div> */}

        {editMode && (
          <div className="form-buttons">
            <button type="submit" className="btn-save">
              Save
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditMode(false);
                fetchEmployee(); // Reset form to saved state if Cancel
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};


export default EditEmployee;
