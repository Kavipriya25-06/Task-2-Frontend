// src/pages/HR/HRAddEmployee.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config";
import { useAuth } from "../../AuthContext";
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

const AddEmployee = () => {
  const { employee_id } = useParams();
  const { user } = useAuth();
  const managerId = user.employee_id;
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [attachments, setAttachments] = useState([
    { document_type: "PAN", name: "PAN", file: null },
    { document_type: "Aadhaar", name: "Aadhaar", file: null },
    { document_type: "bank", name: "Bank Details", file: null },
    { document_type: "Degree", name: "Degree Certificate", file: null },
    { document_type: "marksheets", name: "Mark Sheets", file: null },
    { document_type: "resume", name: "Resume", file: null },
    {
      document_type: "empletter",
      name: "Signed Employment Letter",
      file: null,
    },
    {
      document_type: "relievingletter",
      name: "Last Company Relieving Letter",
      file: null,
    },
    { document_type: "payslip", name: "Last Company Payslip", file: null },
    {
      document_type: "idproof",
      name: "ID Proof/Driving ID/Voter ID",
      file: null,
    },
  ]);

  const [assets, setAssets] = useState([
    // {
    //   type: "",
    //   model: "",
    //   serialnumber: "",
    //   given_date: null,
    //   return_date: null,
    // },
  ]);
  const [dependants, setDependants] = useState([
    // { name: "", relationship: "", date_of_birth: null, age: null },
  ]);
  const [education, setEducation] = useState([
    // {
    //   institution_name: "",
    //   degree: "",
    //   specialization: "",
    //   date_of_completion: null,
    // },
  ]);
  const [workExperience, setWorkExperience] = useState([
    // { company_name: "", company_role: "", start_date: null, end_date: null },
  ]);
  const [languages, setLanguages] = useState([
    // { language: "", read: "", write: "", speak: "" },
  ]);

  // const addRow = (stateSetter, defaultRow) =>
  //   stateSetter((prev) => [...prev, defaultRow]);

  // const removeRow = (index, state, stateSetter) =>
  //   stateSetter(state.filter((_, i) => i !== index));

  const handleRowChange = (index, name, value, state, stateSetter) => {
    const newRows = [...state];
    newRows[index][name] = value;
    stateSetter(newRows);
  };

  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const { formData, setFormData, errors, handleChange } =
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

  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [originalImageSrc, setOriginalImageSrc] = useState(null);
  const [profilePictureBlob, setProfilePictureBlob] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setOriginalImageSrc(reader.result);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async () => {
    const blob = await getCroppedImg(originalImageSrc, croppedAreaPixels);
    const previewUrl = URL.createObjectURL(blob);
    setProfilePicture(previewUrl);
    setProfilePictureBlob(blob);
    setShowCropper(false);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fieldsToNullify = [
      "dob",
      "doj",
      "age",
      "wedding_date",
      "passport_validity",
      "probation_confirmation_date",
      "contract_end_date",
      "resignation_date",
      "relieving_date",
      "year_of_passing",
      "aero360_experience",
      "previous_experience",
      "experience_in_years",
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
      return;
    }
    if (!cleanedData.employee_code) {
      showWarningToast("Please enter employee code");
      return;
    }
    if (!cleanedData.employee_name) {
      showWarningToast("Please enter employee name");
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseURL}/employees/`, {
        method: "POST",
        body: formPayload,
      });
      const responseData = await response.json();
      const employeeId = responseData.data.employee_id;
      console.log("Received employee id is", employeeId);

      // Assets
      for (const a of assets) {
        await fetch(`${config.apiBaseURL}/assets/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...a, employee: employeeId }),
        });
      }
      // Dependants
      for (const d of dependants) {
        await fetch(`${config.apiBaseURL}/dependant/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...d, employee: employeeId }),
        });
      }
      // Education
      for (const edu of education) {
        await fetch(`${config.apiBaseURL}/education/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...edu, employee: employeeId }),
        });
      }
      // Work Experience
      for (const w of workExperience) {
        await fetch(`${config.apiBaseURL}/work-experience/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...w, employee: employeeId }),
        });
      }
      // Languages
      for (const l of languages) {
        await fetch(`${config.apiBaseURL}/languages-known/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...l, employee: employeeId }),
        });
      }

      // Attachments
      for (const att of attachments) {
        if (att.file) {
          const form = new FormData();
          form.append("file", att.file);
          form.append("document_type", att.document_type);
          form.append("employee", employeeId);
          await fetch(`${config.apiBaseURL}/employee-attachment/`, {
            method: "POST",
            body: form,
          });
        }
      }

      // modifications

      await fetch(`${config.apiBaseURL}/modifications/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modified_by: managerId, employee: employeeId }),
      });

      if (!response.ok) {
        showErrorToast(`Failed to add employee`);
        return;
      }
      showSuccessToast("Employee Details uploaded successfully");
      setTimeout(() => {
        navigate("/hr/detail/employee-details");
      }, 1000); // waits for 1 second (1000ms)
    } catch (error) {
      showErrorToast(`Failed to create user: ${error.message}`);
    }
  };

  const calculateExactAge = (dob) => {
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return years;
  };

  return (
    <div className="add-employee-wrapper">
      <h2 className="employee-title">Add Employee</h2>
      <form className="add-employee-form" onSubmit={handleSubmit}>
        {/* === Basic Info === */}
        <h3 className="section-header">Basic Info</h3>
        <div className="tab-content">
          <div className="individual-tabs">
            <label>
              Employee Code <span className="required-star">*</span>
            </label>
            <input
              name="employee_code"
              value={formData.employee_code}
              onChange={handleChange}
              placeholder="Employee Code"
              required
            />
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
              required
              className={errors.employee_email ? "input-error" : ""}
            />
            {errors.employee_email && (
              <span className="error-message">{errors.employee_email}</span>
            )}
          </div>
          <div className="individual-tabs">
            <label>
              First Name <span className="required-star">*</span>
            </label>
            <input
              name="employee_name"
              value={formData.employee_name}
              onChange={handleChange}
              placeholder="First Name"
              required
            />
          </div>
          <div className="individual-tabs">
            <label>Last Name</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>
          {/* <input
            name="added_by"
            placeholder="Added by"
            value={formData.added_by}
            onChange={handleChange}
          />
          <input
            name="modified_by"
            placeholder="Modified by"
            value={formData.modified_by}
            onChange={handleChange}
          />
          <input
            name="status"
            placeholder="Status"
            value={formData.status}
            onChange={handleChange}
          /> */}
        </div>

        {/* === Work Info === */}
        <h3 className="section-header">Work</h3>
        <div className="tab-content">
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
            </div>
          </div>

          <div className="individual-tabs">
            <label>Location</label>
            <input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
            />
          </div>
          <div className="individual-tabs">
            <label>Title</label>
            <input
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Title"
            />
          </div>
          {/* <input
            name="role"
            placeholder="Role"
            value={formData.role}
            onChange={handleChange}
          /> */}
          {/* <input
            name="experience"
            placeholder="Experience"
            value={formData.experience}
            onChange={handleChange}
          />
          <input
            name="total_experience"
            placeholder="Total Experience"
            value={formData.total_experience}
            onChange={handleChange}
          /> */}
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
            <label>Employee Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              placeholder="Employee Status"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="resigned">Resigned</option>
            </select>
          </div>
          <div className="individual-tabs">
            <label>Source of Hire</label>
            <input
              name="source_of_hire"
              value={formData.source_of_hire}
              onChange={handleChange}
              placeholder="Source of Hire"
            />
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
          <div className="individual-tabs">
            <label>Secondary Reporting Manager</label>
            <select
              name="second_reporting_manager"
              value={formData.second_reporting_manager}
              onChange={handleChange}
              // placeholder="Reporting Manager"
            >
              <option value="">Select Secondary Reporting Manager</option>
              {managers.map((manager) => (
                <option key={manager.employee_id} value={manager.employee_id}>
                  {manager.employee_code} - {manager.employee_name}
                </option>
              ))}
            </select>
          </div>

          <div className="individual-tabs">
            <label>Seating Location</label>
            <input
              name="seating_location"
              value={formData.seating_location}
              onChange={handleChange}
              placeholder="Seating Location"
            />
          </div>

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
            <label>Work Phone</label>
            <input
              pattern="[0-9+\-]{0,15}"
              name="work_phone"
              value={formData.work_phone}
              onChange={handleChange}
              placeholder="Work Phone"
            />
          </div>
          <div className="individual-tabs">
            <label>Extension</label>
            <input
              pattern="[0-9+\-]{0,15}"
              name="extension"
              value={formData.extension}
              onChange={handleChange}
              placeholder="Extension"
            />
          </div>
        </div>

        {/* === Personal Details === */}
        <h3 className="section-header">Personal Details</h3>
        <div className="tab-content">
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

          {/* <input
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
          /> */}
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
            <label>Marital Status</label>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              // placeholder="Gender"
            >
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
              <option value="Separated">Separated</option>
            </select>
          </div>

          <div className="individual-tabs">
            <label>Wedding Date</label>
            <div className="date-input-container">
              <DatePicker
                selected={formData.wedding_date}
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    wedding_date: format(date, "yyyy-MM-dd"),
                  })
                }
                dateFormat="dd-MMM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="input1"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select" // ensures dropdown shows on click, not scroll
              />
              <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              {/* Font Awesome Calendar Icon */}
            </div>
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
            <label>Current Address</label>
            <textarea
              name="local_address"
              value={formData.local_address}
              onChange={handleChange}
              placeholder="Current Address"
            />
          </div>
          <div className="individual-tabs">
            <label>Mobile Phone</label>
            <input
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Mobile Phone"
              className={errors.contact_number ? "input-error" : ""}
            />
            {errors.contact_number && (
              <span className="error-message">{errors.contact_number}</span>
            )}
          </div>

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
            <label>Identification Marks</label>
            <textarea
              name="identification_marks"
              value={formData.identification_marks}
              onChange={handleChange}
              placeholder="Identification Marks"
            />
          </div>
        </div>

        {/* === Additional Details === */}
        <h3 className="section-header">Additional Details</h3>
        <div className="tab-content">
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
            {errors.PAN && <span className="error-message">{errors.PAN}</span>}
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
            {errors.UAN && <span className="error-message">{errors.UAN}</span>}
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
            <label>Remarks</label>
            <input
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Remarks"
            />
          </div>
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

        {/* === Language Table === */}

        <h3 className="section-header">Languages</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Language</th>
                <th>Speak</th>
                <th>Write</th>
                <th>Read</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {languages.map((l, i) => (
                <tr key={i}>
                  <td>
                    <input
                      placeholder="Language"
                      value={l.language}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "language",
                          e.target.value,
                          languages,
                          setLanguages
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={l.read}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "read",
                          e.target.value,
                          languages,
                          setLanguages
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option>Native</option>
                      <option>Fluent</option>
                      <option>Proficient</option>
                      <option>Conversational</option>
                      <option>Basic</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={l.write}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "write",
                          e.target.value,
                          languages,
                          setLanguages
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option>Native</option>
                      <option>Fluent</option>
                      <option>Proficient</option>
                      <option>Conversational</option>
                      <option>Basic</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={l.speak}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "speak",
                          e.target.value,
                          languages,
                          setLanguages
                        )
                      }
                    >
                      <option value="">Select</option>
                      <option>Native</option>
                      <option>Fluent</option>
                      <option>Proficient</option>
                      <option>Conversational</option>
                      <option>Basic</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="employee-delete-button"
                      type="button"
                      onClick={() =>
                        setLanguages(
                          languages.filter((_, index) => index !== i)
                        )
                      }
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="employee-add-button"
            type="button"
            onClick={() =>
              setLanguages([
                ...languages,
                {
                  language: "",
                  read: "",
                  write: "",
                  speak: "",
                },
              ])
            }
          >
            +
          </button>
        </div>

        <h3 className="section-header">Dependant</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Relationship</th>
                <th>Date of Birth</th>
                <th>Age</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dependants.map((d, i) => (
                <tr key={i}>
                  <td>
                    <input
                      placeholder="Name"
                      value={d.name}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "name",
                          e.target.value,
                          dependants,
                          setDependants
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Relationship"
                      value={d.relationship}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "relationship",
                          e.target.value,
                          dependants,
                          setDependants
                        )
                      }
                    />
                  </td>

                  <td>
                    <div className="date-input-container-info">
                      <DatePicker
                        portalId="root-portal"
                        selected={d.date_of_birth}
                        onChange={(date) => {
                          const age = date ? calculateExactAge(date) : "";
                          handleRowChange(
                            i,
                            "date_of_birth",
                            date,
                            dependants,
                            setDependants
                          );
                          handleRowChange(
                            i,
                            "age",
                            age,
                            dependants,
                            setDependants
                          );
                        }}
                        dateFormat="dd-MMM-yyyy"
                        placeholderText="dd-mm-yyyy"
                        showMonthDropdown
                        showYearDropdown
                        className="input-date"
                        dropdownMode="select"
                      />
                      <i className="fas fa-calendar-alt calendar-icon"></i>
                    </div>
                  </td>

                  <td>
                    <input
                      placeholder="Age"
                      value={d.age}
                      readOnly
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "age",
                          e.target.value,
                          dependants,
                          setDependants
                        )
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="employee-delete-button"
                      type="button"
                      onClick={() =>
                        setDependants(
                          dependants.filter((_, index) => index !== i)
                        )
                      }
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="employee-add-button"
            type="button"
            onClick={() =>
              setDependants([
                ...dependants,
                { name: "", relationship: "", date_of_birth: null, age: "" },
              ])
            }
          >
            +
          </button>
        </div>

        {/* === Work Experience Table === */}

        <h3 className="section-header">Work Experience</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Role</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {workExperience.map((w, i) => (
                <tr key={i}>
                  <td>
                    <input
                      placeholder="Company Name"
                      value={w.company_name}
                      onChange={(ev) =>
                        handleRowChange(
                          i,
                          "company_name",
                          ev.target.value,
                          workExperience,
                          setWorkExperience
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Role"
                      value={w.company_role}
                      onChange={(ev) =>
                        handleRowChange(
                          i,
                          "company_role",
                          ev.target.value,
                          workExperience,
                          setWorkExperience
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="date-input-container-info">
                      <DatePicker
                        portalId="root-portal"
                        selected={w.start_date}
                        onChange={(date) =>
                          handleRowChange(
                            i,
                            "start_date",
                            date,
                            workExperience,
                            setWorkExperience
                          )
                        }
                        dateFormat="dd-MMM-yyyy"
                        placeholderText="dd-mm-yyyy"
                        showMonthDropdown
                        showYearDropdown
                        className="input-date"
                        dropdownMode="select"
                      />
                      <i className="fas fa-calendar-alt calendar-icon"></i>
                    </div>
                  </td>
                  <td>
                    <div className="date-input-container-info">
                      <DatePicker
                        portalId="root-portal"
                        selected={w.end_date}
                        onChange={(date) =>
                          handleRowChange(
                            i,
                            "end_date",
                            date,
                            workExperience,
                            setWorkExperience
                          )
                        }
                        dateFormat="dd-MMM-yyyy"
                        placeholderText="dd-mm-yyyy"
                        showMonthDropdown
                        showYearDropdown
                        className="input-date"
                        dropdownMode="select"
                      />
                      <i className="fas fa-calendar-alt calendar-icon"></i>
                    </div>
                  </td>
                  <td>
                    <button
                      className="employee-delete-button"
                      type="button"
                      onClick={() =>
                        setWorkExperience(
                          workExperience.filter((_, index) => index !== i)
                        )
                      }
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="employee-add-button"
            type="button"
            onClick={() =>
              setWorkExperience([
                ...workExperience,
                {
                  company_name: "",
                  company_role: "",
                  start_date: null,
                  end_date: null,
                },
              ])
            }
          >
            +
          </button>
        </div>

        {/* === Education Table === */}
        <h3 className="section-header">Education</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Institution Name</th>
                <th>Degree</th>
                <th>Specialization</th>
                <th>Date of Completion</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {education.map((e, i) => (
                <tr key={i}>
                  <td>
                    <input
                      placeholder="Institution Name"
                      value={e.institution_name}
                      onChange={(ev) =>
                        handleRowChange(
                          i,
                          "institution_name",
                          ev.target.value,
                          education,
                          setEducation
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Degree"
                      value={e.degree}
                      onChange={(ev) =>
                        handleRowChange(
                          i,
                          "degree",
                          ev.target.value,
                          education,
                          setEducation
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Specialization"
                      value={e.specialization}
                      onChange={(ev) =>
                        handleRowChange(
                          i,
                          "specialization",
                          ev.target.value,
                          education,
                          setEducation
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="date-input-container-info">
                      <DatePicker
                        portalId="root-portal"
                        selected={e.date_of_completion}
                        onChange={(date) =>
                          handleRowChange(
                            i,
                            "date_of_completion",
                            date,
                            education,
                            setEducation
                          )
                        }
                        dateFormat="dd-MMM-yyyy"
                        placeholderText="dd-mm-yyyy"
                        showMonthDropdown
                        showYearDropdown
                        className="input-date"
                        dropdownMode="select"
                      />
                      <i className="fas fa-calendar-alt calendar-icon"></i>
                    </div>
                  </td>
                  <td>
                    <button
                      className="employee-delete-button"
                      type="button"
                      onClick={() =>
                        setEducation(
                          education.filter((_, index) => index !== i)
                        )
                      }
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="employee-add-button"
            type="button"
            onClick={() =>
              setEducation([
                ...education,
                {
                  institution_name: "",
                  degree: "",
                  specialization: "",
                  date_of_completion: null,
                },
              ])
            }
          >
            +
          </button>
        </div>

        {/* === Asset Table === */}

        <h3 className="section-header">Employee Assets</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Model</th>
                <th>Serial Number</th>
                <th>Given Date</th>
                <th>Return Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a, i) => (
                <tr key={i}>
                  <td>
                    <input
                      placeholder="Type"
                      value={a.type}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "type",
                          e.target.value,
                          assets,
                          setAssets
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Model"
                      value={a.model}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "model",
                          e.target.value,
                          assets,
                          setAssets
                        )
                      }
                    />
                  </td>
                  <td>
                    <input
                      placeholder="Serial Number"
                      value={a.serialnumber}
                      onChange={(e) =>
                        handleRowChange(
                          i,
                          "serialnumber",
                          e.target.value,
                          assets,
                          setAssets
                        )
                      }
                    />
                  </td>
                  <td>
                    <div className="date-input-container-info">
                      <DatePicker
                        portalId="root-portal"
                        selected={a.given_date}
                        onChange={(date) =>
                          handleRowChange(
                            i,
                            "given_date",
                            date,
                            assets,
                            setAssets
                          )
                        }
                        dateFormat="dd-MMM-yyyy"
                        placeholderText="dd-mm-yyyy"
                        showMonthDropdown
                        showYearDropdown
                        className="input-date"
                        dropdownMode="select"
                      />
                      <i className="fas fa-calendar-alt calendar-icon"></i>
                    </div>
                  </td>
                  <td>
                    <div className="date-input-container-info">
                      <DatePicker
                        portalId="root-portal"
                        selected={a.return_date}
                        onChange={(date) =>
                          handleRowChange(
                            i,
                            "return_date",
                            date,
                            assets,
                            setAssets
                          )
                        }
                        dateFormat="dd-MMM-yyyy"
                        placeholderText="dd-mm-yyyy"
                        showMonthDropdown
                        showYearDropdown
                        className="input-date"
                        dropdownMode="select"
                      />
                      <i className="fas fa-calendar-alt calendar-icon"></i>
                    </div>
                  </td>
                  <td>
                    <button
                      className="employee-delete-button"
                      type="button"
                      onClick={() =>
                        setAssets(assets.filter((_, index) => index !== i))
                      }
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="employee-add-button"
            type="button"
            onClick={() =>
              setAssets([
                ...assets,
                {
                  type: "",
                  model: "",
                  serialnumber: "",
                  given_date: null,
                  return_date: null,
                },
              ])
            }
          >
            +
          </button>
        </div>

        {/* === Attachments === */}
        {/* <h3 className="section-header">Attachments</h3>
        <div className="tab-content">
          <input placeholder="PAN" />
          <input placeholder="Aadhaar" />
          <input placeholder="Bank Details" />
          <input placeholder="Degree Certificate" />
          <input placeholder="Mark Sheets" />
          <input placeholder="Resume" />
          <input placeholder="Signed Employment Letter" />
          <input placeholder="Last Company Relieving Letter" />
          <input placeholder="Last Company Payslip" />
          <input placeholder="ID Proof/Driving ID/Voter ID" />
        </div> */}

        <h3 className="section-header">Attachments</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>File</th>
                {/* <th></th> */}
              </tr>
            </thead>
            <tbody>
              {attachments.map((att, index) => (
                <tr key={index}>
                  <td>{att.name}</td>
                  <td>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const updated = [...attachments];
                        updated[index].file = file;
                        setAttachments(updated);
                      }}
                    />
                  </td>
                  {/* <td>{att.file && <span>{att.file.name}</span>}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-green">
            Save
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
