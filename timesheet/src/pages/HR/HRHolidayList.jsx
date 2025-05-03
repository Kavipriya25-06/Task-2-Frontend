import React, { useEffect, useState } from "react";
import config from "../../config";
import Modal from "react-modal";

const HRHolidayList = () => {
  const [calendarData, setCalendarData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  useEffect(() => {
    fetchCalendarData(selectedYear);
  }, [selectedYear]);

  const holidayData = calendarData.filter((day) => day.is_holiday);

  const handlePatchHoliday = async () => {
    try {
      const matchingDate = calendarData.find(
        (day) => day.date === formData.date
      );
      if (!matchingDate) return alert("Date not found in calendar data");

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
        <div>
          <button onClick={() => setSelectedYear((y) => y - 1)}>&lt;</button>
          <span style={{ margin: "0 10px" }}>{selectedYear}</span>
          <button onClick={() => setSelectedYear((y) => y + 1)}>&gt;</button>
        </div>
      </div>
      <table className="holiday-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Month</th>
            <th>Day</th>
            <th>Type of Holiday</th>
          </tr>
        </thead>
        <tbody>
          {holidayData.map((entry) => (
            <tr key={entry.calendar_id}>
              <td>{entry.date}</td>
              <td>{entry.month_name}</td>
              <td>{entry.day_name}</td>
              <td>{entry.notes || "Weekend"}</td>
            </tr>
          ))}
          <tr>
            <td
              colSpan={4}
              style={{
                textAlign: "left",
              }}
            >
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
            </td>
          </tr>
        </tbody>
      </table>
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
      <Modal
        isOpen={showPopup}
        onRequestClose={() => setShowPopup(false)}
        contentLabel="Add Holiday"
        ariaHideApp={false}
        style={{
          content: {
            width: "300px",
            height: "300px",
            margin: "auto",
            padding: "20px",
            borderRadius: "12px",
          },
        }}
      >
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
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </label>
        <div style={{ marginTop: "12px" }}>
          <button onClick={handlePatchHoliday} style={{ marginRight: "8px" }}>
            Submit
          </button>
          <button onClick={() => setShowPopup(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
};

export default HRHolidayList;
