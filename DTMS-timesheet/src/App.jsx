// timesheet\src\App.jsx

import { FaEdit } from "react-icons/fa";
import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import "normalize.css";
import "./App.css";
import "./index.css";
import "./Updated_App.css";
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

import LogoutPopup from "./pages/Logout_popup.jsx"; // adjust the import path as needed

import Login from "./pages/Login.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import HeroSlider from "./components/HeroSlider.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import HomeRedirect from "./pages/HomeRedirect.jsx";
import {
  ManagerProjectRedirect,
  ManagerBuildingTaskRedirect,
  TeamLeadProjectRedirect,
  TeamLeadBuildingTaskRedirect,
} from "./pages/Redirects.jsx";
import RoleSwitcher from "./pages/RoleSwitcher.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { isDev } from "./constants/devmode.js";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard.jsx";
import UsersPage from "./pages/Admin/AdminUsersPage.jsx";
import AdminLayout from "./pages/Admin/AdminLayout.jsx";
import AdminDetailView from "./pages/Admin/AdminDetailView.jsx";
import AddUserForm from "./pages/Admin/AdminAddUserForm.jsx";
import EditUserForm from "./pages/Admin/AdminEditUserForm.jsx";
import Reports from "./pages/Admin/AdminReports.jsx";
// import HolidayCalendar from "./pages/Admin/AdminHolidayCalendar.jsx";
// import HolidayList from "./pages/Admin/AdminHolidayList.jsx";

// HR pages
import HRDashboard from "./pages/HR/HRDashboard.jsx";
import HRLayout from "./pages/HR/HRLayout.jsx";
import HRDetailView from "./pages/HR/HRDetailView.jsx";
import AddEmployee from "./pages/HR/HRAddEmployee.jsx";
import EditEmployee from "./pages/HR/HREditEmployee.jsx";
import EmployeeList from "./pages/HR/HREmployeeList.jsx";
// import HolidayCalendar from "./pages/HR/HRHolidayCalendar.jsx";
// import HolidayList from "./pages/HR/HRHolidayList.jsx";

import HRHolidayCalendar from "./pages/HR/HRHolidayCalendar.jsx";
import HRHolidayList from "./pages/HR/HRHolidayList.jsx";
import HRSettings from "./pages/HR/HRSettings.jsx";
import HRAttendance from "./pages/HR/HRAttendance.jsx";
import HRLeaveRequests from "./pages/HR/HRLeaveRequests.jsx";
import HRReports from "./pages/HR/HRReports.jsx";

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
import ManagerReports from "./pages/Manager/ManagerReports.jsx";
import ManagerTimeSheetEntry from "./pages/Manager/ManagerTimeSheetEntry.jsx";
import ManagerDailyTimeSheetEntry from "./pages/Manager/ManagerDailyTimeSheetEntry.jsx";
import ManagerWeeklyTimeSheetEntry from "./pages/Manager/ManagerWeeklyTimeSheet.jsx";
import ManagerBulkApprovalScreen from "./pages/Manager/ManagerBulkApprovalScreen.jsx";

import ManagerApprovalScreen from "./pages/Manager/ManagerApprovalScreen.jsx";
import ManagerLeaveApplication from "./pages/Manager/ManagerLeaveApplication.jsx";
import ManagerLeaveRequestForm from "./pages/Manager/ManagerLeaveRequestForm.jsx";

