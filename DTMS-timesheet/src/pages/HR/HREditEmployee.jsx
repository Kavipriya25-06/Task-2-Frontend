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

import usePlaceholder from "/profile_icon.svg";
import cameraIcon from "/camera.png";
// import plusIcon from "/plus.png";
import { useAttachmentManager } from "../../constants/useAttachmentManager";
import { useEmployeeFormHandler } from "../../constants/useEmployeeFormHandler";
import { defaultEmployeeFormData } from "../../constants/defaultEmployeeFormData";

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
  const managerId = user?.employee_id;
  const navigate = useNavigate();

  const [managers, setManagers] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [attachmentsKnown, setAttachmentsKnown] = useState([]);
  const [attachments, setAttachments] = useState([
    { document_type: "PAN", name: "PAN", files: [] },
    { document_type: "Aadhaar", name: "Aadhaar", files: [] },
    { document_type: "bank", name: "Bank Details", files: [] },
    { document_type: "Degree", name: "Degree Certificate", files: [] },
    { document_type: "marksheets", name: "Mark Sheets", files: [] },
    { document_type: "resume", name: "Resume", files: [] },
    {
      document_type: "empletter",
      name: "Signed Employment Letter",
      files: [],
    },
    {
      document_type: "relievingletter",
      name: "Last Company Relieving Letter",
      files: [],
    },
    { document_type: "payslip", name: "Last Company Payslip", files: [] },
    {
      document_type: "idproof",
      name: "ID Proof/Driving ID/Voter ID",
      files: [],
    },
    {
      document_type: "revisedappraisal",
      name: "Revised appraisal letter",
      files: [],
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

  // selected={formData[name]}
  //         onChange={(date) =>
  //           setFormData({ ...formData, [name]: format(date, "yyyy-MM-dd") })
  //         }

  const handleDateRowChange = (index, name, value, state, stateSetter) => {
    const newRows = [...state];
    newRows[index][name] = format(value, "yyyy-MM-dd");
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

  const handleFileAdd = (e, docIndex) => {
    const files = Array.from(e.target.files).map((f) => ({
      file: URL.createObjectURL(f), // for preview
      name: f.name, // store original name
      uploaded_at: new Date().toISOString(),
      newFile: f,
    }));
    const updated = [...attachments];
    updated[docIndex].files.push(...files);
    setAttachments(updated);
    e.target.value = "";
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

      const newAttachments = attachments.map((doc) => ({
        ...doc,
        files: data.attachments.filter(
          (att) => att.document_type === doc.document_type
        ),
      }));
      setAttachments(newAttachments);
      // setAttachments(data.attachments);
      // const updated = data.attachments.map((attachment) => {
      //   const match = attachments.find(
      //     (doc) => doc.document_type === attachment.document_type
      //   );
      //   return {
      //     ...attachment,
      //     file: match ? match.file : null, // or match if you want to store whole object
      //   };
      // });

      // setAttachments(updated);

      if (data.profile_picture)
        setProfilePictureUrl(config.apiBaseURL + data.profile_picture);
      // setLoading(false);
    } catch (err) {
      console.error("Error fetching managers:", err);
    }
  };

  // console.log("Dependants", dependants);
  const fetchManagers = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/active-teamlead-and-managers/`
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

      // === Common helper for PATCH & POST ===
      const batchRequests = (items, endpoint, method, idKey) =>
        items.map((item) =>
          fetch(
            `${config.apiBaseURL}/${endpoint}${
              idKey ? `/${item[idKey]}/` : "/"
            }`,
            {
              method,
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                idKey ? item : { ...item, employee: employeeId }
              ),
            }
          )
        );

      // === Execute all updates in parallel ===
      await Promise.all([
        ...batchRequests(assetsKnown, "assets", "PATCH", "id"),
        ...batchRequests(assets, "assets", "POST"),
        ...batchRequests(dependantsKnown, "dependant", "PATCH", "id"),
        ...batchRequests(dependants, "dependant", "POST"),
        ...batchRequests(educationKnown, "education", "PATCH", "id"),
        ...batchRequests(education, "education", "POST"),
        ...batchRequests(workExperienceKnown, "work-experience", "PATCH", "id"),
        ...batchRequests(workExperience, "work-experience", "POST"),
        ...batchRequests(languagesKnown, "languages-known", "PATCH", "id"),
        ...batchRequests(languages, "languages-known", "POST"),
      ]);
      // Attachments
      await uploadNewAttachments(employeeId, attachments);

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
    } catch (error) {
      showErrorToast(`Failed to create user: ${error.message}`);
    }
  };

  const uploadNewAttachments = async (employeeId, attachments) => {
    const uploadPromises = [];

    attachments.forEach((att) => {
      att.files?.forEach((file) => {
        if (file.newFile) {
          const form = new FormData();
          form.append("file", file.newFile);
          form.append("document_type", att.document_type);
          form.append("employee", employeeId);

          uploadPromises.push(
            fetch(`${config.apiBaseURL}/employee-attachment/`, {
              method: "POST",
              body: form,
            })
              .then((res) => {
                if (!res.ok)
                  throw new Error(
                    `Failed to upload ${file.newFile.name || "file"}`
                  );
                return res.json();
              })
              .then((savedFile) => {
                // Replace blob URL with actual API path
                file.file = savedFile.file;
                file.id = savedFile.id;
                file.uploaded_at = savedFile.uploaded_at;
                delete file.newFile;
              })
              .catch((err) => {
                console.error("Upload failed:", err);
                showErrorToast(
                  `Failed to upload ${file.newFile.name || "file"}`
                );
              })
          );
        }
      });
    });

    await Promise.all(uploadPromises);
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

  const fileName = (file) => {
    if (!file.file) return "";
    const fullFilename = file.file.split("/").pop();
    const match = fullFilename.match(/^(.+?)_[a-zA-Z0-9]+\.(\w+)$/);
    const filename = match ? `${match[1]}.${match[2]}` : fullFilename;

    return filename;
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
              // setFormData({ ...prev, [name]: format(date, "yyyy-MM-dd") })
              setFormData((prev) => ({
                ...prev,
                [name]: format(date, "yyyy-MM-dd"),
              }))
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
              {`${formData.added_by?.modified_by?.employee_code} - ${formData.added_by?.modified_by?.employee_name}` ||
                "-"}
            </div>
          </div>
          <div className="individual-tabs">
            <label>Last Modified by</label>
            <div className="uneditable">
              {`${formData.last_modified_by?.modified_by?.employee_code} - ${formData.last_modified_by?.modified_by?.employee_name}` ||
                "-"}
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
                              const age = date
                                ? calculateExactAge(new Date(date))
                                : "";
                              handleDateRowChange(
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
                              const age = date
                                ? calculateExactAge(new Date(date))
                                : "";
                              handleDateRowChange(
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
                        <div className="date-input-container-info">
                          <DatePicker
                            portalId="root-portal"
                            selected={w.start_date}
                            onChange={(date) =>
                              handleDateRowChange(
                                i,
                                "start_date",
                                date,
                                workExperienceKnown,
                                setWorkExperienceKnown
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
                              handleDateRowChange(
                                i,
                                "end_date",
                                date,
                                workExperienceKnown,
                                setWorkExperienceKnown
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
                        <div className="date-input-container-info">
                          <DatePicker
                            portalId="root-portal"
                            selected={w.start_date}
                            onChange={(date) =>
                              handleDateRowChange(
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
                              handleDateRowChange(
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
                        <div className="date-input-container-info">
                          <DatePicker
                            portalId="root-portal"
                            selected={e.date_of_completion}
                            onChange={(date) =>
                              handleDateRowChange(
                                i,
                                "date_of_completion",
                                date,
                                educationKnown,
                                setEducationKnown
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
                        <div className="date-input-container-info">
                          <DatePicker
                            portalId="root-portal"
                            selected={e.date_of_completion}
                            onChange={(date) =>
                              handleDateRowChange(
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
                        <div className="date-input-container-info">
                          <DatePicker
                            portalId="root-portal"
                            selected={a.given_date}
                            onChange={(date) =>
                              handleDateRowChange(
                                i,
                                "given_date",
                                date,
                                assetsKnown,
                                setAssetsKnown
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
                              handleDateRowChange(
                                i,
                                "return_date",
                                date,
                                assetsKnown,
                                setAssetsKnown
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
                        <div className="date-input-container-info">
                          <DatePicker
                            portalId="root-portal"
                            selected={a.given_date}
                            onChange={(date) =>
                              handleDateRowChange(
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
                              handleDateRowChange(
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
        {/* final attachments table */}
        <h3 className="section-header">Attachments</h3>
        <div>
          <table className="info-table">
            <thead>
              <tr>
                <th style={{ width: "30%" }}>Document Type</th>
                <th>File(s)</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((doc, docIndex) => (
                <tr key={doc.document_type}>
                  <td>{doc.name || doc.document_type}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "5px",
                        alignItems: "center",
                      }}
                    >
                      {doc.files.length > 0 ? (
                        doc.files.map((file, fileIndex) => (
                          <div
                            key={file.id || fileIndex}
                            className={`attachment-item ${
                              file.newFile ? "unsaved" : ""
                            }`}
                            title={
                              file.uploaded_at
                                ? `Uploaded at ${new Date(
                                    file.uploaded_at
                                  ).toLocaleString()}`
                                : "-"
                            }
                          >
                            <a
                              href={`${config.apiBaseURL}${file.file}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {file.name || fileName(file) || ""}
                            </a>
                            {editMode && (
                              <button
                                type="button"
                                className="remove-attachment"
                                onClick={() => {
                                  fetch(
                                    `${config.apiBaseURL}/employee-attachment/${file.id}/`,
                                    { method: "DELETE" }
                                  )
                                    .then(() => {
                                      const updated = [...attachments];
                                      updated[docIndex].files = updated[
                                        docIndex
                                      ].files.filter((_, i) => i !== fileIndex);
                                      setAttachments(updated);
                                      showSuccessToast(
                                        "Attachment deleted successfully"
                                      );
                                    })
                                    .catch(() =>
                                      showErrorToast("Failed to delete file")
                                    );
                                }}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <span>No file uploaded</span>
                      )}
                      {editMode && (
                        <>
                          <input
                            type="file"
                            id={`file-input-${docIndex}`}
                            style={{ display: "none" }}
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileAdd(e, docIndex)}
                          />
                          <label
                            htmlFor={`file-input-${docIndex}`}
                            className="plus-upload-button"
                          >
                            +
                          </label>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
