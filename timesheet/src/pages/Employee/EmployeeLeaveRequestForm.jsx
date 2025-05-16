import React, { useState,useEffect } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format ,differenceInCalendarDays } from "date-fns";

const EmployeeLeaveRequestForm = ({ leaveType, onClose }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    leaveType: leaveType,
    startDate: "",
    endDate: "",
    duration: "",
    resumptionDate: "",
    reason: "",
    attachment: null,
  });

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
          const duration = differenceInCalendarDays(
            new Date(formData.endDate),
            new Date(formData.startDate)
          ) + 1; // +1 to include both start and end dates
          setFormData((prev) => ({ ...prev, duration: duration.toString() }));
        } else {
          setFormData((prev) => ({ ...prev, duration: "" }));
        }
      }, [formData.startDate, formData.endDate]);
  

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const nonDuplicateFiles = newFiles.filter(
      (newFile) =>
        !selectedFiles.some(
          (existingFile) =>
            existingFile.name === newFile.name &&
            existingFile.size === newFile.size
        )
    );

    if (nonDuplicateFiles.length < newFiles.length) {
      alert("This file has already been added. Please choose a different one.");
    }

    setSelectedFiles((prevFiles) => [...prevFiles, ...nonDuplicateFiles]);
    e.target.value = "";
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     if (formData.endDate < formData.startDate) {
      alert("End date must be the same or after the start date.");
      return;
    }

    if (formData.resumptionDate <= formData.endDate) {
      alert("Resumption date must be after the end date.");
      return;
    }

    const apiURL = `${config.apiBaseURL}/leaves-taken/`;

    const leaveTypeMap = {
      Sick: "sick_leave",
      Casual: "casual_leave",
      "Comp off": "comp_off",
      Earned: "earned_leave",
      "": "others", // Default if no match
    };

    const mappedLeaveType = leaveTypeMap[formData.leaveType] || "others";

    const data = new FormData();
    data.append("leave_type", mappedLeaveType);
    data.append("start_date", formData.startDate);
    data.append("end_date", formData.endDate);
    data.append("duration", formData.duration);
    data.append("reason", formData.reason);
    data.append("resumption_date", formData.resumptionDate);
    if (formData.attachment) {
      data.append("attachment", formData.attachment);
    }
    data.append("employee", user.employee_id); // Assuming employee_id like "EMP_00068"
    data.append("status", "pending"); // Default status when submitted

    try {
      const response = await fetch(apiURL, {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Leave submitted successfully:", result);
        alert("Leave Request Submitted Successfully!");
        await patchLeaveAvailability(mappedLeaveType, formData.duration);

        onClose(); // Close form after successful submission
      } else {
        const errorData = await response.json();
        console.error("Submission failed", errorData);
        alert("Failed to submit leave request.");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert("An error occurred while submitting.");
    }
  };

  const patchLeaveAvailability = async (leaveTypeKey, duration) => {
    const patchURL = `${config.apiBaseURL}/leaves-available/by_employee/${user.employee_id}/`;

    const payload = {
      [leaveTypeKey]: -parseFloat(duration), // Deduct the requested duration
    };

    try {
      const res = await fetch(patchURL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Leave availability update failed:", err);
      }
    } catch (err) {
      console.error("Error patching leave availability:", err);
    }
  };

  
  return (
    <div className="form-containers">
      <p className="form-subtitle1">
        Fill the required fields below to apply for annual leave.
      </p>
      <form onSubmit={handleSubmit} className="form1">
        <div className="form-group1">
          <label className="label1">Leave Type</label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            className="select1"
          >
            {/* <option value="">Select Leave Type</option> */}
            <option value="Sick">Sick</option>
            <option value="Casual">Casual</option>
            <option value="Comp off">Comp off</option>
            <option value="Earned">Earned</option>
            <option value="">Others</option>
          </select>
        </div>

        <div className="row1">
          <div className="form-group-half1">
            <label className="label1">Start Date</label>
            <div className="date-input-container">
              <DatePicker
                selected={formData.startDate}
                onChange={(date) =>
                  handleChange({ target: { name: "startDate", value: date } })
                }
                dateFormat="dd-MMM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="date1"
              />
              <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              {/* Font Awesome Calendar Icon */}
            </div>
          </div>
          <div className="form-group-half1">
            <label className="label1">End Date</label>
            <div className="date-input-container">
              <DatePicker
                selected={formData.endDate}
                onChange={(date) =>
                  handleChange({ target: { name: "endDate", value: date } })
                }
                dateFormat="dd-MMM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="date1"
                minDate={formData.startDate || null}
              />
              <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              {/* Font Awesome Calendar Icon */}
            </div>
          </div>
        </div>

        <div className="row1">
          <div className="form-group-half1">
            <label className="label1">Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="input1"
              readOnly
            />
          </div>
          <div className="form-group-half1">
            <label className="label1">Resumption Date</label>
            <div className="date-input-container">
              <DatePicker
                selected={formData.resumptionDate}
                onChange={(date) =>
                  handleChange({
                    target: { name: "resumptionDate", value: date },
                  })
                }
                dateFormat="dd-MMM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="date1"
                minDate={
                  formData.endDate
                    ? new Date(formData.endDate.getTime() + 86400000)
                    : null
                }
              />
              <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              {/* Font Awesome Calendar Icon */}
            </div>
          </div>
        </div>

        <div className="form-group1">
          <label className="label1">Reason for leave</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="textarea1"
          />
        </div>

        <div className="form-group1">
          <label className="label1">Attachments (Max size 2MB)</label>
          <div className="multi-file-upload">
            <label htmlFor="fileUpload" className="upload-label">
              {/* <span className="upload-btn">+</span> */}
            </label>
            <input
              type="file"
              id="fileUpload"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={handleFileChange}
              className="file-input"
            />

            <div className="uploaded-files-container">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-chip">
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)}>&times;</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="button-groups">
          <button type="submit" className="btn-save">
            Submit
          </button>
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeLeaveRequestForm;
