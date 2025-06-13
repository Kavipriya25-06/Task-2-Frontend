// timesheet\src\main.jsx

///////////////
// /// Timesheet Management System developed by Suriya Prakash Ammaiappan
// /// LinkedIn https://www.linkedin.com/in/suriyaprakashammaiappan/
// /// 2025
///////////////

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import "./Updated_App.css";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
