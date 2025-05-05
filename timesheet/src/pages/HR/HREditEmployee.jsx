// src\pages\HR\HREditEmployee.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config";
import { cleanFormData } from "../../utils/cleanFormData";
import cameraIcon from "../../assets/camera.png";
import userPlaceholder from "../../assets/user.png";
import plusIcon from "../../assets/plus.png";
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

    setExperienceUI(updated);
    setFormData((prev) => ({
      ...prev,
      arris_experience: arrisMonths,
      total_experience: totalMonths,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
                <img src={cameraIcon} alt="Edit" className="camera-icon-img" />
              </label>
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
                    </li>
                  );
                })}
              </ul>

              {newAttachments.length > 0 && (
                <>
                  <h5>New Attachments (to be uploaded):</h5>
                  <ul className="attachments-list">
                    {newAttachments.map((file, index) => (
                      <li key={`new-${index}`} className="attachment-item">
                        {file.name}
                        <button
                          type="button"
                          className="remove-attachment"
                          onClick={() => removeNewAttachment(index)}
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

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
            </div>

            <div className="individual-tabs">
              <label>Employee Code</label>
              <input
                // style={{ marginTop: "10px" }}
                name="employee_code"
                value={formData.employee_code}
                onChange={handleChange}
                placeholder="Employee Code"
                required
              />
            </div>
            <div className="individual-tabs">
              <label>Employee Name</label>
              <input
                name="employee_name"
                value={formData.employee_name}
                onChange={handleChange}
                placeholder="Employee Name"
                required
              />
            </div>
            <div className="individual-tabs">
              <label>Father's Name</label>
              <input
                name="fathers_name"
                value={formData.fathers_name}
                onChange={handleChange}
                placeholder="Father's Name"
              />
            </div>
            <div className="individual-tabs">
              <label>Gender</label>
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
            </div>
            <div className="individual-tabs">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>
            <div className="individual-tabs">
              <label>Date of joining</label>
              <input
                type="date"
                name="doj"
                value={formData.doj}
                onChange={handleChange}
              />
            </div>
            <div className="individual-tabs">
              <label>Personal Email</label>
              <input
                name="personal_email"
                value={formData.personal_email}
                onChange={handleChange}
                placeholder="Personal Email"
                className={errors.personal_email ? "input-error" : ""}
              />
              {errors.personal_email && (
                <span className="error-message">{errors.personal_email}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Phone Number</label>
              <input
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="Phone Number"
                className={errors.contact_number ? "input-error" : ""}
              />
              {errors.contact_number && (
                <span className="error-message">{errors.contact_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Aadhaar</label>
              <input
                name="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={handleChange}
                placeholder="Aadhaar"
                className={errors.aadhaar_number ? "input-error" : ""}
              />
              {errors.aadhaar_number && (
                <span className="error-message">{errors.aadhaar_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>PAN Number</label>
              <input
                name="PAN"
                value={formData.PAN}
                onChange={handleChange}
                placeholder="PAN Number"
                className={errors.PAN ? "input-error" : ""}
              />
              {errors.PAN && (
                <span className="error-message">{errors.PAN}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>UAN</label>
              <input
                name="UAN"
                value={formData.UAN}
                onChange={handleChange}
                placeholder="UAN"
                className={errors.UAN ? "input-error" : ""}
              />
              {errors.UAN && (
                <span className="error-message">{errors.UAN}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>PF Number</label>
              <input
                name="pf_number"
                value={formData.pf_number}
                onChange={handleChange}
                placeholder="PF Number"
                className={errors.pf_number ? "input-error" : ""}
              />
              {errors.pf_number && (
                <span className="error-message">{errors.pf_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>ESI Number</label>
              <input
                name="esi_number"
                value={formData.esi_number}
                onChange={handleChange}
                placeholder="ESI Number"
                className={errors.esi_number ? "input-error" : ""}
              />
              {errors.esi_number && (
                <span className="error-message">{errors.esi_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Passport Number</label>
              <input
                name="passport_number"
                value={formData.passport_number}
                onChange={handleChange}
                placeholder="Passport Number"
                className={errors.passport_number ? "input-error" : ""}
              />
              {errors.passport_number && (
                <span className="error-message">{errors.passport_number}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Passport validity</label>
              <input
                type="date"
                name="passport_validity"
                value={formData.passport_validity}
                onChange={handleChange}
              />
            </div>
            <div className="individual-tabs">
              <label>Status</label>
              <input
                name="status"
                value={formData.status}
                onChange={handleChange}
                placeholder="Status"
              />
            </div>
            <div className="individual-tabs">
              <label>Permanent Address</label>
              <textarea
                name="permanent_address"
                value={formData.permanent_address}
                onChange={handleChange}
                placeholder="Permanent Address"
              />
            </div>
            <div className="individual-tabs">
              <label>Local Address</label>
              <textarea
                name="local_address"
                value={formData.local_address}
                onChange={handleChange}
                placeholder="Current Address"
              />
            </div>
            <div className="individual-tabs">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Remarks"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="tab-content">
            <div className="individual-tabs">
              <label>Employment Type</label>
              <input
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                placeholder="Employment Type"
              />
            </div>
            <div className="individual-tabs">
              <label>Designation</label>
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Designation"
              />
            </div>
            <div className="individual-tabs">
              <label>Department</label>
              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department"
              />
            </div>
            <div className="individual-tabs">
              <label>Qualification</label>
              <input
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                placeholder="Qualification"
              />
            </div>
            <div className="individual-tabs">
              <label>Year of Passing</label>
              <input
                type="number"
                name="year_of_passing"
                value={formData.year_of_passing}
                onChange={handleChange}
                placeholder="Year of Passing"
              />
            </div>
            <div className="individual-tabs">
              <label>Previous Company Name</label>
              <input
                name="previous_company_name"
                value={formData.previous_company_name}
                onChange={handleChange}
                placeholder="Previous Company Name"
              />
            </div>
            <div className="individual-tabs">
              <label>Arris Experience</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  name="arris_years"
                  value={experienceUI.arris_years}
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
                  name="arris_months"
                  value={experienceUI.arris_months}
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
            </div>
            <div className="individual-tabs">
              <label>Total Experience</label>
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
            </div>
            <div className="individual-tabs">
              <label>Probation confirmation date</label>
              <input
                type="date"
                name="probation_confirmation_date"
                value={formData.probation_confirmation_date}
                onChange={handleChange}
              />
            </div>
            <div className="individual-tabs">
              <label>Official Email</label>
              <input
                name="employee_email"
                value={formData.employee_email}
                onChange={handleChange}
                placeholder="Official Email"
                className={errors.employee_email ? "input-error" : ""}
              />
              {errors.employee_email && (
                <span className="error-message">{errors.employee_email}</span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Reporting Manager</label>
              <select
                name="reporting_manager"
                value={formData.reporting_manager}
                onChange={handleChange}
              >
                <option value="">Select Reporting Manager</option>
                {managers.map((manager) => (
                  <option key={manager.employee_id} value={manager.employee_id}>
                    {manager.employee_code} - {manager.employee_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="tab-content">
            <div className="individual-tabs">
              <label>Account Number</label>
              <input
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Account Number"
              />
            </div>
            <div className="individual-tabs">
              <label>IFSC Code</label>
              <input
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleChange}
                placeholder="IFSC Code"
              />
            </div>
            <div className="individual-tabs">
              <label>Bank Name</label>
              <input
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="Bank Name"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="tab-content">
            <div className="individual-tabs">
              <label>Emergency Contact Name</label>
              <input
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleChange}
                placeholder="Emergency Contact Name"
              />
            </div>
            <div className="individual-tabs">
              <label>Emergency Contact Number</label>
              <input
                name="emergency_contact_number"
                value={formData.emergency_contact_number}
                onChange={handleChange}
                placeholder="Emergency Contact Number"
                className={errors.emergency_contact_number ? "input-error" : ""}
              />
              {errors.emergency_contact_number && (
                <span className="error-message">
                  {errors.emergency_contact_number}
                </span>
              )}
            </div>
            <div className="individual-tabs">
              <label>Blood Group</label>
              <input
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                placeholder="Blood Group"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="add-employee-wrapper">
      <h2 className="employee-title">Edit Employee</h2>
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
      </div>

      <form className="add-employee-form" onSubmit={handleSubmit}>
        {renderTabContent()}

        <div className="form-buttons">
          <button type="submit" className="btn btn-green">
            Save
          </button>
          <button
            type="button"
            className="btn btn-orange"
            onClick={() => navigate("/hr/detail/employee-details")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
