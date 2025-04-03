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
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();

  const fetchUser = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/users/`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.log("Unable to fetch users", error);
    }
  };

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/employees/`);
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.log("Unable to fetch Employees", error);
    }
  };

  const handleAddClick = () => {
    navigate(`add-user`);
  };

  useEffect(() => {
    fetchUser();
    fetchEmployee();
  }, []);

  return (
    <div>
      <h2 className="employee-title">User credentials</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Role</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.user_id}>
              <td>{u.email.split("@")[0]}</td>
              <td>{u.employee_id}</td>
              <td>{u.role}</td>
              <td>{u.email}</td>
              <td>
                <button
                  className="edit-icon-btn"
                  onClick={() => navigate(`edit-user/${u.user_id}`)}
                  title="Edit User"
                >
                  <FaEdit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddClick} className="add-user-btn">
        Add User
      </button>
    </div>
  );
};

export default UsersPage;
