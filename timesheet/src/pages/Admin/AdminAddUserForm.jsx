// timesheet\src\pages\Admin\AddUserForm.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import roleOptions from "../../constants/roleOptions";
import Breadcrumbs from "../../components/Breadcrumbs";

const AddUserForm = ({ onCancel, onSave }) => {
  const [employeeID, setEmployeeID] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const fetchEmployee = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/unassigned-employees/`
      );
      const data = await response.json();
      setEmployeeOptions(data);
    } catch (error) {
      console.log("Unable to fetch Employees", error);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newUser = { employee_id: employeeID, role, email, password };

    try {
      const response = await fetch(`${config.apiBaseURL}/users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        // throw new Error(`Error adding user: ${response.statusText}`);
        const errorData = await response.json();
        throw new Error(
          `Error adding user: ${errorData.detail || response.statusText}`
        );
      }

      console.log("User added successfully");
      navigate("/admin/detail/users");
      // onSave();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleCancel = () => {
    navigate("/admin/detail/users");
  };

  return (
    <div className="add-user-container">
      <Breadcrumbs
        crumbs={[
          { label: "Admin", link: "/admin" },
          { label: "Users", link: "/admin/detail/users" },
          { label: "Add User" }, // or "Edit User"
        ]}
        showBack={true}
      />

      <div className="table-top-bar">
        <div>Add User</div>
      </div>
      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee ID</label>
          <select
            value={employeeID}
            onChange={(e) => {
              const selectedID = e.target.value;
              setEmployeeID(selectedID);
              const selectedEmployee = employeeOptions.find(
                (emp) => emp.employee_id === selectedID
              );
              if (selectedEmployee) {
                setEmail(selectedEmployee.employee_email || "");
              }
            }}
            required
          >
            <option value="">Select Employee</option>
            {employeeOptions.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_code} - {emp.employee_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Employee role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Employee email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label>Password</label>
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              position: "absolute",
              right: "12px",
              top: "55%",
              transform: "translateX(-50%)",
              cursor: "pointer",
              fontSize: "14px",
              color: "#007bff",
              userSelect: "none",
            }}
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <div className="form-buttons">
          <button
            type="submit"
            className="btn btn-green"
            disabled={!employeeID || !role || !email || !password}
          >
            Save
          </button>

          <button
            type="button"
            className="btn btn-orange"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
