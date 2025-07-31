// src\constants\ConfirmDialog.jsx

import React from "react";
import { confirmable, createConfirmation } from "react-confirm";

const ConfirmDialog = ({ show, proceed, message }) => {
  if (!show) return null;

  return (
    <div style={overlayStyle}>
      <div style={dialogStyle}>
        <p>{message}</p>
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <button onClick={() => proceed(true)} style={yesButtonStyle}>
            Yes
          </button>
          <button
            onClick={() => proceed(false)}
            style={{ ...noButtonStyle, marginLeft: "10px" }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

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
  minWidth: "300px",
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

export default createConfirmation(confirmable(ConfirmDialog));
