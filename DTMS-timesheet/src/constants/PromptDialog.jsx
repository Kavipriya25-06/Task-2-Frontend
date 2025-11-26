import React, { useState } from "react";
import { confirmable, createConfirmation } from "react-confirm";

const PromptDialog = ({
  show,
  proceed,
  message,
  initialValue = "",
  minLength = 5,
}) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState("");

  if (!show) return null;

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      setError(`Reason must be at least ${minLength} characters.`);
      return;
    }
    // return the text to caller
    proceed(trimmed);
  };

  const handleCancel = () => {
    // caller will receive null
    proceed(null);
  };

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <p>{message}</p>
        <textarea
          style={textareaStyle}
          rows={4}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          placeholder="Enter reason here..."
        />
        {error && <p style={errorStyle}>{error}</p>}
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <button onClick={handleSubmit} style={yesButtonStyle}>
            Submit
          </button>
          <button
            onClick={handleCancel}
            style={{ ...noButtonStyle, marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// You can even reuse the same styles as ConfirmDialog
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const dialogStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "8px",
  minWidth: "350px",
};

const textareaStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  resize: "vertical",
};

const errorStyle = {
  marginTop: "8px",
  color: "red",
  fontSize: "0.85rem",
};

const yesButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#f1890d",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const noButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#808080",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default createConfirmation(confirmable(PromptDialog));
