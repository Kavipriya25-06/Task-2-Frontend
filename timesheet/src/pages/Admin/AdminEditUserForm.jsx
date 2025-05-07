import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../../config";
import roleOptions from "../../constants/roleOptions";

import { FaEdit } from "react-icons/fa";
import Breadcrumbs from "../../components/Breadcrumbs";


const EditUserForm = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();

  const [employeeID, setEmployeeID] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // optional on edit
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false); //  Add this at the top

  const fetchUser = async () => {
    try {
      const response = await fetch(
        `${config.apiBaseURL}/user-details/${user_id}/`
      );
      const data = await response.json();
      setEmployeeID(data.employee_id);
      setRole(data.role);
      setEmail(data.email);
      setPassword(data.password);
    } catch (error) {
      console.error("Error fetching user", error);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/employees/`);
      const data = await response.json();
      setEmployeeOptions(data);
    } catch (error) {
      console.error("Error fetching employees", error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchEmployee();
  }, [user_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedUser = {
      employee_id: employeeID,
      role,
      email,
    };

    if (password) updatedUser.password = password; // only include if edited

    try {
      const response = await fetch(`${config.apiBaseURL}/users/${user_id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error(`Error updating user: ${response.statusText}`);
      }

      console.log("User updated successfully");
      navigate("/admin/detail/users");
    } catch (error) {
      console.error("Error updating user", error);
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
          { label: "View User" }, // or "Edit User"
        ]}
        showBack={true}
      />
      <div className="table-top-bar">
        <div>
          {editMode ? (
            <div className="table-top-bar-header">
              <div>Edit user</div>
            </div>
          ) : (
            <div className="table-top-bar-header">
              <div className="view-label">View user</div>
              <button
                type="edit"
                onClick={() => setEditMode(true)}
                className="edit-btn"
              >
              <FaEdit className="edit-icon" />
              </button>
            </div>
          )}
        </div>
      </div>

      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee Code</label>
          <div className="uneditable">
            {employeeID.employee_code} - {employeeID.employee_name}
          </div>
        </div>

        <div className="form-group">
          <label>Role</label>
          {editMode ? (
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
          ) : (
            <div className="uneditable">{role}</div>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          {/* {editMode ? (
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          ) : ( */}
          <div className="uneditable">{email}</div>
          {/* )} */}
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label>Password</label>
          {editMode ? (
            <div>
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
          ) : (
            <div className="uneditable">
              {password ? "*".repeat(password.length) : ""}
            </div>
          )}
        </div>

        {editMode ? (
          <div className="form-buttons">
            <button
              type="submit"
              className="btn btn-green"
              onClick={() => setEditMode(false)}
            >
              Update
            </button>
            <button
              type="button"
              className="btn btn-red"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div></div>
        )}
      </form>
    </div>
  );
};

export default EditUserForm;
