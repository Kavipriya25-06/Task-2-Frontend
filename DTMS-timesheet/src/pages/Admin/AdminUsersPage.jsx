// src\pages\Admin\UsersPage.jsx

import { useEffect, useState, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";
// import Breadcrumbs from "../../components/Breadcrumbs";
// import editIcon from "src/assets/edit.png";

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [visibleUsers, setVisibleUsers] = useState(10);
  const [isLoadingMoreUsers, setIsLoadingMoreUsers] = useState(false);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${config.apiBaseURL}/user-details/`);
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
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

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      const lowerSearch = searchText.toLowerCase();
      const filtered = users.filter((u) => {
        const code = u.employee_id?.employee_code?.toLowerCase() || "";
        const name = u.employee_id?.employee_name?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        return (
          code.includes(lowerSearch) ||
          name.includes(lowerSearch) ||
          email.includes(lowerSearch)
        );
      });

      setFilteredUsers(filtered);
      setVisibleUsers(10);
      setHasMoreUsers(filtered.length > 10);

      if (searchText && filtered.length === 0) {
        showInfoToast("No users found");
      }
    }, 500);

    return () => clearTimeout(searchTimeout.current);
  }, [searchText, users]);

  return (
    <div>
      {/* <Breadcrumbs
        crumbs={[{ label: "Admin", link: "/admin" }, { label: "Users" }]}
        showBack={false}
      /> */}
      <div className="user-header">
        <h2 className="employee-title">User credentials</h2>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search by code, name, or email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-bar"
          />
        </div>
        <button onClick={handleAddClick} className="add-user-btn">
          Add User
        </button>
      </div>

      <div
        className="table-wrapper"
        style={{ maxHeight: "400px" }}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (
            scrollTop + clientHeight >= scrollHeight - 10 &&
            !isLoadingMoreUsers &&
            hasMoreUsers
          ) {
            setIsLoadingMoreUsers(true);
            setTimeout(() => {
              const nextVisible = visibleUsers + 10;
              if (nextVisible >= filteredUsers.length) {
                setVisibleUsers(filteredUsers.length);
                setHasMoreUsers(false);
              } else {
                setVisibleUsers(nextVisible);
              }
              setIsLoadingMoreUsers(false);
            }, 1000); // Simulate 2 seconds loading
          }
        }}
      >
        <table className="user-table">
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Name</th>
              <th>Access Role</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.slice(0, visibleUsers).map((u) => (
              <tr key={u.user_id}>
                <td
                  onClick={() => handleEditClick(u.user_id)}
                  style={{
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {u.employee_id?.employee_code}
                </td>
                <td>{u.employee_id?.employee_name}</td>
                <td>
                  {u.role === "admin"
                    ? "Admin"
                    : u.role === "hr"
                    ? "HR"
                    : u.role === "teamlead"
                    ? "Team Lead"
                    : u.role === "employee"
                    ? "Employee"
                    : u.role === "manager"
                    ? "Manager"
                    : "-"}
                </td>
                <td>{u.email}</td>
                <td>
                  {u.status === "active"
                    ? "Active"
                    : u.status === "inactive"
                    ? "Inactive"
                    : u.status === "resigned"
                    ? "Resigned"
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoadingMoreUsers && (
          <div className="loading-message">Loading...</div>
        )}
        {!hasMoreUsers && <div className="no-message">No more data</div>}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default UsersPage;
