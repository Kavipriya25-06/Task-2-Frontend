// src\pages\HR\HREditEmployee.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config";
import { useAuth } from "../../AuthContext";
import { cleanFormData } from "../../utils/cleanFormData";

import { FaEdit } from "react-icons/fa";

import { getCleanFilename } from "../../utils/filenameUtils";
// import usePlaceholder from "/profile_icon.svg";
import plusIcon from "../../assets/plus.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseISO, format } from "date-fns";
import Cropper from "react-easy-crop";
import getCroppedImg from "../../constants/cropimage"; // Path to the helper
import Slider from "@mui/material/Slider";
import Modal from "@mui/material/Modal";

const tabLabels = [
  "Employee details",
  "Employment details",
  "Bank details",
  "Emergency contact",
];

import usePlaceholder from "/profile_icon.svg";
import cameraIcon from "/camera.png";
// import plusIcon from "/plus.png";
import { useAttachmentManager } from "../../constants/useAttachmentManager";
import { useEmployeeFormHandler } from "../../constants/useEmployeeFormHandler";
import { defaultEmployeeFormData } from "../../constants/defaultEmployeeFormData";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { format } from "date-fns";
// import { getCleanFilename } from "../../utils/filenameUtils";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const EditEmployee = () => {
  const { employee_id } = useParams();
  const { user } = useAuth();
  const managerId = user.employee_id;
  const navigate = useNavigate();

  const [managers, setManagers] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [attachmentsKnown, setAttachmentsKnown] = useState([]);
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

  const [assets, setAssets] = useState([]);
  const [dependants, setDependants] = useState([]);
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [languagesKnown, setLanguagesKnown] = useState([]);
  const [dependantsKnown, setDependantsKnown] = useState([]);
  const [workExperienceKnown, setWorkExperienceKnown] = useState([]);
  const [educationKnown, setEducationKnown] = useState([]);
  const [assetsKnown, setAssetsKnown] = useState([]);

  const handleRowChange = (index, name, value, state, stateSetter) => {
    const newRows = [...state];
    newRows[index][name] = value;
    stateSetter(newRows);
  };

  const deleteKnownRow = async (id, endpoint, stateList, setStateList) => {
    try {
      await fetch(`${config.apiBaseURL}/${endpoint}/${id}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      setStateList(stateList.filter((row) => row.id !== id));
      showSuccessToast("Deleted successfully");
    } catch (error) {
      console.error(error);
      showErrorToast("Failed to delete row");
    }
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
    fetchEmployee();
    fetchManagers();
  }, [employee_id]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/employees-all-details/${employee_id}/`
      );
      const data = await response.json();
      setFormData(data);
      setLanguagesKnown(data.languages_known);
      setDependantsKnown(data.dependant);
      setWorkExperienceKnown(data.work_experience);
      setEducationKnown(data.education);
      setAssetsKnown(data.assets);
      setAttachmentsKnown(data.attachments);
      if (data.profile_picture)
        setProfilePictureUrl(config.apiBaseURL + data.profile_picture);
      // setLoading(false);
    } catch (err) {
      console.error("Error fetching managers:", err);
    }
  };

  console.log("Dependants", dependants);
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
    if (!editMode) return;

    const updatedEmployee = { ...formData };
    // delete updatedEmployee.profile_picture; // <- THIS IS IMPORTANT
    console.log("updated employee", updatedEmployee);

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
      const response = await fetch(
        `${config.apiBaseURL}/employees/${employee_id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cleanedData),
        }
      );
      const responseData = await response.json();
      const employeeId = responseData.data.employee_id;
      console.log("Received employee id is", employeeId);

      // Assets

      for (const a of assetsKnown) {
        await fetch(`${config.apiBaseURL}/assets/${a.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(a),
        });
      }

      for (const a of assets) {
        await fetch(`${config.apiBaseURL}/assets/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...a, employee: employeeId }),
        });
      }
      // Dependants
      for (const d of dependantsKnown) {
        await fetch(`${config.apiBaseURL}/dependant/${d.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(d),
        });
      }

      for (const d of dependants) {
        await fetch(`${config.apiBaseURL}/dependant/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...d, employee: employeeId }),
        });
      }
      // Education
      for (const edu of educationKnown) {
        await fetch(`${config.apiBaseURL}/education/${edu.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(edu),
        });
      }

      for (const edu of education) {
        await fetch(`${config.apiBaseURL}/education/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...edu, employee: employeeId }),
        });
      }
      // Work Experience

      for (const w of workExperienceKnown) {
        await fetch(`${config.apiBaseURL}/work-experience/${w.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(w),
        });
      }

      for (const w of workExperience) {
        await fetch(`${config.apiBaseURL}/work-experience/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...w, employee: employeeId }),
        });
      }
      // Languages

      for (const l of languagesKnown) {
        await fetch(`${config.apiBaseURL}/languages-known/${l.id}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(l),
        });
      }

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
      setEditMode(false);
      fetchEmployee();
      // setTimeout(() => {
      //   navigate("/hr/detail/employee-details");
      // }, 1000); // waits for 1 second (1000ms)
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

  const renderField = (label, name, type = "text") => (
    <div className="individual-tabs">
      <label>{label}</label>
      {editMode ? (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          placeholder={label}
        />
      ) : (
        <div className="uneditable">{formData[name] || "-"}</div>
      )}
    </div>
  );

  const renderSelect = (label, name, options) => (
    <div className="individual-tabs">
      <label>{label}</label>
      {editMode ? (
        <select
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <div className="uneditable">{formData[name] || "-"}</div>
      )}
    </div>
  );

  const renderDate = (label, name) => (
    <div className="individual-tabs">
      <label>{label}</label>
      {editMode ? (
        <div className="date-input-container">
          <DatePicker
            selected={formData[name]}
            onChange={(date) =>
              setFormData({ ...formData, [name]: format(date, "yyyy-MM-dd") })
            }
            dateFormat="dd-MMM-yyyy"
            placeholderText="dd-mm-yyyy"
            className="input1"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            maxDate={name === "dob" ? eighteenYearsAgo : null}
          />
          <i className="fas fa-calendar-alt calendar-icon"></i>
        </div>
      ) : (
        <div className="uneditable">
          {formData[name]
            ? format(new Date(formData[name]), "dd-MMM-yyyy")
            : "-"}
        </div>
      )}
    </div>
  );

  return (
    <div className="add-employee-wrapper">
      <h2 className="employee-title">
        {editMode ? "Edit Employee" : "View Employee"}
      </h2>
      {!editMode && (
        <button
          onClick={() => setEditMode(true)}
          className="edit-toggle-btn"
          title="Edit"
        >
          <FaEdit className="edit-icon" />
        </button>
      )}
      <form className="add-employee-form" onSubmit={handleSubmit}>
        {/* === Basic Info === */}
        <h3 className="section-header">Basic Info</h3>
        <div className="tab-content">
          {renderField("Employee Code", "employee_code")}
          {renderField("Official Email", "employee_email")}
          {renderField("First Name", "employee_name")}
          {renderField("Last Name", "last_name")}
          <div className="individual-tabs">
            <label>Added by</label>
            <div className="uneditable">
              {formData.added_by?.modified_by || "-"}
            </div>
          </div>
          <div className="individual-tabs">
            <label>Last Modified by</label>
            <div className="uneditable">
              {formData.last_modified_by?.modified_by || "-"}
            </div>
          </div>
        </div>

        {/* === Work Info === */}
        <h3 className="section-header">Work</h3>
        <div className="tab-content">
          {renderDate("Date of Joining", "doj")}
          {renderField("Location", "location")}
          {renderField("Title", "designation")}
          {renderField("Department", "department")}
          {renderSelect("Employee Status", "status", [
            "active",
            "inactive",
            "resigned",
          ])}
          {renderField("Source of Hire", "source_of_hire")}
          {/* Reporting managers */}
          <div className="individual-tabs">
            <label>Reporting Manager</label>
            {editMode ? (
              <select
                name="reporting_manager"
                value={formData.reporting_manager || ""}
                onChange={handleChange}
              >
                <option value="">Select Reporting Manager</option>
                {managers.map((manager) => (
                  <option key={manager.employee_id} value={manager.employee_id}>
                    {manager.employee_code} - {manager.employee_name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="uneditable">
                {(() => {
                  const manager = managers.find(
                    (m) => m.employee_id === formData.reporting_manager
                  );
                  return manager
                    ? `${manager.employee_code} - ${manager.employee_name}`
                    : "-";
                })()}
              </div>
            )}
          </div>

          <div className="individual-tabs">
            <label>Secondary Reporting Manager</label>
            {editMode ? (
              <select
                name="second_reporting_manager"
                value={formData.second_reporting_manager || ""}
                onChange={handleChange}
              >
                <option value="">Select Secondary Reporting Manager</option>
                {managers.map((manager) => (
                  <option key={manager.employee_id} value={manager.employee_id}>
                    {manager.employee_code} - {manager.employee_name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="uneditable">
                {(() => {
                  const manager = managers.find(
                    (m) => m.employee_id === formData.second_reporting_manager
                  );
                  return manager
                    ? `${manager.employee_code} - ${manager.employee_name}`
                    : "-";
                })()}
              </div>
            )}
          </div>

          {renderField("Seating Location", "seating_location")}
          {renderSelect("Employment Type", "employment_type", [
            "Fulltime",
            "Probation",
            "Internship",
            "Contract",
          ])}
          {renderField("Work Phone", "work_phone")}
          {renderField("Extension", "extension")}
        </div>

        {/* === Personal Details === */}
        <h3 className="section-header">Personal Details</h3>
        <div className="tab-content">
          {renderDate("Date of Birth", "dob")}
          {renderSelect("Gender", "gender", ["Male", "Female", "Others"])}
          {renderSelect("Marital Status", "marital_status", [
            "Single",
            "Married",
            "Divorced",
            "Widowed",
            "Separated",
          ])}
          {renderDate("Wedding Date", "wedding_date")}
          {renderField("Permanent Address", "permanent_address")}
          {renderField("Current Address", "local_address")}
          {renderField("Mobile Phone", "contact_number")}
          {renderField("Emergency Contact Name", "emergency_contact_name")}
          {renderField(
            "Emergency Contact Relationship",
            "emergency_contact_relationship"
          )}
          {renderField("Emergency Contact Number", "emergency_contact_number")}
          {renderField("Blood Group", "blood_group")}
          {renderField("Personal Email", "personal_email")}
          {renderField("Identification Marks", "identification_marks")}
        </div>

        {/* === Additional Details === */}
        <h3 className="section-header">Additional Details</h3>
        <div className="tab-content">
          {renderField("Aadhaar", "aadhaar_number")}
          {renderField("PAN Number", "PAN")}
          {renderField("UAN", "UAN")}
          {renderField("PF Number", "pf_number")}
          {renderField("ESI Number", "esi_number")}
          {renderField("Passport Number", "passport_number")}
          {renderDate("Passport Validity", "passport_validity")}
          {renderField("Remarks", "remarks")}
          {renderField("Account Number", "account_number")}
          {renderField("IFSC Code", "ifsc_code")}
          {renderField("Bank Name", "bank_name")}
          {renderField("Branch Name", "bank_branch_name")}
          {renderField("Bank Address", "bank_address")}
        </div>

        {/* === Language Table === */}

        <h3 className="section-header">Languages</h3>
        <table className="info-table">
          <thead>
            <tr>
              <th>Language</th>
              <th>Read</th>
              <th>Write</th>
              <th>Speak</th>
              {editMode && <th></th>}
            </tr>
          </thead>
          <tbody>
            {editMode ? (
              <>
                {languagesKnown.map((l, i) => (
                  <tr key={`known-${i}`}>
                    <td>
                      <input
                        value={l.language}
                        onChange={(e) =>
                          handleRowChange(
                            i,
                            "language",
                            e.target.value,
                            languagesKnown,
                            setLanguagesKnown
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
                            languagesKnown,
                            setLanguagesKnown
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
                            languagesKnown,
                            setLanguagesKnown
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
                            languagesKnown,
                            setLanguagesKnown
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
                          deleteKnownRow(
                            l.id,
                            "languages-known",
                            languagesKnown,
                            setLanguagesKnown
                          )
                        }
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
                {languages.map((l, i) => (
                  <tr key={`new-${i}`}>
                    <td>
                      <input
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
              </>
            ) : (
              <>
                {languagesKnown && languagesKnown.length > 0 ? (
                  languagesKnown.map((lang) => (
                    <tr key={lang.id}>
                      <td>{lang.language || "-"}</td>
                      <td>{lang.read || "-"}</td>
                      <td>{lang.write || "-"}</td>
                      <td>{lang.speak || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No languages available
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
        {editMode && (
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
        )}

        <h3 className="section-header">Dependant</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Relationship</th>
                <th>Date of Birth</th>
                <th>Age</th>
                {editMode && <th></th>}
              </tr>
            </thead>
            <tbody>
              {editMode ? (
                <>
                  {/* Existing Dependants */}
                  {dependantsKnown.map((d, i) => (
                    <tr key={`known-dep-${i}`}>
                      <td>
                        <input
                          value={d.name}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "name",
                              e.target.value,
                              dependantsKnown,
                              setDependantsKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={d.relationship}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "relationship",
                              e.target.value,
                              dependantsKnown,
                              setDependantsKnown
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
                                dependantsKnown,
                                setDependantsKnown
                              );
                              handleRowChange(
                                i,
                                "age",
                                age,
                                dependantsKnown,
                                setDependantsKnown
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
                        <input value={d.age} readOnly />
                      </td>
                      <td>
                        <button
                          className="employee-delete-button"
                          type="button"
                          onClick={() =>
                            deleteKnownRow(
                              d.id,
                              "dependant",
                              dependantsKnown,
                              setDependantsKnown
                            )
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Newly Added Dependants */}
                  {dependants.map((d, i) => (
                    <tr key={`new-dep-${i}`}>
                      <td>
                        <input
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
                        <input value={d.age} readOnly />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="employee-delete-button"
                          onClick={() =>
                            setDependants(
                              dependants.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ) : dependantsKnown.length > 0 ? (
                dependantsKnown.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.relationship}</td>
                    <td>
                      {d.date_of_birth
                        ? format(new Date(d.date_of_birth), "dd-MMM-yyyy")
                        : "-"}
                    </td>
                    <td>{d.age}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No dependants available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {editMode && (
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
          )}
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
                {editMode && <th></th>}
              </tr>
            </thead>
            <tbody>
              {editMode ? (
                <>
                  {workExperienceKnown.map((w, i) => (
                    <tr key={`known-work-${i}`}>
                      <td>
                        <input
                          value={w.company_name}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "company_name",
                              e.target.value,
                              workExperienceKnown,
                              setWorkExperienceKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={w.company_role}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "company_role",
                              e.target.value,
                              workExperienceKnown,
                              setWorkExperienceKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <DatePicker
                          selected={w.start_date}
                          onChange={(date) =>
                            handleRowChange(
                              i,
                              "start_date",
                              date,
                              workExperienceKnown,
                              setWorkExperienceKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <DatePicker
                          selected={w.end_date}
                          onChange={(date) =>
                            handleRowChange(
                              i,
                              "end_date",
                              date,
                              workExperienceKnown,
                              setWorkExperienceKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="employee-delete-button"
                          type="button"
                          onClick={() =>
                            deleteKnownRow(
                              w.id,
                              "work-experience",
                              workExperienceKnown,
                              setWorkExperienceKnown
                            )
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                  {workExperience.map((w, i) => (
                    <tr key={`new-work-${i}`}>
                      <td>
                        <input
                          value={w.company_name}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "company_name",
                              e.target.value,
                              workExperience,
                              setWorkExperience
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={w.company_role}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "company_role",
                              e.target.value,
                              workExperience,
                              setWorkExperience
                            )
                          }
                        />
                      </td>
                      <td>
                        <DatePicker
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
                        />
                      </td>
                      <td>
                        <DatePicker
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
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="employee-delete-button"
                          onClick={() =>
                            setWorkExperience(
                              workExperience.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ) : workExperienceKnown.length > 0 ? (
                workExperienceKnown.map((w) => (
                  <tr key={w.id}>
                    <td>{w.company_name}</td>
                    <td>{w.company_role}</td>
                    <td>
                      {w.start_date
                        ? format(new Date(w.start_date), "dd-MMM-yyyy")
                        : "-"}
                    </td>
                    <td>
                      {w.end_date
                        ? format(new Date(w.end_date), "dd-MMM-yyyy")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No work experience available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {editMode && (
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
          )}
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
                {editMode && <th></th>}
              </tr>
            </thead>
            <tbody>
              {editMode ? (
                <>
                  {educationKnown.map((e, i) => (
                    <tr key={`known-edu-${i}`}>
                      <td>
                        <input
                          value={e.institution_name}
                          onChange={(ev) =>
                            handleRowChange(
                              i,
                              "institution_name",
                              ev.target.value,
                              educationKnown,
                              setEducationKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={e.degree}
                          onChange={(ev) =>
                            handleRowChange(
                              i,
                              "degree",
                              ev.target.value,
                              educationKnown,
                              setEducationKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={e.specialization}
                          onChange={(ev) =>
                            handleRowChange(
                              i,
                              "specialization",
                              ev.target.value,
                              educationKnown,
                              setEducationKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <DatePicker
                          selected={e.date_of_completion}
                          onChange={(date) =>
                            handleRowChange(
                              i,
                              "date_of_completion",
                              date,
                              educationKnown,
                              setEducationKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="employee-delete-button"
                          type="button"
                          onClick={() =>
                            deleteKnownRow(
                              e.id,
                              "education",
                              educationKnown,
                              setEducationKnown
                            )
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                  {education.map((e, i) => (
                    <tr key={`new-edu-${i}`}>
                      <td>
                        <input
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
                        <DatePicker
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
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="employee-delete-button"
                          onClick={() =>
                            setEducation(
                              education.filter((_, idx) => idx !== i)
                            )
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ) : educationKnown.length > 0 ? (
                educationKnown.map((e) => (
                  <tr key={e.id}>
                    <td>{e.institution_name}</td>
                    <td>{e.degree}</td>
                    <td>{e.specialization}</td>
                    <td>
                      {e.date_of_completion
                        ? format(new Date(e.date_of_completion), "dd-MMM-yyyy")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No education available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {editMode && (
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
          )}
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
                {editMode && <th></th>}
              </tr>
            </thead>
            <tbody>
              {editMode ? (
                <>
                  {assetsKnown.map((a, i) => (
                    <tr key={`known-asset-${i}`}>
                      <td>
                        <input
                          value={a.type}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "type",
                              e.target.value,
                              assetsKnown,
                              setAssetsKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={a.model}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "model",
                              e.target.value,
                              assetsKnown,
                              setAssetsKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          value={a.serialnumber}
                          onChange={(e) =>
                            handleRowChange(
                              i,
                              "serialnumber",
                              e.target.value,
                              assetsKnown,
                              setAssetsKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <DatePicker
                          selected={a.given_date}
                          onChange={(date) =>
                            handleRowChange(
                              i,
                              "given_date",
                              date,
                              assetsKnown,
                              setAssetsKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <DatePicker
                          selected={a.return_date}
                          onChange={(date) =>
                            handleRowChange(
                              i,
                              "return_date",
                              date,
                              assetsKnown,
                              setAssetsKnown
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          className="employee-delete-button"
                          type="button"
                          onClick={() =>
                            deleteKnownRow(
                              a.id,
                              "assets",
                              assetsKnown,
                              setAssetsKnown
                            )
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                  {assets.map((a, i) => (
                    <tr key={`new-asset-${i}`}>
                      <td>
                        <input
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
                        <DatePicker
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
                        />
                      </td>
                      <td>
                        <DatePicker
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
                        />
                      </td>
                      <td>
                        <button
                          className="employee-delete-button"
                          type="button"
                          onClick={() =>
                            setAssets(assets.filter((_, idx) => idx !== i))
                          }
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                </>
              ) : assetsKnown.length > 0 ? (
                assetsKnown.map((a) => (
                  <tr key={a.id}>
                    <td>{a.type}</td>
                    <td>{a.model}</td>
                    <td>{a.serialnumber}</td>
                    <td>
                      {a.given_date
                        ? format(new Date(a.given_date), "dd-MMM-yyyy")
                        : "-"}
                    </td>
                    <td>
                      {a.return_date
                        ? format(new Date(a.return_date), "dd-MMM-yyyy")
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No assets available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {editMode && (
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
          )}
        </div>

        {/* === Attachments === */}

        <h3 className="section-header">Attachments</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>{editMode ? "Upload New File" : "File"}</th>
                <th>{editMode ? "" : "Uploaded At"}</th>
                {editMode && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {editMode ? (
                attachments.map((att, index) => (
                  <tr key={index}>
                    <td>{att.name || att.document_type}</td>
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
                    <td>-</td>
                  </tr>
                ))
              ) : attachmentsKnown && attachmentsKnown.length > 0 ? (
                attachmentsKnown.map((att) => (
                  <tr key={att.id}>
                    <td>{att.document_type}</td>
                    <td>
                      <a
                        href={`${config.apiBaseURL}${att.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </td>
                    <td>
                      {att.uploaded_at
                        ? new Date(att.uploaded_at).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No attachments available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* <h3 className="section-header">Attachments</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>File</th>
                <th>Uploaded At</th>
                {editMode && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {attachmentsKnown.map((file) => {
                const fullFilename = file.file.split("/").pop();
                const match = fullFilename.match(/^(.+?)_[a-zA-Z0-9]+\.(\w+)$/);
                const filename = match
                  ? `${match[1]}.${match[2]}`
                  : fullFilename;

                return (
                  <tr key={file.id}>
                    <td>{file.document_type || "-"}</td>
                    <td>
                      <a
                        href={config.apiBaseURL + file.file}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {filename}
                      </a>
                    </td>
                    <td>
                      {file.uploaded_at
                        ? new Date(file.uploaded_at).toLocaleString()
                        : "-"}
                    </td>
                    {editMode && (
                      <td>
                        <button
                          type="button"
                          className="employee-delete-button"
                          onClick={async () => {
                            try {
                              await fetch(
                                `${config.apiBaseURL}/attachments/${file.id}/`,
                                {
                                  method: "DELETE",
                                }
                              );
                              setAttachmentsKnown((prev) =>
                                prev.filter((att) => att.id !== file.id)
                              );
                              showSuccessToast(
                                "Attachment deleted successfully"
                              );
                            } catch (error) {
                              console.error(
                                "Failed to delete attachment:",
                                error
                              );
                              showErrorToast("Failed to delete attachment");
                            }
                          }}
                        >
                          X
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}

              {newAttachments.map((file, index) => (
                <tr key={`new-${index}`}>
                  <td>New Upload</td>
                  <td>{file.name}</td>
                  <td>-</td>
                  {editMode && (
                    <td>
                      <button
                        type="button"
                        className="employee-delete-button"
                        onClick={() => removeNewAttachment(index)}
                      >
                        X
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {attachmentsKnown.length === 0 && attachments.length === 0 && (
                <tr>
                  <td
                    colSpan={editMode ? 4 : 3}
                    style={{ textAlign: "center" }}
                  >
                    No attachments available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {editMode && (
            <div
              className="file-upload-container"
              style={{ marginTop: "10px" }}
            >
              <input
                type="file"
                id="new-attachments-input"
                multiple
                style={{ display: "none" }}
                onChange={handleAttachmentChange}
              />
              <label
                htmlFor="new-attachments-input"
                className="plus-upload-button"
              >
                + Add Attachments
              </label>
            </div>
          )}
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
      <ToastContainerComponent />
    </div>
  );
};

export default EditEmployee;
