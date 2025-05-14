import React, { useState } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const TeamLeadLeaveRequestForm = ({ leaveType, onClose }) => {
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
    data.append("start_date", format(formData.startDate, "yyyy-MM-dd"));
    data.append("end_date", format(formData.endDate, "yyyy-MM-dd"));
    data.append("duration", formData.duration);
    data.append("reason", formData.reason);
    data.append(
      "resumption_date",
      format(formData.resumptionDate, "yyyy-MM-dd")
    );
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
    const employeeId = user.employee_id;
    const fetchURL = `${config.apiBaseURL}/leaves-available/by_employee/${employeeId}/`;

    try {
      // 1. Fetch current leave availability
      const getRes = await fetch(fetchURL);
      if (!getRes.ok) {
        const err = await getRes.json();
        console.error("Failed to fetch current leave balance:", err);
        return;
      }

      const currentData = await getRes.json();
      const currentLeaveBalance = currentData[leaveTypeKey];

      // 2. Subtract duration manually
      const updatedLeave = currentLeaveBalance - parseFloat(duration);

      // 3. Send PATCH request with updated value
      const patchRes = await fetch(fetchURL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [leaveTypeKey]: updatedLeave }),
      });

      if (!patchRes.ok) {
        const err = await patchRes.json();
        console.error("Leave balance update failed:", err);
      } else {
        const result = await patchRes.json();
        console.log("Leave balance updated:", result);
      }
    } catch (err) {
      console.error("Error in patchLeaveAvailability:", err);
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
        {/* <input type="date" name="" id="" /> */}

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
                className="input1"
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
                className="input1"
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
                placeholderText="dd-mm-yyyy "
                className="input1"
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
          <label className="label1">Reason for Leave</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            className="textarea1"
          />
        </div>

        <div className="form-group1">
          <label className="label1">
            Attach Handover Document (pdf, jpg format)
          </label>
          <div className="custom-file-container">
            <label htmlFor="fileUpload" className="custom-file-label">
              <span className="choose-btn">Choose File</span>
            </label>
            <input
              type="file"
              id="fileUpload"
              name="attachment"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
              className="real-file-input"
            />
            {formData.attachment && (
              <div className="file-info">
                Selected File: <strong>{formData.attachment.name}</strong>
              </div>
            )}
            <div className="file-info">Max size 2MB</div>
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

export default TeamLeadLeaveRequestForm;
