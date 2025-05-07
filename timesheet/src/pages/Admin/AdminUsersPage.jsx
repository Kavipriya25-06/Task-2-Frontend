// src\pages\Admin\UsersPage.jsx

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";
// import editIcon from "src/assets/edit.png";

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/user-details/`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log("Unable to fetch users", error);
    }
  };

  const handleAddClick = () => {
    navigate(`add-user`);
  };

  const handleEditClick = (user_id) => {
    navigate(`edit-user/${user_id}`);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div>
      <div className="user-header">
        <h2 className="employee-title">User credentials</h2>
        <button onClick={handleAddClick} className="add-user-btn">
          Add User
        </button>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>Employee Code</th>
            <th>Name</th>
            <th>Access Role</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td
                onClick={() => handleEditClick(u.user_id)}
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {u.employee_id.employee_code}
              </td>
              <td>{u.employee_id.employee_name}</td>
              <td>{u.role}</td>
              <td>{u.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;
