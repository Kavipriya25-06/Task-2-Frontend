// src\pages\HR\HRAddEmployee.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config";
import { cleanFormData } from "../../utils/cleanFormData";
import usePlaceholder from "/profile_icon.svg";
import cameraIcon from "/camera.png";
import plusIcon from "/plus.png";
import { useAttachmentManager } from "../../constants/useAttachmentManager";
import { useEmployeeFormHandler } from "../../constants/useEmployeeFormHandler";
import { defaultEmployeeFormData } from "../../constants/defaultEmployeeFormData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { getCleanFilename } from "../../utils/filenameUtils";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../constants/cropimage"; // Path to the helper
import Slider from "@mui/material/Slider";
import Modal from "@mui/material/Modal";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const tabLabels = [
  "Employee details",
  "Employment details",
  "Bank details",
  "Emergency contact",
];

const AddEmployee = () => {
  const { employee_id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [managers, setManagers] = useState([]);
  const [experienceUI, setExperienceUI] = useState({
    arris_years: "",
    arris_months: "",
    total_years: "",
    total_months: "",
    previous_years: "",
    previous_months: "",
  });
  const [isSending, setIsSending] = useState(false);

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const { formData, setFormData, errors, setErrors, handleChange } =
    useEmployeeFormHandler(defaultEmployeeFormData);

  const {
    newAttachments,
    handleAttachmentChange,
    removeNewAttachment,
    getAttachmentName,
    profilePicture,
    setProfilePicture,
    profilePictureUrl,
    setProfilePictureUrl,
  } = useAttachmentManager([]);

  useEffect(() => {
    fetchManagers();
  }, []);

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

    // Calculate months and update formData
    let arrisMonths =
      parseInt(updated.arris_years || 0) * 12 +
      parseInt(updated.arris_months || 0);
    let totalMonths =
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
      previous_experience: previousMonths,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);

    const fieldsToNullify = [
      "dob",
      "doj",
      "passport_validity",
      "probation_confirmation_date",
      "contract_end_date",
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
    const formPayload = new FormData();

    Object.entries(cleanedData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formPayload.append(key, value);
      }
    });

    if (!cleanedData.employee_email) {
      showWarningToast("Please enter employee email");
      // alert("Please enter employee email");
      return;
    }

    if (!cleanedData.employee_code) {
      showWarningToast("Please enter employee code");
      return;
    }

    if (!cleanedData.employee_name) {
      showWarningToast("Please enter employee name");

      // alert("Please enter employee name");
      return;
    }

    try {
      // Step 1: Create employee
      const response = await fetch(`${config.apiBaseURL}/employees/`, {
        method: "POST",
        body: formPayload,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const data = responseData; // from response.json()

        if (response.status === 400 && data.details) {
          // Loop through all field-specific error messages
          Object.entries(data.details).forEach(([field, messages]) => {
            showErrorToast(`Failed to add employee: ${messages.join(", ")}`);
          });
        } else {
          // Generic error handler
          const errorMessage =
            data.error ||
            Object.values(data).flat().join(", ") || // fallback to other validation messages
            "Unknown error occurred.";
          showErrorToast(`Failed to add employee: ${errorMessage}`);
        }

        return;
      }

      const newEmployeeId = responseData.data.employee_id;

      console.log("Employee created with ID:", newEmployeeId);

      // Step 2: Upload profile picture if available
      if (profilePictureBlob) {
        const picturePayload = new FormData();
        picturePayload.append(
          "profile_picture",
          profilePictureBlob,
          "profile.jpg"
        );

        const imageUploadResponse = await fetch(
          `${config.apiBaseURL}/employees/${newEmployeeId}/`,
          {
            method: "PATCH",
            body: picturePayload,
          }
        );

        if (!imageUploadResponse.ok) {
          throw new Error("Failed to upload profile picture");
        }

        const refreshed = await fetch(
          `${config.apiBaseURL}/employees/${newEmployeeId}/`
        );
        const updatedData = await refreshed.json();
        setProfilePictureUrl(config.apiBaseURL + updatedData.profile_picture);
      }

      // Step 3: Upload attachments
      if (newAttachments && newAttachments.length > 0) {
        for (let file of newAttachments) {
          const attachmentPayload = new FormData();
          attachmentPayload.append("file", file);
          attachmentPayload.append("employee", newEmployeeId);

          const res = await fetch(`${config.apiBaseURL}/attachments/`, {
            method: "POST",
            body: attachmentPayload,
          });

          if (!res.ok)
            throw new Error("One of the attachments failed to upload");
        }

        console.log("All attachments uploaded");
        // showSuccessToast("Employee Details are uploaded successfully");
      }

      // Step 4: Navigate after success
      showSuccessToast("Employee Details are uploaded successfully");
      setTimeout(() => {
        navigate("/hr/detail/employee-details");
      }, 2000); // waits for 2 seconds (2000ms)
    } catch (error) {
      showErrorToast(`Failed to create user: ${error.message}`);
      console.error(
        "Error during employee creation or attachment upload:",
        error
      );
    } finally {
      setIsSending(false);
    }
  };

  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [profilePictureBlob, setProfilePictureBlob] = useState(null);
  const [originalImageSrc, setOriginalImageSrc] = useState(null); // full original image for cropping

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImageSrc(reader.result); // set full image for cropper
        setShowCropper(true); // open cropper immediately
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    const blob = await getCroppedImg(originalImageSrc, croppedAreaPixels);

    // Preview
    const previewUrl = URL.createObjectURL(blob);
    setProfilePicture(previewUrl); // For preview

    // Store Blob for upload
    setProfilePictureBlob(blob); // New state to hold actual blob for uploading

    setShowCropper(false);
  };

  // When user clicks image to edit crop again:
  const handleEditClick = () => {
    if (originalImageSrc) {
      setShowCropper(true); // open cropper with original full image again
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <div className="tab-content">
            <div className="profile-picture-wrapper">
              <label>Profile picture</label>
              <div className="profile-picture-container">
                <input
                  type="file"
                  accept="image/*"
                  id="profile-picture-input"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {/* Profile picture - click to edit crop */}
                <img
                  src={profilePicture || usePlaceholder}
                  alt="Profile Preview"
                  className="profile-picture"
                  onClick={handleEditClick}
                  style={{
                    cursor: originalImageSrc ? "pointer" : "default",
                  }}
                />

                {/* Camera icon to open file selector */}
                <label
                  htmlFor="profile-picture-input"
                  className="camera-icon-overlay"
                >
                  <img
                    src={cameraIcon}
                    alt="Camera Icon"
                    className="camera-icon"
                    style={{ cursor: "pointer" }}
                  />
                </label>
              </div>
              {showCropper && (
                <Modal open={showCropper} onClose={() => setShowCropper(false)}>
                  <div className="crop-container">
                    <Cropper
                      image={originalImageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={1}
                      onCropChange={setCrop}
                      onCropComplete={(_, croppedAreaPixels) =>
                        setCroppedAreaPixels(croppedAreaPixels)
                      }
                      onZoomChange={setZoom}
                    />
                    <div className="controls">
                      <Slider
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(_, value) => setZoom(value)}
                      />
                      <button onClick={handleCropSave} className="btn-crop">
                        Crop & Save
                      </button>
                    </div>
                  </div>
                </Modal>
              )}
            </div>

            <div className="attachments-wrapper">
              <label>Attachments</label>
              <div className="attachments-box">
                <div className="add-btn-wrapper">
                  <label
                    htmlFor="attachments-input"
                    className="plus-upload-button"
                  >
                    +
                  </label>

                  <input
                    type="file"
                    id="attachments-input"
                    name="attachments"
                    multiple
                    style={{ display: "none" }}
                    onChange={handleAttachmentChange}
                  />
                </div>
                <div className="attachments-list">
                  {newAttachments.map((file, index) => {
                    const filename = getCleanFilename(file.name);
                    return (
                      <div key={index} className="attachment-item">
                        <span className="attachment-name">{file.name}</span>
                        <button
                          type="button"
                          className="remove-attachment"
                          onClick={() => removeNewAttachment(index)}
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="individual-tabs">
              <label>
                Employee Code <span className="required-star">*</span>
              </label>
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
              <label>
                Employee Name <span className="required-star">*</span>
              </label>
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
                // placeholder="Gender"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="individual-tabs">
              <label>Date of Birth</label>
              <div className="date-input-container">
                <DatePicker
                  selected={formData.dob}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      dob: format(date, "yyyy-MM-dd"),
                    })
                  }
                  dateFormat="dd-MMM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select" // ensures dropdown shows on click, not scroll
                  maxDate={eighteenYearsAgo}
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                {/* Font Awesome Calendar Icon */}
              </div>
            </div>
            <div className="individual-tabs">
              <label>Date of joining</label>
              <div className="date-input-container">
                <DatePicker
                  selected={formData.doj}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      doj: format(date, "yyyy-MM-dd"),
                    })
                  }
                  dateFormat="dd-MMM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                {/* Font Awesome Calendar Icon */}
              </div>
            </div>
            <div className="individual-tabs">
              <label>
                Personal Email <span className="required-star">*</span>
              </label>
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
              <div className="date-input-container">
                <DatePicker
                  selected={formData.passport_validity}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      passport_validity: format(date, "yyyy-MM-dd"),
                    })
                  }
                  dateFormat="dd-MMM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                {/* Font Awesome Calendar Icon */}
              </div>
            </div>
            <div className="individual-tabs">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                placeholder="Status"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="resigned">Resigned</option>
              </select>
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
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                // placeholder="Employment Type"
              >
                <option value="">Select Employment Type</option>
                <option value="Fulltime">Full-Time</option>
                <option value="Probation">Probation</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>
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
              {/* <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                // placeholder="Department"
              >
                <option value="">Select Department</option>
                <option value="Structural-Detailing">
                  Structural-Detailing
                </option>
                <option value="Structural-Design">Structural-Design</option>
                <option value="Piping">Piping</option>
                <option value="Electrical&Instrumentation">
                  Electrical&Instrumentation
                </option>
              </select> */}
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
              <select
                name="year_of_passing"
                value={formData.year_of_passing}
                onChange={handleChange}
                placeholder="Year of Passing"
              >
                <option value="">Year of Passing</option>
                {[...Array(150).keys()].map((year) => (
                  <option key={year + 1940} value={year + 1940}>
                    {year + 1940}
                  </option>
                ))}
              </select>
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
              <label>Previous Experience</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <select
                  name="previous_years"
                  value={experienceUI.previous_years}
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
                  name="previous_months"
                  value={experienceUI.previous_months}
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
            {/* <div className="individual-tabs">
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
            </div> */}
            {/* <div className="individual-tabs">
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
            </div> */}

            <div className="individual-tabs">
              <label>Probation confirmation date</label>
              <div className="date-input-container">
                <DatePicker
                  selected={formData.probation_confirmation_date}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      probation_confirmation_date: format(date, "yyyy-MM-dd"),
                    })
                  }
                  dateFormat="dd-MMM-yyyy"
                  placeholderText="Select confirmation date"
                  className="input1"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                {/* Font Awesome Calendar Icon */}
              </div>
            </div>
            <div className="individual-tabs">
              <label>
                Official Email <span className="required-star">*</span>
              </label>
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
                // placeholder="Reporting Manager"
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
                className={errors.ifsc_code ? "input-error" : ""}
              />
              {errors.ifsc_code && (
                <span className="error-message">{errors.ifsc_code}</span>
              )}
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
            <div className="individual-tabs">
              <label>Branch Name</label>
              <input
                name="bank_branch_name"
                value={formData.bank_branch_name}
                onChange={handleChange}
                placeholder="Branch Name"
              />
            </div>
            <div className="individual-tabs">
              <label>Bank Address</label>
              <textarea
                name="bank_address"
                value={formData.bank_address}
                onChange={handleChange}
                placeholder="Bank Address"
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
              <label>Relationship</label>
              <input
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={handleChange}
                placeholder="Relationship"
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
      <h2 className="employee-title">Add Employee</h2>
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
          <button type="submit" className="btn-green" disabled={isSending}>
            {isSending ? (
              <>
                <span className="spinner-otp" /> Updating...
              </>
            ) : (
              "Save"
            )}
          </button>
          <button
            type="button"
            className="btn-red"
            onClick={() => navigate("/hr/detail/employee-details")}
          >
            Cancel
          </button>
        </div>
      </form>
      <ToastContainerComponent />
    </div>
  );
};

export default AddEmployee;