import ManagerCompoff from "./pages/Manager/ManagerCompoff.jsx";

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
import TeamLeadTaskView from "./pages/TeamLead/TeamLeadTaskView.jsx";
import TeamLeadBuildingView from "./pages/TeamLead/TeamLeadBuildingView.jsx";
import TeamLeadTimeSheetEntry from "./pages/TeamLead/TeamLeadTimeSheetEntry.jsx";
import TeamLeadProjectCreate from "./pages/TeamLead/TeamLeadProjectCreate.jsx";
import TeamLeadBuildingCreate from "./pages/TeamLead/TeamLeadBuildingCreate.jsx";
import TeamLeadTaskCreate from "./pages/TeamLead/TeamLeadTaskCreate.jsx";
import TeamLeadLeaveRequestForm from "./pages/TeamLead/TeamLeadLeaveRequestForm.jsx";
import TeamLeadDailyTimeSheetEntry from "./pages/TeamLead/TeamLeadDailyTimeSheetEntry.jsx";
import TeamLeadWeeklyTimeSheetEntry from "./pages/TeamLead/TeamLeadWeeklyTimeSheet.jsx";
import TeamLeadApprovalScreen from "./pages/TeamLead/TeamLeadApprovalScreen.jsx";
import TeamLeadCompoffRequest from "./pages/TeamLead/TeamLeadCompoffRequest.jsx";

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

import EmployeeCompoffRequest from "./pages/Employee/EmployeeCompoffRequest.jsx";

