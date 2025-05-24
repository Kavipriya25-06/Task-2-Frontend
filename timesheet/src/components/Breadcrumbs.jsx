// src/components/Breadcrumbs.jsx

// import { useNavigate } from "react-router-dom";
// import "./Breadcrumbs.css";
// import { FaArrowLeft } from "react-icons/fa";

// const Breadcrumbs = ({
//   crumbs = [],
//   showBack = false,
//   backPath = null,
//   onBack,
// }) => {
//   const navigate = useNavigate();

//   const labelMap = {
//     // Global Routes
//     "": "",
//     login: "Login",
//     home: "Home",

//     // Roles
//     admin: "Admin",
//     hr: "HR",
//     manager: "Manager",
//     teamlead: "Team Lead",
//     employee: "Employee",

//     // Shared Wrapper
//     detail: "Detail",

//     // Admin
//     users: "Users",
//     "add-user": "Add User",
//     "edit-user": "Edit User",
//     reports: "Reports",

//     // HR
//     "employee-details": "Employee Details",
//     "add-employee": "Add Employee",
//     "edit-employee": "Edit Employee",
//     holidays: "Holiday Calendar",
//     "holiday-list": "Holiday List",
//     settings: "Settings",

//     // Manager / TeamLead Shared
//     projects: "Projects",
//     buildings: "Buildings",
//     tasks: "Tasks",
//     create: "Create",
//     employees: "Employees",
//     "team-leaders": "Team Leaders",
//     attendance: "Attendance",
//     "attendance-admin": "Attendance Admin",
//     timesheetapproval: "Approval Screen",
//     "leave-requests": "Leave Requests",
//     Leaveapplication: "Leave Application",

//     // TeamLead Specific
//     "time-sheet-entry": "Timesheet",
//     approvalscreen: "Approval Screen",
//     createdaily: "Daily Timesheet",
//     createweekly: "Weekly Timesheet",

//     // Employee
//     // tasks: "Tasks",
//   };

//   return (
//     <div className="breadcrumbs-container">
//       {showBack && (
//         <button
//           className="back-button"
//           onClick={() => {
//             if (onBack) {
//               onBack();
//             } else if (backPath) {
//               navigate(backPath);
//             } else {
//               navigate(-1); // Go back one step by default
//             }
//           }}
//         >
//           <FaArrowLeft style={{ marginRight: "6px" }} /> Back
//         </button>
//       )}
//       <div className="breadcrumbs">
//         {crumbs.map((c, i) => (
//           <span key={i}>
//             {c.link ? (
//               <span
//                 className="breadcrumb-link"
//                 onClick={() => navigate(c.link)}
//               >
//                 {c.label}
//               </span>
//             ) : (
//               <span>{c.label}</span>
//             )}
//             {i < crumbs.length - 1 && <span> / </span>}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Breadcrumbs;

// src/components/Breadcrumbs.jsx

import { useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./Breadcrumbs.css";

const labelMap = {
  "": "Home",
  login: "Login",
  home: "Home",
  admin: "Admin",
  hr: "HR",
  manager: "Manager",
  teamlead: "Team Lead",
  employee: "Employee",
  detail: "Detail",
  users: "Users",
  "add-user": "Add User",
  "edit-user": "View User",
  reports: "Reports",
  "employee-details": "Employee Details",
  "add-employee": "Add Employee",
  "edit-employee": "View Employee",
  holidays: "Holiday Calendar",
  "holiday-list": "Holiday List",
  settings: "Settings",
  projects: "Projects",
  buildings: "Buildings",
  tasks: "Tasks",
  create: "Create",
  employees: "Employees",
  "team-leaders": "Team Leaders",
  attendance: "Attendance",
  "attendance-admin": "Attendance Admin",
  timesheetapproval: "Approval Screen",
  "leave-requests": "Leave Requests",
  Leaveapplication: "Leave Application",
  "time-sheet-entry": "Timesheet",
  approvalscreen: "Approval Screen",
  createdaily: "Daily Timesheet",
  createweekly: "Weekly Timesheet",
  compoff: "Comp Off",
};

const Breadcrumbs = ({ showBack = false, backPath = null, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter((seg) => seg);

  const crumbs = pathSegments.map((segment, index) => {
    const path = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = labelMap[segment] || segment;
    return {
      label,
      link: index < pathSegments.length - 1 ? path : null,
    };
  });

  return (
    <div className="breadcrumbs-container">
      {showBack && (
        <button
          className="back-button"
          onClick={() => {
            if (onBack) onBack();
            else if (backPath) navigate(backPath);
            else navigate(-1);
          }}
        >
          <FaArrowLeft style={{ marginRight: "6px" }} /> Back
        </button>
      )}
      <div className="breadcrumbs">
        {crumbs.map((c, i) => (
          <span key={i}>
            {c.link ? (
              <span
                className="breadcrumb-link"
                onClick={() => navigate(c.link)}
              >
                {c.label}
              </span>
            ) : (
              <span>{c.label}</span>
            )}
            {i < crumbs.length - 1 && <span> / </span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumbs;
