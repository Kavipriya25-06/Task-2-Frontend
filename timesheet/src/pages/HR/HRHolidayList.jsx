import React, { useEffect, useState } from "react";
import config from "../../config";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useParams } from "react-router-dom";

const HolidayList = () => {
  // const HRHolidayList = () => {
  const { year } = useParams();
  const [calendarData, setCalendarData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(year);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ date: "", notes: "" });

  const fetchCalendarData = async (year) => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/calendar/?year=${year}`
      );
      const data = await response.json();
      setCalendarData(data);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    }
  };
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${config.apiBaseURL}/calendar/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_holiday: false,
          notes: "",
        }),
      });

      if (response.ok) {
        fetchCalendarData(selectedYear); // Refresh from backend
      } else {
        console.error("Failed to update holiday");
      }
    } catch (error) {
      console.error("Error deleting holiday:", error);
    }
  };

  useEffect(() => {
    fetchCalendarData(selectedYear);
  }, [selectedYear]);

  const holidayData = calendarData.filter((day) => day.is_holiday);
  console.log("the matching date", formData.date);

  const handlePatchHoliday = async () => {
    try {
      const matchingDate = calendarData.find(
        (day) => day.date === formData.date
      );
      if (!matchingDate) return alert("Date not found in calendar data");

      console.log("the matching date", formData.date);

      const response = await fetch(
        `${config.apiBaseURL}/calendar/${matchingDate.calendar_id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_holiday: true,
            notes: formData.notes,
          }),
        }
      );

      if (response.ok) {
        fetchCalendarData(selectedYear);
        setShowPopup(false);
        setFormData({ date: "", notes: "" });
      } else {
        console.error("Failed to update holiday");
      }
    } catch (err) {
      console.error("Patch error:", err);
    }
  };

  return (
    <div className="holiday-table-wrapper">
      {/* <h2 className="holiday-table-title">
        Holidays - {new Date().getFullYear()}
      </h2> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="holiday-table-title">Holidays - {selectedYear}</h2>
        <div className="year-selector">
          <button
            className="lefts"
            onClick={() => setSelectedYear((y) => y - 1)}
          >
            &lt;
          </button>
          <span className="year-text">{selectedYear}</span>
          <button
            className="rights"
            onClick={() => setSelectedYear((y) => y + 1)}
          >
            &gt;
          </button>
        </div>
      </div>
      <table className="holiday-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Month</th>
            <th>Day</th>
            <th>Type of Holiday</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {holidayData.map((entry) => (
            <tr key={entry.calendar_id}>
              <td>{entry.date}</td>
              <td>{entry.month_name}</td>
              <td>{entry.day_name}</td>
              <td>{entry.notes || "Weekend"}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(entry.calendar_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => setShowPopup(true)}
        style={{
          textAlign: "left",
          fontSize: "20px",
          fontWeight: "bolder",
        }}
      >
        +
      </button>
      {/* {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Add Holiday</h3>
            <label>Date:</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            <label>Type of Holiday:</label>
            <input
              type="text"
              placeholder="Eg: Diwali, New Year"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
            <div className="popup-actions">
              <button className="btn-green" onClick={handlePatchHoliday}>
                Save
              </button>
              <button
                className="btn-orange"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )} */}

      {showPopup && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              &times;
            </button>
            <h3>Add Holiday</h3>
            <label>
              Date:
              <br />
              <div className="date-input-container">
                <DatePicker
                  selected={formData.date ? new Date(formData.date) : null}
                  onChange={
                    (date) =>
                      setFormData({
                        ...formData,
                        date: format(date, "yyyy-MM-dd"),
                      }) // ← just set the Date object directly
                  }
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  className="input1" // Or any input styling class
                />
                <i className="fas fa-calendar-alt calendar-icon"></i>{" "}
                {/* Font Awesome Calendar Icon */}
              </div>
              {/* <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            /> */}
            </label>
            <label>
              Holidays:
              <input
                type="text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </label>
            <div className="modal-buttons">
              <button onClick={handlePatchHoliday}>Submit</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* <Modal
  isOpen={showPopup}
  onRequestClose={() => setShowPopup(false)}
  contentLabel="Add Holiday"
  ariaHideApp={false}
  style={{
    content: {
      top: "20%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translateX(-50%)",
      width: "420px",
      padding: "30px",
      borderRadius: "12px",
      position: "absolute",
    },
  }}
>
  <button className="close-btn" onClick={() => setShowPopup(false)}>
    &times;
  </button>

  <h3>Add Holiday</h3>

  <label>
    Date:
    <input
      type="date"
      value={formData.date}
      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
    />
  </label>

  <label>
    Holidays:
    <input
      type="text"
      value={formData.notes}
      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
    />
  </label>

  <div className="modal-buttons">
    <button className="btn-save" onClick={handlePatchHoliday} style={{ marginRight: "8px" }}>
      Submit
    </button>
    <button className="btn-cancel" onClick={() => setShowPopup(false)}>Cancel</button>
  </div>
</Modal> */}
    </div>
  );
};

export default HolidayList;

// export default HRHolidayList;
