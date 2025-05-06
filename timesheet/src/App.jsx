// timesheet\src\App.jsx

import { FaEdit } from "react-icons/fa";
import React from "react";
import { useState, useEffect } from "react";
import "normalize.css";
import "./App.css";
import "./index.css";
import { useAuth } from "./AuthContext";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink,
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HomeRedirect from "./pages/HomeRedirect.jsx";
import RoleSwitcher from "./pages/RoleSwitcher.jsx";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import UsersPage from "./pages/Admin/AdminUsersPage.jsx";
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import AdminDetailView from "./pages/Admin/AdminDetailView.jsx";
import AddUserForm from "./pages/Admin/AdminAddUserForm.jsx";
import EditUserForm from "./pages/Admin/AdminEditUserForm.jsx";
import Reports from "./pages/Admin/AdminReports.jsx";
import HolidayCalendar from "./pages/Admin/AdminHolidayCalendar.jsx";
import HolidayList from "./pages/Admin/AdminHolidayList.jsx";

// HR pages
import HRDashboard from "./pages/HR/HRDashboard.jsx";
import HRLayout from "./pages/HR/HRLayout.jsx";
import HRDetailView from "./pages/HR/HRDetailView.jsx";
import AddEmployee from "./pages/HR/HRAddEmployee.jsx";
import EditEmployee from "./pages/HR/HREditEmployee.jsx";
import EmployeeList from "./pages/HR/HREmployeeList.jsx";
import HRHolidayCalendar from "./pages/HR/HRHolidayCalendar.jsx";
import HRHolidayList from "./pages/HR/HRHolidayList.jsx";

// Manager pages
import ManagerDashboard from "./pages/Manager/ManagerDashboard.jsx";
import ManagerLayout from "./pages/Manager/ManagerLayout.jsx";
import ManagerDetailView from "./pages/Manager/ManagerDetailView.jsx";
import ManagerAttendance from "./pages/Manager/ManagerAttendance.jsx";
import ManagerAttendanceAdmin from "./pages/Manager/ManagerAttendanceAdmin.jsx";
import ManagerEmployees from "./pages/Manager/ManagerEmployees.jsx";
import ManagerLeaveRequests from "./pages/Manager/ManagerLeaveRequests.jsx";
import ManagerProjects from "./pages/Manager/ManagerProjects.jsx";
import ManagerProjectView from "./pages/Manager/ManagerProjectView.jsx";
import ManagerBuildingView from "./pages/Manager/ManagerBuildingView.jsx";
import ManagerTaskView from "./pages/Manager/ManagerTaskView.jsx";
import ManagerTeamLeaders from "./pages/Manager/ManagerTeamLeaders.jsx";
import ManagerTeamLeadersView from "./pages/Manager/ManagerTeamLeadersView.jsx";
import ManagerProjectCreate from "./pages/Manager/ManagerProjectCreate.jsx";
import ManagerBuildingCreate from "./pages/Manager/ManagerBuildingCreate.jsx";
import ManagerTaskCreate from "./pages/Manager/ManagerTaskCreate.jsx";
import ManagerApprovalScreen from "./pages/Manager/ManagerApprovalScreen.jsx";
import ManagerLeaveApplication from "./pages/Manager/ManagerLeaveApplication.jsx";
import ManagerLeaveRequestForm from "./pages/Manager/ManagerLeaveRequestForm.jsx";

// Team Lead pages
import TeamLeadDashboard from "./pages/TeamLead/TeamLeadDashboard.jsx";
import TeamLeadLayout from "./pages/TeamLead/TeamLeadLayout.jsx";
import TeamLeadDetailView from "./pages/TeamLead/TeamLeadDetailView.jsx";
import TeamLeadAttendance from "./pages/TeamLead/TeamLeadAttendance.jsx";
import TeamLeadAttendanceAdmin from "./pages/TeamLead/TeamLeadAttendanceAdmin.jsx";
import TeamLeadEmployees from "./pages/TeamLead/TeamLeadEmployees.jsx";
import TeamLeadLeaveRequests from "./pages/TeamLead/TeamLeadLeaveRequests.jsx";
import TeamLeadProjects from "./pages/TeamLead/TeamLeadProjects.jsx";
import TeamLeadProjectView from "./pages/TeamLead/TeamLeadProjectView.jsx";
import TeamLeadTimeSheetEntry from "./pages/TeamLead/TeamLeadTimeSheetEntry.jsx";
import TeamLeadProjectCreate from "./pages/TeamLead/TeamLeadProjectCreate.jsx";
import TeamLeadBuildingCreate from "./pages/TeamLead/TeamLeadBuildingCreate.jsx";
import TeamLeadTaskCreate from "./pages/TeamLead/TeamLeadTaskCreate.jsx";
import TeamLeadLeaveRequestForm from "./pages/TeamLead/TeamLeadLeaveRequestForm.jsx";
import TeamLeadDailyTimeSheetEntry from "./pages/TeamLead/TeamLeadDailyTimeSheetEntry.jsx";
import TeamLeadWeeklyTimeSheetEntry from "./pages/TeamLead/TeamLeadWeeklyTimeSheet.jsx";
import TeamLeadApprovalScreen from "./pages/TeamLead/TeamLeadApprovalScreen.jsx";

