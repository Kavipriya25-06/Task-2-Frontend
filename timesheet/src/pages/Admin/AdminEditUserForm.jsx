import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../../config";
import roleOptions from "../../constants/roleOptions";

const EditUserForm = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();

  const [employeeID, setEmployeeID] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // optional on edit
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/users/${user_id}/`);
      const data = await response.json();
      setEmployeeID(data.employee_id);
      setRole(data.role);
      setEmail(data.email);
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
      <div className="table-top-bar">
        <div>Edit User</div>
      </div>

      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Employee ID</label>
          <select
            value={employeeID}
            onChange={(e) => setEmployeeID(e.target.value)}
            required
          >
            <option value="">Select Employee</option>
            {employeeOptions.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_id} - {emp.employee_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Role</label>
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
          <label>Email</label>
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
          <button type="submit" className="btn btn-green">
            Update
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

export default EditUserForm;
