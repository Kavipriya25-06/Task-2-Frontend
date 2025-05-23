import React, { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInCalendarDays } from "date-fns";
import { useAttachmentManager } from "../../constants/useAttachmentManager";
import useWorkingDays from "../../constants/useWorkingDays";

const ManagerLeaveRequestForm = ({ leaveType, onClose }) => {
  const { user } = useAuth();
  const [approvedCompOffDates, setApprovedCompOffDates] = useState([]);
  // const { duration, loading, error } = useWorkingDays(
  //   formData.startDate,
  //   formData.endDate
  // );
  const [calendarData, setCalendarData] = useState([]);
  const [nonWorkingDates, setNonWorkingDates] = useState([]);

  const [formData, setFormData] = useState({
    leaveType: leaveType,
    startDate: "",
    endDate: "",
    duration: "",
    resumptionDate: "",
    reason: "",
    attachment: [],
    leaveDayType: "",
  });
  const { duration, loading, error } = useWorkingDays(
    formData.startDate,
    formData.endDate
  );
  const {
    attachments,
    setAttachments,
    newAttachments,
    handleAttachmentChange,
    setNewAttachments,
    removeExistingAttachment,
    removeNewAttachment,
  } = useAttachmentManager([]);

  useEffect(() => {
    const fetchCalendar = async () => {
      const year = new Date().getFullYear();
      try {
        const res = await fetch(`${config.apiBaseURL}/calendar/?year=${year}`);
        const data = await res.json();
        setCalendarData(data);

        const nonWorking = data
          .filter((d) => d.is_weekend || d.is_holiday)
          .map((d) => new Date(d.date));
        setNonWorkingDates(nonWorking);
      } catch (err) {
        console.error("Failed to fetch calendar", err);
      }
    };

    fetchCalendar();
  }, []);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const daysDiff =
        differenceInCalendarDays(
          new Date(formData.endDate),
          new Date(formData.startDate)
        ) + 1;

      if (daysDiff === 1) {
        if (formData.leaveDayType === "half") {
          setFormData((prev) => ({ ...prev, duration: "0.5" }));
        } else if (formData.leaveDayType === "full") {
          setFormData((prev) => ({ ...prev, duration: "1" }));
        } else {
          setFormData((prev) => ({ ...prev, duration: "" }));
        }
      } else {
        if (!loading && !error) {
          setFormData((prev) => ({
            ...prev,
            duration: duration.toString(),
            leaveDayType: "",
          }));
        }
      }
    } else {
      setFormData((prev) => ({ ...prev, duration: "", leaveDayType: "" }));
    }
  }, [
    formData.startDate,
    formData.endDate,
    formData.leaveDayType,
    duration,
    loading,
    error,
  ]);

  useEffect(() => {
    const fetchApprovedCompOffDates = async () => {
      if (formData.leaveType === "Comp off" && user?.employee_id) {
        try {
          const response = await fetch(
            `${config.apiBaseURL}/comp-off-view/employee/${user.employee_id}/`
          );
          const data = await response.json();
          const approvedDates = data
            .filter((entry) => entry.status.toLowerCase() === "approved")
            .map((entry) => entry.date);
          setApprovedCompOffDates(approvedDates);
        } catch (err) {
          console.error("Failed to fetch comp-off dates:", err);
        }
      }
    };

    fetchApprovedCompOffDates();
  }, [formData.leaveType, user]);

  useEffect(() => {
    if (
      formData.startDate &&
      formData.endDate &&
      format(formData.startDate, "yyyy-MM-dd") !==
        format(formData.endDate, "yyyy-MM-dd")
    ) {
      setFormData((prev) => ({
        ...prev,
        duration: duration.toString(),
      }));
    }
  }, [duration]);

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
    if (newAttachments.length > 0) {
      for (const file of newAttachments) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("employee", user.employee_id);

        const uploadRes = await fetch(`${config.apiBaseURL}/attachments/`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          console.error("Failed to upload file:", file.name);
        }
      }
      setNewAttachments([]);

      // Refresh the list after all uploads
      // const attachResponse = await fetch(
      //   `${config.apiBaseURL}/attachments/project/${project_id}`
      // );
      // const attachData = await attachResponse.json();
      // setAttachments(attachData);
      // setNewAttachments([]);
    }
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
        <div
          className="row1"
          style={{ display: "flex", gap: "20px", alignItems: "flex-end" }}
        >
          <div className="form-group1" style={{ flex: 1 }}>
            <label className="label1">Leave Type</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="select1"
            >
              <option value="Sick">Sick</option>
              <option value="Casual">Casual</option>
              <option value="Comp off">Comp off</option>
              <option value="Earned">Earned</option>
              <option value="">Others</option>
            </select>
          </div>

          {formData.leaveType === "Comp off" && (
            <div className="form-group1" style={{ flex: 1.03 }}>
              <label className="label1">Select Date (for Comp off)</label>
              <select
                name="compOffDate"
                value={formData.compOffDate || ""}
                onChange={(e) => {
                  const selected = new Date(e.target.value);
                  setFormData((prev) => ({
                    ...prev,
                    compOffDate: e.target.value,
                    // startDate: selected,
                    // endDate: selected,
                    // leaveDayType: "full", // optionally default to full-day
                    // duration: "1", // or "0.5" based on requirement
                  }));
                }}
                className="select1"
              >
                <option value="">Select Approved Date</option>
                {approvedCompOffDates.map((date, index) => (
                  <option key={index} value={date}>
                    {format(new Date(date), "dd-MMM-yyyy")}
                  </option>
                ))}
              </select>
            </div>
          )}
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
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                excludeDates={nonWorkingDates}
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
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={formData.startDate || null}
                excludeDates={nonWorkingDates}
              />
              <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
              {/* Font Awesome Calendar Icon */}
            </div>
          </div>
        </div>

        <div className="row1">
          <div className="form-group-half1">
            <label className="label1">Duration</label>

            {formData.startDate &&
            formData.endDate &&
            format(formData.startDate, "yyyy-MM-dd") ===
              format(formData.endDate, "yyyy-MM-dd") ? (
              <div
                className="radio-group"
                style={{ display: "flex", gap: "20px" }}
              >
                <label>
                  <input
                    type="radio"
                    name="leaveDayType"
                    value="half"
                    checked={formData.leaveDayType === "half"}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, leaveDayType: "half" }))
                    }
                  />{" "}
                  Half-Day
                </label>
                <label>
                  <input
                    type="radio"
                    name="leaveDayType"
                    value="full"
                    checked={formData.leaveDayType === "full"}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, leaveDayType: "full" }))
                    }
                  />{" "}
                  Full-Day
                </label>
              </div>
            ) : (
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="input1"
                readOnly
              />
            )}
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
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
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
          <label className="label1">
            Attachments (pdf, jpg format) Max Size 2MB
          </label>

          <div className="plus-upload-wrapper">
            <label htmlFor="file-upload-input" className="plus-upload-button">
              +
            </label>
            <input
              type="file"
              id="file-upload-input"
              name="attachments"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={handleAttachmentChange}
              className="real-file-input"
            />

            {(attachments.length > 0 || newAttachments.length > 0) && (
              <div className="selected-files">
                {attachments.map((file, index) => (
                  <div key={index} className="file-chip">
                    <a
                      href={file.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-name"
                    >
                      {file.name}
                    </a>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => removeExistingAttachment(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {newAttachments.map((file, index) => (
                  <div key={`new-${index}`} className="file-chip">
                    <a
                      href={URL.createObjectURL(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="file-name"
                    >
                      {file.name}
                    </a>
                    <button
                      type="button"
                      className="remove-file"
                      onClick={() => removeNewAttachment(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
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

export default ManagerLeaveRequestForm;
