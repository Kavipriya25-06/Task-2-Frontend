import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import config from "../config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, differenceInCalendarDays } from "date-fns";
import { useAttachmentManager } from "../constants/useAttachmentManager";
import useWorkingDays from "../constants/useWorkingDays";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../constants/Toastify";

const LeaveRequestForm = ({ leaveType, onClose }) => {
  const { user } = useAuth();
  const [approvedCompOffDates, setApprovedCompOffDates] = useState([]);
  // const { duration, loading, error } = useWorkingDays(
  //   formData.startDate,
  //   formData.endDate
  // );
  const toYMD = (d) => (d ? format(d, "yyyy-MM-dd") : "");
  const isSameDay = (a, b) => a && b && toYMD(a) === toYMD(b);

  const [isSending, setIsSending] = useState(false);
  const submittingRef = useRef(false); // hard guard
  const [calendarData, setCalendarData] = useState([]);
  const [nonWorkingDates, setNonWorkingDates] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState({
    sick_leave: 0,
    casual_leave: 0,
    comp_off: 0,
    // earned_leave: 0,
  });
  const [formData, setFormData] = useState({
    leaveType: leaveType,
    startDate: "",
    endDate: "",
    duration: "",
    resumptionDate: "",
    reason: "",
    attachment: [],
    leaveDayType: "",
    compoff_request_id: "",
    compOffDate: "", // keep the credit’s own date (info only)
    compOffCreditDuration: null, // 1 or 0.5 (numeric)
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
    fetchCalendar();
    fetchLeaveAvailability();
  }, []);

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

  const calculateWorkingDays = (startDate, endDate, nonWorkingDates) => {
    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      const isHoliday = nonWorkingDates.some(
        (d) => d.toDateString() === current.toDateString()
      );
      if (!isHoliday) count++;
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  // useEffect(() => {
  //   if (formData.startDate && formData.endDate) {
  //     const start = new Date(formData.startDate);
  //     const end = new Date(formData.endDate);
  //     const daysDiff = differenceInCalendarDays(end, start) + 1;

  //     if (daysDiff === 1) {
  //       if (formData.leaveDayType === "half") {
  //         setFormData((prev) => ({ ...prev, duration: "0.5" }));
  //       } else if (formData.leaveDayType === "full") {
  //         setFormData((prev) => ({ ...prev, duration: "1" }));
  //       } else {
  //         setFormData((prev) => ({ ...prev, duration: "" }));
  //       }
  //     } else {
  //       const workingDays = calculateWorkingDays(start, end, nonWorkingDates);

  //       setFormData((prev) => ({
  //         ...prev,
  //         duration: workingDays.toString(),
  //         leaveDayType: "",
  //       }));
  //     }
  //   } else {
  //     setFormData((prev) => ({ ...prev, duration: "", leaveDayType: "" }));
  //   }
  // }, [
  //   formData.startDate,
  //   formData.endDate,
  //   formData.leaveDayType,
  //   nonWorkingDates,
  // ]);

  // This useEffect is for compOff leave start date and end date
  useEffect(() => {
    const { startDate, endDate, leaveDayType } = formData;
    if (!startDate || !endDate) {
      setFormData((prev) => ({ ...prev, duration: "", leaveDayType: "" }));
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const sameDay = toYMD(start) === toYMD(end);

    if (sameDay) {
      if (leaveDayType === "half") {
        setFormData((prev) => ({ ...prev, duration: 0.5 }));
      } else if (leaveDayType === "full") {
        setFormData((prev) => ({ ...prev, duration: 1 }));
      } else {
        setFormData((prev) => ({ ...prev, duration: "" }));
      }
    } else {
      // prefer hook result if it’s reliable
      const workingDays =
        Number.isFinite(duration) && !loading && !error
          ? duration
          : calculateWorkingDays(start, end, nonWorkingDates); // fallback

      setFormData((prev) => ({
        ...prev,
        duration: workingDays,
        leaveDayType: "", // not applicable across days
      }));
    }
  }, [
    formData.startDate,
    formData.endDate,
    formData.leaveDayType,
    nonWorkingDates,
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
          const approvedDates = data.filter(
            (entry) => entry.status.toLowerCase() === "approved"
          );
          // .map((entry) => entry.date);
          setApprovedCompOffDates(approvedDates);
          // console.log("Approved compoff", approvedDates);
        } catch (err) {
          console.error("Failed to fetch comp-off dates:", err);
        }
      }
    };

    fetchApprovedCompOffDates();
  }, [formData.leaveType, user]);

  const handleStatusUpdate = async (id, newStatus) => {
    setIsSending(true);
    try {
      // Step 1: PATCH status of comp-off request
      const statusResponse = await fetch(
        `${config.apiBaseURL}/comp-off-request/${id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!statusResponse.ok) {
        showErrorToast("Failed to update comp-off request status");
        return;
      }
    } catch (error) {
      console.error("Error updating comp-off status", error);
      alert("Something went wrong while updating status.");
    } finally {
      setIsSending(false);
    }
  };

  // useEffect(() => {
  //   if (
  //     formData.startDate &&
  //     formData.endDate &&
  //     format(formData.startDate, "yyyy-MM-dd") !==
  //       format(formData.endDate, "yyyy-MM-dd")
  //   ) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       duration: duration.toString(),
  //     }));
  //   }
  // }, [duration]);

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
      showWarningToast(
        "This file has already been added. Please choose a different one."
      );
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

  // Start Date (can’t go past endDate)

  const onStartDateChange = (date) => {
    if (!date) return;

    // Prevent start > end (global rule)
    if (formData.endDate && date > formData.endDate) {
      showWarningToast("Start date cannot be after End date.");
      return;
    }

    setFormData((prev) => {
      // If Comp-off selected, lock end to same day
      const lockSameDay =
        prev.leaveType === "Comp off" && prev.compoff_request_id;
      return {
        ...prev,
        startDate: date,
        endDate: lockSameDay ? date : prev.endDate || date,
        // leaveDayType for Comp-off already forced by select; for normal leave keep as is
      };
    });
  };

  const onEndDateChange = (date) => {
    if (!date) return;

    // global rule: cannot go before start
    if (formData.startDate && date < formData.startDate) {
      showWarningToast("End date cannot be before Start date.");
      return;
    }
    // global rule: cannot go after resumption (if chosen)
    if (formData.resumptionDate && date > formData.resumptionDate) {
      showWarningToast("End date cannot be after Resumption date.");
      return;
    }

    setFormData((prev) => {
      // If Comp-off selected, must be same day as start
      const lockSameDay =
        prev.leaveType === "Comp off" && prev.compoff_request_id;
      if (lockSameDay && prev.startDate && !isSameDay(prev.startDate, date)) {
        showWarningToast(
          "Comp-off allows only one day; End date must match Start date."
        );
        return prev;
      }
      return { ...prev, endDate: date };
    });
  };

  // Resumption Date (half-day same-day allows equal; others must be after)

  const onResumptionChange = (date) => {
    if (!date) return;
    if (!formData.endDate) {
      showWarningToast("Please choose End date first.");
      return;
    }

    const sameDayLeave = isSameDay(formData.startDate, formData.endDate);
    const isHalfDay = formData.leaveDayType === "half";

    if (sameDayLeave && isHalfDay) {
      if (date < formData.endDate) {
        showWarningToast(
          "Resumption cannot be before leave date for half-day."
        );
        return;
      }
    } else {
      if (date <= formData.endDate) {
        showWarningToast("Resumption must be after the End date.");
        return;
      }
    }

    setFormData((prev) => ({ ...prev, resumptionDate: date }));
  };

  // Leave Day Type (only valid on same-day)

  const onLeaveDayTypeChange = (val) => {
    const sameDay = isSameDay(formData.startDate, formData.endDate);
    if (!sameDay) {
      showWarningToast("Half/Full applies only for same-day leave.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      leaveDayType: val,
      duration: val === "half" ? 0.5 : 1,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // synchronous guard (blocks ultra-fast double clicks)
    if (submittingRef.current) return;
    submittingRef.current = true; // <— set immediately
    setIsSending(true);

    const bail = (msg) => {
      if (msg) showWarningToast(msg);
      submittingRef.current = false; // release on any validation failure
      setIsSending(false);
    };

    if (!formData.startDate) {
      return bail("Enter the Start date.");
    }

    if (!formData.endDate) {
      return bail("Enter the End date.");
    }

    if (!formData.resumptionDate) {
      return bail("Enter the Resumption date.");
    }

    if (formData.endDate < formData.startDate) {
      return bail("End date should be after start date.");
    }

    if (!formData.duration) {
      return bail("Enter the Duration.");
    }

    if (formData.resumptionDate < formData.endDate) {
      return bail("Enter the Resumption date.");
    }

    const leaveTypeMap = {
      Sick: "sick_leave",
      Casual: "casual_leave",
      "Comp off": "comp_off",
      // Earned: "earned_leave",
      LOP: "lop",
      "": "others", // Default if no match
    };

    const mappedLeaveType = leaveTypeMap[formData.leaveType] || "others";
    // console.log("leave type", mappedLeaveType);
    // console.log("leave summary", leaveSummary);

    if (parseFloat(leaveSummary[mappedLeaveType]) <= 0) {
      return bail(`No leave balance available for ${formData.leaveType}`);
    }

    if (
      parseFloat(leaveSummary[mappedLeaveType]) < parseFloat(formData.duration)
    ) {
      return bail(
        `Leave duration exceeds leave balance for ${formData.leaveType}`
      );
    }

    if (mappedLeaveType === "comp_off" && !formData.compOffDate) {
      return bail("Enter a Date for Comp off");
    }

    // ----- PASSED VALIDATION: flip guards -----
    // submittingRef.current = true;
    // if (isSending) return;
    // if (submittingRef.current) return;
    // setIsSending(true);

    const apiURL = `${config.apiBaseURL}/leaves-taken/`;
    const data = new FormData();

    const addAttachment = async (leave_taken_id) => {
      if (newAttachments.length > 0) {
        for (const file of newAttachments) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("leavestaken", leave_taken_id);

          const uploadRes = await fetch(`${config.apiBaseURL}/attachments/`, {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            console.error("Failed to upload file:", file.name);
          }
        }
        setNewAttachments([]);
      }

      // Refresh the list after all uploads
      // const attachResponse = await fetch(
      //   `${config.apiBaseURL}/attachments/project/${project_id}`
      // );
      // const attachData = await attachResponse.json();
      // setAttachments(attachData);
      // setNewAttachments([]);
    };
    data.append("leave_type", mappedLeaveType);
    data.append("start_date", format(formData.startDate, "yyyy-MM-dd"));
    data.append("end_date", format(formData.endDate, "yyyy-MM-dd"));
    data.append("duration", String(formData.duration));
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
        // console.log("Leave submitted successfully:", result);
        // console.log("Leave taken id:", result.data.leave_taken_id);
        showSuccessToast("Leave Request Submitted Successfully!");

        await patchLeaveAvailability(mappedLeaveType, formData.duration);
        await addAttachment(result.data.leave_taken_id);

        if (mappedLeaveType === "comp_off" && formData.compOffDate) {
          await handleStatusUpdate(formData.compoff_request_id, "availed");
        }

        setTimeout(() => {
          onClose();
        }, 1600);
        // Close form after successful submission
      } else {
        const errorData = await response.json();
        console.error("Submission failed", errorData);
        showErrorToast("Failed to submit leave request.");
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      showErrorToast("An error occurred while submitting.");
    } finally {
      setIsSending(false);
      submittingRef.current = false; // ALWAYS release guard
    }
  };

  const fetchLeaveAvailability = async () => {
    const patchURL = `${config.apiBaseURL}/leaves-available/by_employee/${user.employee_id}/`;

    try {
      // Step 1: Fetch current available leave
      const res = await fetch(patchURL);
      const currentData = await res.json();

      // Find summary for the logged-in employee
      const employeeSummary = currentData;
      // console.log("employee leave", employeeSummary);
      if (employeeSummary) {
        setLeaveSummary({
          sick_leave: employeeSummary.sick_leave,
          casual_leave: employeeSummary.casual_leave,
          comp_off: employeeSummary.comp_off,
          // earned_leave: employeeSummary.earned_leave,
        });
      }
    } catch (err) {
      console.error("Error patching leave availability:", err);
    }
  };

  const patchLeaveAvailability = async (leaveTypeKey, duration) => {
    const patchURL = `${config.apiBaseURL}/leaves-available/by_employee/${user.employee_id}/`;

    try {
      // Step 1: Fetch current available leave
      const res = await fetch(patchURL);
      const currentData = await res.json();

      const currentLeave = parseFloat(currentData[leaveTypeKey] || 0);
      if (duration == null || isNaN(parseFloat(duration))) {
        duration = 0;
      }
      const newLeaveBalance = currentLeave - parseFloat(duration);

      // Step 2: Patch with updated value
      const patchRes = await fetch(patchURL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [leaveTypeKey]: newLeaveBalance }),
      });

      if (!patchRes.ok) {
        const err = await patchRes.json();
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
      <form
        onSubmit={handleSubmit}
        className="form1"
        onKeyDown={(e) => {
          if (isSending && e.key === "Enter") e.preventDefault();
        }}
        noValidate
      >
        <div className="row1">
          <div className="form-group1">
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
              {/* <option value="Earned">Earned</option> */}
              <option value="LOP">LOP</option>
              <option value="">Others</option>
            </select>
          </div>

          <div
            className="form-group1"
            style={{
              visibility:
                formData.leaveType === "Comp off" ? "visible" : "hidden",
            }}
          >
            <label className="label1">Select Date (for Comp off)</label>
            <select
              name="compoff_request_id"
              value={formData.compoff_request_id || ""}
              // onChange={(e) => {
              //   // const selected = new Date(e.target.value);
              //   const selected = approvedCompOffDates.find(
              //     (item) => item.compoff_request_id === e.target.value
              //   );
              //   setFormData((prev) => ({
              //     ...prev,
              //     compOffDate: selected.date,
              //     // startDate: selected,
              //     // endDate: selected,
              //     // leaveDayType: "full",
              //     duration: selected.duration,
              //     compoff_request_id: selected.compoff_request_id,
              //   }));
              // }}
              onChange={(e) => {
                const id = String(e.target.value);
                const selected = approvedCompOffDates.find(
                  (item) => String(item.compoff_request_id) === id
                );
                if (!selected) return;

                const durNum = parseFloat(selected.duration || "1");
                const isHalf = durNum < 1;

                setFormData((prev) => {
                  // if a start date already exists, force end to same day when Comp-off
                  const nextStart = prev.startDate || null;
                  const nextEnd = nextStart || prev.endDate || null;

                  return {
                    ...prev,
                    compoff_request_id: id,
                    compOffDate: selected.date,
                    compOffCreditDuration: isHalf ? 0.5 : 1,
                    // lock the day type based on credit
                    leaveDayType: isHalf ? "half" : "full",
                    // if user already picked a start date, ensure same-day
                    endDate: nextStart ? nextStart : nextEnd,
                    // let unified effect compute duration; it will set 0.5 or 1
                  };
                });
              }}
              className="select1"
            >
              <option value="">Select Approved Date</option>
              {approvedCompOffDates.map((item) => (
                <option
                  key={item.compoff_request_id}
                  value={item.compoff_request_id}
                >
                  {format(new Date(item.date), "dd-MMM-yyyy")}
                </option>
              ))}
            </select>

            {/* <label>Employee</label>
            <select
              value={newAttendance.employee}
              onChange={(e) => {
                const selectedEmp = employeeData.find(
                  (emp) => emp.employee_id === e.target.value
                );
                setNewAttendance({
                  ...newAttendance,
                  employee: selectedEmp.employee_id,
                  employee_code: selectedEmp.employee_code,
                  employee_name: selectedEmp.employee_name,
                });
              }}
            >
              <option value="">Select Employee</option>
              {employeeData.map((emp) => (
                <option key={emp.employee_id} value={[emp.employee_id]}>
                  {emp.employee_name}
                </option>
              ))}
            </select> */}
          </div>
        </div>

        <div className="row1">
          <div className="form-group-half1">
            <label className="label1">Start Date</label>
            <div className="date-input-container">
              <DatePicker
                selected={formData.startDate}
                // onChange={(date) =>
                //   handleChange({ target: { name: "startDate", value: date } })
                // }
                onChange={onStartDateChange}
                dateFormat="dd-MMM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="date1"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={formData.endDate || null}
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
                // onChange={(date) =>
                //   handleChange({ target: { name: "endDate", value: date } })
                // }
                onChange={onEndDateChange}
                dateFormat="dd-MMM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="date1"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                minDate={formData.startDate || null}
                // If Comp-off chosen, lock to same day as start
                maxDate={
                  formData.leaveType === "Comp off" &&
                  formData.compoff_request_id
                    ? formData.startDate || null
                    : formData.resumptionDate || null
                }
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
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="leaveDayType"
                    value="half"
                    checked={formData.leaveDayType === "half"}
                    // onChange={() =>
                    //   setFormData((prev) => ({ ...prev, leaveDayType: "half" }))
                    // }
                    onChange={() => onLeaveDayTypeChange("half")}
                    disabled={
                      formData.leaveType === "Comp off" &&
                      formData.compoff_request_id
                    }
                  />
                  <span>Half-Day</span>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="leaveDayType"
                    value="full"
                    checked={formData.leaveDayType === "full"}
                    onChange={() => onLeaveDayTypeChange("full")}
                    disabled={
                      formData.leaveType === "Comp off" &&
                      formData.compoff_request_id
                    }
                    // onChange={() =>
                    //   setFormData((prev) => ({ ...prev, leaveDayType: "full" }))
                    // }
                  />
                  <span>Full-Day</span>
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
                // onChange={(date) =>
                //   handleChange({
                //     target: { name: "resumptionDate", value: date },
                //   })
                // }
                onChange={onResumptionChange}
                dateFormat="dd-MMM-yyyy"
                placeholderText="dd-mm-yyyy"
                className="date1"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                excludeDates={nonWorkingDates}
                minDate={
                  formData.endDate
                    ? formData.leaveDayType === "half" &&
                      isSameDay(formData.startDate, formData.endDate)
                      ? formData.endDate
                      : new Date(formData.endDate.getTime() + 86400000)
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
          <button
            type="submit"
            className="btn-save"
            disabled={isSending}
            style={{ pointerEvents: isSending ? "none" : "auto" }}
          >
            {isSending ? (
              <>
                <span className="spinner-otp" /> Updating...
              </>
            ) : (
              "Submit"
            )}
          </button>
          <button type="button" onClick={onClose} className="btn-cancel">
            Cancel
          </button>
        </div>
      </form>
      <ToastContainerComponent />
    </div>
  );
};

export default LeaveRequestForm;
