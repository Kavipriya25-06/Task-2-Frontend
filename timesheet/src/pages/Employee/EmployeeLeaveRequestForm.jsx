import React, { useState } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";

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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiURL = `${config.apiBaseURL}/leaves-taken/`; 

    const leaveTypeMap = {
      "Sick": "sick_leave",
      "Casual": "casual_leave",
      "Comp off": "comp_off",
      "Earned": "earned_leave",
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

  return (
    <div className="form-container1">
      <p className="form-subtitle1">Fill the required fields below to apply for annual leave.</p>
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
            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input1" />
          </div>
          <div className="form-group-half1">
            <label className="label1">End Date</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="input1" />
          </div>
        </div>

        <div className="row1">
          <div className="form-group-half1">
            <label className="label1">Duration</label>
            <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="input1" />
          </div>
          <div className="form-group-half1">
            <label className="label1">Resumption Date</label>
            <input type="date" name="resumptionDate" value={formData.resumptionDate} onChange={handleChange} className="input1" />
          </div>
        </div>

        <div className="form-group1">
          <label className="label1">Reason for leave</label>
          <textarea name="reason" value={formData.reason} onChange={handleChange} className="textarea1" />
        </div>

        <div className="form-group1">
          <label className="label1">Attach handover document (pdf, jpg format)</label>
          <input type="file" name="attachment" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="file-input1" />
        </div>

        <div className="button-group1">
          <button type="submit" className="submit-button1">Submit</button>
          <button type="button" onClick={onClose} className="cancel-button1">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeLeaveRequestForm;