// Employee pages
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard.jsx";
import EmployeeLayout from "./pages/Employee/EmployeeLayout.jsx";
import EmployeeDetailView from "./pages/Employee/EmployeeDetailView.jsx";
import EmployeeLeaveRequests from "./pages/Employee/EmployeeLeaveRequests.jsx";
import EmployeeTasks from "./pages/Employee/EmployeeTasks.jsx";
import EmployeeTimeSheetEntry from "./pages/Employee/EmployeeTimeSheetEntry.jsx";
import EmployeeTaskDetail from "./pages/Employee/EmployeeTaskDetail.jsx";
import EmployeeDailyTimeSheetEntry from "./pages/Employee/EmployeeDailyTimeSheetEntry.jsx";
import EmployeeWeeklyTimeSheetEntry from "./pages/Employee/EmployeeWeeklyTimeSheetEntry.jsx";
import EmployeeLeaveRequestForm from "./pages/Employee/EmployeeLeaveRequestForm.jsx";

const App = () => {
  const [selectedRole, setSelectedRole] = useState(() => {
    return localStorage.getItem("selectedRole") || "admin";
  });

  const { user } = useAuth();

  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    // navigate("/"); // Redirect to login page
  };
  const renderDashboard = () => {
    switch (selectedRole) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "hr":
        return <Navigate to="/hr" replace />;
      case "manager":
        return <ManagerDashboard />;
      case "teamlead":
        return <TeamLeadDashboard />;
      case "employee":
        return <EmployeeDashboard />;
      default:
        return <Dashboard />;
    }
  };
  console.log("Selected role", selectedRole);

  return (
    <Router>
      <div className="app-layout">
        {/* Top Bar */}
        <header className="top-bar">
          {/* <NavLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <img src="\src\assets\Logo.svg" alt="Arris Logo" className="logo" />
          </NavLink> */}
          <img src="\src\assets\Logo.svg" alt="Arris Logo" className="logo" />

          <div style={{ alignItems: "center", display: "flex" }}>
            <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <img
                src="\src\assets\logout.png"
                alt="Logout button"
                className="logoutbutton"
                onClick={handleLogout}
              />
            </NavLink>
            {user && (
              <RoleSwitcher
                selectedRole={selectedRole}
                setSelectedRole={setSelectedRole}
              />
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/home/*"
              element={
                user ? (
                  <HomeRedirect selectedRole={selectedRole} />
                ) : (
                  <div>Please login</div>
                )
              }
            />

            {/* Admin Layout with Dashboard and DetailView */}
            <Route path="/admin/*" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="detail" element={<AdminDetailView />}>
                <Route path="users" element={<UsersPage />}></Route>
                <Route path="users/add-user" element={<AddUserForm />} />
                <Route
                  path="users/edit-user/:user_id"
                  element={<EditUserForm />}
                />
                {/* <Route path="reports" element={<Reports />} /> */}
              </Route>
            </Route>

            {/* HR Layout with Dashboard and DetailView */}
            <Route path="/hr/*" element={<HRLayout />}>
              <Route index element={<HRDashboard />} />
              <Route path="detail" element={<HRDetailView />}>
                <Route path="employee-details" element={<EmployeeList />} />
                <Route
                  path="employee-details/add-employee"
                  element={<AddEmployee />}
                />
                <Route
                  path="employee-details/edit-employee/:employee_id"
                  element={<EditEmployee />}
                />
                <Route path="holidays" element={<HRHolidayCalendar />} />
                <Route
                  path="holidays/holiday-list"
                  element={<HRHolidayList />}
                />
              </Route>
            </Route>

            {/* Manager layout with Dashboard and DetailView*/}
            <Route path="/manager/*" element={<ManagerLayout />}>
              <Route index element={<ManagerDashboard />} />
              <Route path="detail" element={<ManagerDetailView />}>
                <Route path="projects" element={<ManagerProjects />} />
                <Route
                  path="projects/:project_id"
                  element={<ManagerProjectView />}
                />
                <Route
                  path="projects/create"
                  element={<ManagerProjectCreate />}
                />
                <Route
                  path="buildings/create"
                  element={<ManagerBuildingCreate />}
                />
                <Route
                  path="buildings/:building_assign_id"
                  element={<ManagerBuildingView />}
                />
                <Route path="tasks/create" element={<ManagerTaskCreate />} />
                <Route
                  path="tasks/:task_assign_id"
                  element={<ManagerTaskView />}
                />
                <Route path="team-leaders" element={<ManagerTeamLeaders />} />
                <Route path="employees" element={<ManagerEmployees />} />
                <Route
                  path="leave-requests"
                  element={<ManagerLeaveRequests />}
                />
                 <Route
                  path="leave-requests/create"
                  element={<ManagerLeaveRequestForm />}
                />
                <Route path="attendance" element={<ManagerAttendance />} />
                <Route
                  path="attendance/attendance-admin"
                  element={<ManagerAttendanceAdmin />}
                />
                <Route
                  path="attendance/timesheetapproval/:employee_id/:date"
                  element={<ManagerApprovalScreen />}
                />
                <Route
                  path="team-leaders/tl"
                  element={<ManagerTeamLeadersView />}
                />
                <Route path ="leave-requests/Leaveapplication" element ={<ManagerLeaveApplication/>} />

              </Route>
            </Route>

            {/* Team leader layout with Dashboard and DetailView*/}
            <Route path="/teamlead/*" element={<TeamLeadLayout />}>
              <Route index element={<TeamLeadDashboard />} />
              <Route path="detail" element={<TeamLeadDetailView />}>
                <Route path="projects" element={<TeamLeadProjects />} />
                <Route
                  path="projects/:project_id"
                  element={<TeamLeadProjectView />}
                />
                <Route
                  path="projects/create"
                  element={<TeamLeadProjectCreate />}
                />
                <Route
                  path="buildings/create"
                  element={<TeamLeadBuildingCreate />}
                />
                <Route path="tasks/create" element={<TeamLeadTaskCreate />} />
                <Route
                  path="time-sheet-entry"
                  element={<TeamLeadTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createdaily"
                  element={<TeamLeadDailyTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createweekly"
                  element={<TeamLeadWeeklyTimeSheetEntry />}
                />
                <Route path="employees" element={<TeamLeadEmployees />} />
                <Route
                  path="leave-requests"
                  element={<TeamLeadLeaveRequests />}
                />
                <Route
                  path="leave-requests/create"
                  element={<TeamLeadLeaveRequestForm />}
                />

                <Route path="attendance" element={<TeamLeadAttendance />} />
                <Route
                  path="attendance/attendance-admin"
                  element={<TeamLeadAttendanceAdmin />}
                />
                <Route
                  path="attendance/timesheetapproval/:employee_id/:date"
                  element={<TeamLeadApprovalScreen />}
                />
              </Route>
            </Route>

            {/* Employee layout with Dashboard and DetailView*/}
            <Route path="/employee/*" element={<EmployeeLayout />}>
              <Route index element={<EmployeeDashboard />} />
              <Route path="detail" element={<EmployeeDetailView />}>
                <Route
                  path="time-sheet-entry"
                  element={<EmployeeTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createdaily"
                  element={<EmployeeDailyTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createweekly"
                  element={<EmployeeWeeklyTimeSheetEntry />}
                />

                <Route path="tasks" element={<EmployeeTasks />} />
                <Route
                  path="leave-requests"
                  element={<EmployeeLeaveRequests />}
                />
                <Route
                  path="leave-requests/create"
                  element={<EmployeeLeaveRequestForm />}
                />
                <Route path="tasks/detail" element={<EmployeeTaskDetail />} />
              </Route>
            </Route>
          </Routes>
        </main>

        {/* Bottom Bar */}
        <footer className="bottom-bar">
          <div>Contact us: info@arrisltd.com | (+91) 044-4798-1534</div>
        </footer>
      </div>
    </Router>
  );
};
export default App;
