// src\constants\EditableTimeField.jsx

import React, { useState } from "react";
import "./EditableTimeField.css";

const pad = (val) => String(val).padStart(2, "0");

const EditableTimeField = ({ value, onChange }) => {
  const [isPickerOpen, setPickerOpen] = useState(false);
  const [tempHours, setTempHours] = useState(0);
  const [tempMinutes, setTempMinutes] = useState(0);

  const openPicker = () => {
    if (value.includes(":")) {
      const [h, m] = value.split(":").map(Number);
      setTempHours(h);
      setTempMinutes(m);
    }
    setPickerOpen(true);
  };

  const clampValue = (val, max) => {
    if (val > max) return 0;
    if (val < 0) return max;
    return val;
  };

  const updateValue = (setter, value, max, dir) => {
    const newVal =
      dir === "up"
        ? value + 1 > max
          ? 0
          : value + 1
        : value - 1 < 0
        ? max
        : value - 1;
    setter(newVal);
  };

  const handleWheel = (e, type) => {
    // e.preventDefault();
    const dir = e.deltaY < 0 ? "up" : "down";
    if (type === "hour") updateValue(setTempHours, tempHours, 23, dir);
    else updateValue(setTempMinutes, tempMinutes, 59, dir);
  };

  const handleKeyDown = (e, type) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const dir = e.key === "ArrowUp" ? "up" : "down";
      if (type === "hour") updateValue(setTempHours, tempHours, 23, dir);
      else updateValue(setTempMinutes, tempMinutes, 59, dir);
    }
  };

  const confirm = () => {
    const formatted = `${pad(tempHours)}:${pad(tempMinutes)}`;
    onChange(formatted);
    setPickerOpen(false);
  };

  return (
    <div className="editable-time-field">
      <span onClick={openPicker} className="time-display">
        {value || "00:00"}
      </span>

      {isPickerOpen && (
        <div className="modal-overlay" onClick={() => setPickerOpen(false)}>
          <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="picker-title">Time Duration</div>
            <div className="picker-content">
              <div
                className="column"
                onWheelCapture={(e) => handleWheel(e, "hour")}
                onKeyDown={(e) => handleKeyDown(e, "hour")}
              >
                <button
                  onClick={() => updateValue(setTempHours, tempHours, 23, "up")}
                >
                  ▲
                </button>
                <div className="ghost">
                  {pad(clampValue(tempHours + 1, 23))}
                </div>
                <input
                  value={pad(tempHours)}
                  readOnly
                  onWheelCapture={(e) => handleWheel(e, "hour")}
                  onKeyDown={(e) => handleKeyDown(e, "hour")}
                />
                <div className="ghost">
                  {pad(clampValue(tempHours - 1, 23))}
                </div>
                <button
                  onClick={() =>
                    updateValue(setTempHours, tempHours, 23, "down")
                  }
                >
                  ▼
                </button>
              </div>
              <div className="colon">:</div>
              <div
                className="column"
                onWheelCapture={(e) => handleWheel(e, "minute")}
                onKeyDown={(e) => handleKeyDown(e, "minute")}
              >
                <button
                  onClick={() =>
                    updateValue(setTempMinutes, tempMinutes, 59, "up")
                  }
                >
                  ▲
                </button>
                <div className="ghost">
                  {pad(clampValue(tempMinutes + 1, 59))}
                </div>
                <input
                  value={pad(tempMinutes)}
                  readOnly
                  onWheelCapture={(e) => handleWheel(e, "minute")}
                  onKeyDown={(e) => handleKeyDown(e, "minute")}
                />
                <div className="ghost">
                  {pad(clampValue(tempMinutes - 1, 59))}
                </div>
                <button
                  onClick={() =>
                    updateValue(setTempMinutes, tempMinutes, 59, "down")
                  }
                >
                  ▼
                </button>
              </div>
            </div>
            <div className="picker-actions">
              <button onClick={confirm}>OK</button>
              <button onClick={() => setPickerOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableTimeField;
