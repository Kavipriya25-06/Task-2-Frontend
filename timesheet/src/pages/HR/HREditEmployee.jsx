import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import config from "../../config";
import { cleanFormData } from "../../utils/cleanFormData";
import cameraIcon from "../../assets/camera.png";
import userPlaceholder from "../../assets/user.png";
import plusIcon from "../../assets/plus.png";



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

  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [selectedProfilePicture, setSelectedProfilePicture] = useState(null);
  const [newAttachments, setNewAttachments] = useState([]);


  const [formData, setFormData] = useState({
    employee_code: "",
    employee_name: "",
    fathers_name: "",
    gender: "",
    dob: "",
    doj: "",
    contact_number: "",
    personal_email: "",
    aadhaar_number: "",
    PAN: "",
    UAN: "",
    pf_number: "",
    esi_number: "",
    passport_number: "",
    passport_validity: "",
    status: "active",
    remarks: "",
    permanent_address: "",
    local_address: "",
    employment_type: "",
    designation: "",
    department: "",
    qualification: "",
    year_of_passing: "",
    previous_company_name: "",
    arris_experience: "",
    total_experience: "",
    probation_confirmation_date: "",
    employee_email: "",
    reporting_manager: "",
    resignation_date: "",
    relieving_date: "",
    account_number: "",
    ifsc_code: "",
    bank_name: "",
    emergency_contact_name: "",
    emergency_contact_number: "",
    blood_group: "",
  });

  useEffect(() => {
    fetchEmployee();
  }, [employee_id]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/employees/${employee_id}/`);
      const data = await response.json();
      setFormData(data);
      
      // 👇 Set Profile Picture if exists
      if (data.profile_picture) {
        setProfilePictureUrl(config.apiBaseURL + data.profile_picture); 
      }
  
      // 👇 Fetch Attachments separately
      const attachResponse = await fetch(`${config.apiBaseURL}/attachments/employee/${employee_id}`);
      const attachData = await attachResponse.json();
      console.log(attachData, "attachments");
      setAttachments(attachData);  // assuming attachData is a list of attachments
  
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    setNewAttachments((prev) => [...prev, ...files]);
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

      if (selectedProfilePicture) {
        const formData = new FormData();
        formData.append("profile_picture", selectedProfilePicture);
  
        const imageUploadResponse = await fetch(`${config.apiBaseURL}/employees/${employee_id}/`, {
          method: "PATCH",
          body: formData,
        });
  
        if (!imageUploadResponse.ok) throw new Error("Failed to upload profile picture");
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
        const attachResponse = await fetch(`${config.apiBaseURL}/attachments/employee/${employee_id}`);
        const attachData = await attachResponse.json();
        setAttachments(attachData);
        setNewAttachments([]);
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
                src={selectedProfilePicture ? URL.createObjectURL(selectedProfilePicture) : profilePictureUrl || userPlaceholder}
                alt="Profile"
                className="profile-picture-img"
              />

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                id="profile-picture-input"
                className="profile-picture-input"
                onChange={(e) => setSelectedProfilePicture(e.target.files[0])}
              />

              {/* Camera Icon */}
              <label htmlFor="profile-picture-input" className="camera-icon-label">
                <img
                  src={cameraIcon}
                  alt="Edit"
                  className="camera-icon-img"
                />
              </label>
            </div>



            <div className="attachments-box">
              <h4>Attachments:</h4>
              <ul className="attachments-list">
                {attachments.map((file, index) => {
                  const filename = file.file.split("/").pop().split("_").slice(1).join("_"); // Extract original name
                  return (
                    <li key={file.id} className="attachment-item">
                      <a href={config.apiBaseURL + file.file} target="_blank" rel="noopener noreferrer">
                        {filename}
                      </a>
                      <button
                        className="remove-attachment"
                        onClick={async () => {
                          try {
                            await fetch(`${config.apiBaseURL}/attachments/${file.id}/`, {
                              method: "DELETE",
                            });
                            setAttachments(prev => prev.filter(att => att.id !== file.id));
                          } catch (error) {
                            console.error("Failed to delete attachment:", error);
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
                      onClick={() =>
                        setNewAttachments((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
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
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setNewAttachments((prev) => [...prev, ...files]);

              // Reset input so user can re-select same files
              e.target.value = "";
            }}
          />

            {/* Plus icon button */}
            <label htmlFor="new-attachments-input" className="add-attachment-button">
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
              <input
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                placeholder="Gender"
              />
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
              />
            </div>
            <div className="individual-tabs">
              <label>Phone Number</label>
              <input
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>
            <div className="individual-tabs">
              <label>Aadhaar</label>
              <input
                name="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={handleChange}
                placeholder="Aadhaar"
              />
            </div>
            <div className="individual-tabs">
              <label>PAN Number</label>
              <input
                name="PAN"
                value={formData.PAN}
                onChange={handleChange}
                placeholder="PAN Number"
              />
            </div>
            <div className="individual-tabs">
              <label>UAN</label>
              <input
                name="UAN"
                value={formData.UAN}
                onChange={handleChange}
                placeholder="UAN"
              />
            </div>
            <div className="individual-tabs">
              <label>PF Number</label>
              <input
                name="pf_number"
                value={formData.pf_number}
                onChange={handleChange}
                placeholder="PF Number"
              />
            </div>
            <div className="individual-tabs">
              <label>ESI Number</label>
              <input
                name="esi_number"
                value={formData.esi_number}
                onChange={handleChange}
                placeholder="ESI Number"
              />
            </div>
            <div className="individual-tabs">
              <label>Passport Number</label>
              <input
                name="passport_number"
                value={formData.passport_number}
                onChange={handleChange}
                placeholder="Passport Number"
              />
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
              <input
                type="number"
                name="arris_experience"
                value={formData.arris_experience}
                onChange={handleChange}
                placeholder="Arris Experience"
              />
            </div>
            <div className="individual-tabs">
              <label>Total Experience</label>
              <input
                name="total_experience"
                value={formData.total_experience}
                onChange={handleChange}
                placeholder="Total Experience"
              />
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
              />
            </div>
            <div className="individual-tabs">
              <label>Reporting Manager</label>
              <input
                name="reporting_manager"
                value={formData.reporting_manager}
                onChange={handleChange}
                placeholder="Reporting Manager"
              />
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
              />
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