const App = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(() => {
    const devRole = localStorage.getItem("selectedRole") || "admin";
    return isDev ? devRole : user?.role || "employee";
  });

  //const navigate = useNavigate();

  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  console.log(user);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    if (!showLogoutPopup) {
      setShowLogoutPopup(true);
    }
  };

  const closePopup = () => {
    setShowLogoutPopup(false);
  };

  // const { logout } = useAuth();

  // const handleLogout = () => {
  //   logout();
  //   navigate("/"); // Redirect to login page
  // };

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

  useEffect(() => {
    if (!isDev && user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  return (
    <Router>
      <div className="app-layout">
        {/* Top Bar */}
        <header className="top-bar">
          {/* <NavLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <img src="\src\assets\Logo.svg" alt="Arris Logo" className="logo" />
          </NavLink> */}
          <img src="\aero-360_logo.png" alt="Arris Logo" className="logo" />

          <div style={{ alignItems: "center", display: "flex" }}>
            {/* <NavLink
              to="/"
              style={{ textDecoration: "none", color: "inherit" }}
            > */}
            <div className="selectrole" onClick={handleLogoutClick}>
              {!showLogoutPopup && user && (
                <>
                  <img
                    src="\user_icon.svg"
                    alt="User icon"
                    className="logoutbutton"
                  />
                  <span>{selectedRole}</span>
                </>
              )}
            </div>
            <ToastContainer
              toastClassName="custom-toast"
              position="top-center"
              bodyClassName="custom-toast-body"
              progressClassName="custom-toast-progress"
              autoClose={3000}
            />
            {/* Popup */}
            {showLogoutPopup && <LogoutPopup onClose={closePopup} />}
            {/* </NavLink> */}
            {isDev && user && (
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
            <Route path="/" element={<HeroSlider />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/403" element={<Dashboard />} />
            <Route path="/404" element={<NotFound />} />
            <Route
              path="/home/*"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "admin",
                    "hr",
                    "manager",
                    "teamlead",
                    "employee",
                  ]}
                >
                  <HomeRedirect selectedRole={selectedRole} />
                </ProtectedRoute>
              }
            />

            {/* Admin Layout with Dashboard and DetailView */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route
                path="detail/"
                element={<Navigate to="/admin" replace />}
              />
              <Route path="detail" element={<AdminDetailView />}>
                <Route path="users" element={<UsersPage />}></Route>
                <Route path="users/add-user" element={<AddUserForm />} />
                <Route
                  path="users/edit-user/"
                  element={<Navigate to="/admin/detail/users" replace />}
                />
                <Route
                  path="users/edit-user/:user_id"
                  element={<EditUserForm />}
                />

                <Route path="reports" element={<Reports />} />
                {/* <Route path="holidays" element={<HolidayCalendar />} />
                <Route path="holidays/holiday-list" element={<HolidayList />} /> */}
                {/* <Route path="reports" element={<Reports />} /> */}
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>

            {/* HR Layout with Dashboard and DetailView */}
            <Route
              path="/hr/*"
              element={
                <ProtectedRoute allowedRoles={["hr"]}>
                  <HRLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<HRDashboard />} />
              <Route path="detail/" element={<Navigate to="/hr" replace />} />
              <Route path="detail" element={<HRDetailView />}>
                <Route path="employee-details" element={<EmployeeList />} />
                <Route path="holidays" element={<HRHolidayCalendar />} />
                <Route
                  path="holidays/holiday-list/"
                  element={<Navigate to="/hr/detail/holidays" replace />}
                />
                <Route
                  path="holidays/holiday-list/:year/"
                  element={<HRHolidayList />}
                />
                <Route
                  path="employee-details/add-employee"
                  element={<AddEmployee />}
                />
                <Route
                  path="employee-details/edit-employee/"
                  element={
                    <Navigate to="/hr/detail/employee-details" replace />
                  }
                />
                <Route
                  path="employee-details/edit-employee/:employee_id"
                  element={<EditEmployee />}
                />
                <Route path="leave-requests" element={<HRLeaveRequests />} />
                <Route path="attendance" element={<HRAttendance />} />
                <Route path="settings" element={<HRSettings />} />
                <Route path="reports" element={<HRReports />} />

                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>

            {/* Manager layout with Dashboard and DetailView*/}
            <Route
              path="/manager/*"
              element={
                <ProtectedRoute allowedRoles={["manager"]}>
                  <ManagerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManagerDashboard />} />
              <Route
                path="detail/"
                element={<Navigate to="/manager" replace />}
              />
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
                  path="buildings/"
                  element={<Navigate to="/manager/detail/projects" replace />}
                />
                <Route
                  path="buildings/create"
                  element={<ManagerBuildingCreate />}
                />
                <Route
                  path="projects/:project_id/buildings/"
                  element={<ManagerProjectRedirect />}
                />
                <Route
                  path="projects/:project_id/buildings/:building_assign_id"
                  element={<ManagerBuildingView />}
                />
                <Route
                  path="tasks/"
                  element={<Navigate to="/manager/detail/projects" replace />}
                />
                <Route path="tasks/create" element={<ManagerTaskCreate />} />
                <Route
                  path="projects/:project_id/buildings/:building_assign_id/tasks/"
                  element={<ManagerBuildingTaskRedirect />}
                />
                <Route
                  path="projects/:project_id/buildings/:building_assign_id/tasks/:task_assign_id"
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
                  path="attendance/timesheetapproval/"
                  element={<Navigate to="/manager/detail/attendance" replace />}
                />
                <Route
                  path="attendance/timesheetapproval/:date/"
                  element={<ManagerBulkApprovalScreen />}
                />
                <Route
                  path="attendance/timesheetapproval/:employee_id/"
                  element={<Navigate to="/manager/detail/attendance" replace />}
                />
                <Route
                  path="attendance/timesheetapproval/:employee_id/:date"
                  element={<ManagerApprovalScreen />}
                />
                <Route
                  path="team-leaders/tl"
                  element={<ManagerTeamLeadersView />}
                />
                <Route
                  path="leave-requests/Leaveapplication"
                  element={<ManagerLeaveApplication />}
                />
                <Route
                  path="time-sheet-entry"
                  element={<ManagerTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createdaily/"
                  element={
                    <Navigate to="/manager/detail/time-sheet-entry" replace />
                  }
                />
                <Route
                  path="time-sheet-entry/createdaily/:date"
                  element={<ManagerDailyTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createweekly/"
                  element={
                    <Navigate to="/manager/detail/time-sheet-entry" replace />
                  }
                />
                <Route
                  path="time-sheet-entry/createweekly/:date"
                  element={<ManagerWeeklyTimeSheetEntry />}
                />
                <Route path="reports" element={<ManagerReports />} />

                <Route path="Compoff" element={<ManagerCompoff />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>

            {/* Team leader layout with Dashboard and DetailView*/}
            <Route
              path="/teamlead/*"
              element={
                <ProtectedRoute allowedRoles={["teamlead"]}>
                  <TeamLeadLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeamLeadDashboard />} />
              <Route
                path="detail/"
                element={<Navigate to="/teamlead" replace />}
              />
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
                  path="projects/:project_id"
                  element={<TeamLeadProjectView />}
                />
                <Route
                  path="buildings/"
                  element={<Navigate to="/teamlead/detail/projects" replace />}
                />
                <Route
                  path="buildings/create"
                  element={<TeamLeadBuildingCreate />}
                />
                <Route
                  path="projects/:project_id/buildings/"
                  element={<TeamLeadProjectRedirect />}
                />
                <Route
                  path="projects/:project_id/buildings/:building_assign_id"
                  element={<TeamLeadBuildingView />}
                />
                <Route
                  path="tasks/"
                  element={<Navigate to="/teamlead/detail/projects" replace />}
                />
                <Route path="tasks/create" element={<TeamLeadTaskCreate />} />
                <Route
                  path="projects/:project_id/buildings/:building_assign_id/tasks/"
                  element={<TeamLeadBuildingTaskRedirect />}
                />
                <Route
                  path="projects/:project_id/buildings/:building_assign_id/tasks/:task_assign_id"
                  element={<TeamLeadTaskView />}
                />
                <Route
                  path="time-sheet-entry"
                  element={<TeamLeadTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createdaily/"
                  element={
                    <Navigate to="/teamlead/detail/time-sheet-entry" replace />
                  }
                />
                <Route
                  path="time-sheet-entry/createdaily/:date"
                  element={<TeamLeadDailyTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/approvalscreen"
                  element={<TeamLeadApprovalScreen />}
                />
                <Route
                  path="time-sheet-entry/createweekly/"
                  element={
                    <Navigate to="/teamlead/detail/time-sheet-entry" replace />
                  }
                />
                <Route
                  path="time-sheet-entry/createweekly/:date"
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

                {/* <Route
                  path="approvalscreen"
                  element={<TeamLeadApprovalScreen />}
                /> */}

                {/* <Route
                  path="attendance/attendance-admin"
                  element={<TeamLeadAttendanceAdmin />}
                /> */}
                <Route
                  path="attendance/timesheetapproval/"
                  element={
                    <Navigate to="/teamlead/detail/attendance" replace />
                  }
                />
                <Route
                  path="attendance/timesheetapproval/:employee_id/"
                  element={
                    <Navigate to="/teamlead/detail/attendance" replace />
                  }
                />
                <Route
                  path="attendance/timesheetapproval/:employee_id/:date"
                  element={<TeamLeadApprovalScreen />}
                />
                <Route
                  path="compoffrequest"
                  element={<TeamLeadCompoffRequest />}
                />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>

            {/* Employee layout with Dashboard and DetailView*/}
            <Route
              path="/employee/*"
              element={
                <ProtectedRoute allowedRoles={["employee"]}>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<EmployeeDashboard />} />
              <Route
                path="detail/"
                element={<Navigate to="/employee" replace />}
              />
              <Route path="detail" element={<EmployeeDetailView />}>
                <Route
                  path="time-sheet-entry"
                  element={<EmployeeTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createdaily/"
                  element={
                    <Navigate to="/employee/detail/time-sheet-entry" replace />
                  }
                />
                <Route
                  path="time-sheet-entry/createdaily/:date"
                  element={<EmployeeDailyTimeSheetEntry />}
                />
                <Route
                  path="time-sheet-entry/createweekly/"
                  element={
                    <Navigate to="/employee/detail/time-sheet-entry" replace />
                  }
                />
                <Route
                  path="time-sheet-entry/createweekly/:date"
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
                <Route
                  path="tasks/:task_assign_id"
                  element={<EmployeeTaskDetail />}
                />
                <Route
                  path="compoffrequest"
                  element={<EmployeeCompoffRequest />}
                />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Route>
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>

        {/* Bottom Bar */}
        <footer className="bottom-bar">
          <div>Design, Develop and manufacture drones in India</div>
        </footer>
      </div>
    </Router>
  );
};
export default App;
