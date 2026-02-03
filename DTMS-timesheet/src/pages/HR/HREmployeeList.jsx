// src/pages/HR/EmployeeList.jsx

import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import { FaEdit } from "react-icons/fa";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

// const handleActiveClick = () => {
//   const activeEmployees = employees.filter(
//     (emp) => emp.status === "active"
//   );

//   setFilteredEmployees(activeEmployees);
//   setStatusFilter("active");
// };

//   const handleInactiveClick = () => {
//   const inactiveEmployees = employees.filter(
//     (emp) => emp.status === "inactive"
//   );
//   setFilteredEmployees(inactiveEmployees);
//   setStatusFilter("inactive");
  
// };
// }

// const handleResignedClick = () => {
//   const resignedEmployees = employees.filter(
//     (emp) => emp.status === "resigned"
//   );
//   setFilteredEmployees(resignedEmployees);
//   setStatusFilter("resigned");
  
// };
 
  const navigate = useNavigate();
  const handleActiveClick = () => {
    setStatusFilter("active");
  };

  const handleInactiveClick = () => {
    setStatusFilter("inactive");
  };

  const handleResignedClick = () => {
    setStatusFilter("resigned");
  };
  const [visibleEmployees, setVisibleEmployees] = useState(15);
  const [isLoadingMoreEmployees, setIsLoadingMoreEmployees] = useState(false);
  const [hasMoreEmployees, setHasMoreEmployees] = useState(true);
  const searchTimeout = useRef(null);
  
  // const fetchEmployees = async () => {
    // try {
  //     const response = await fetch(`${config.apiBaseURL}/employees-list/`);
  //     const data = await response.json();
  //     setEmployees(data);
  //     const activeEmployees = data.filter(
  //     (emp) => emp.status === "active"
  //   );
  //     setFilteredEmployees(activeEmployees);
  //     setVisibleEmployees();
  //     // setHasMoreEmployees();
  //     // console.log("Employees", data);
  //   // } catch (error) {
  //     console.error("Error fetching employees:", error);
  //   }
  // };
    const fetchEmployees = async () => {
  try {
    const response = await fetch(`${config.apiBaseURL}/employees-list/`);
    const data = await response.json();
    setEmployees(data); // ONLY set employees
  } catch (error) {
    console.error("Error fetching employees:", error);
  }
};


  const handleAddClick = () => {
    navigate(`add-employee`);
  };

  const handleEditClick = (employee_id) => {
    navigate(`edit-employee/${employee_id}`);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

   useEffect(() => {
  const lowerSearch = searchText.toLowerCase();

  const filtered = employees.filter((emp) => {
    
    if (statusFilter === "active" && emp.status !== "active") return false;
    if (statusFilter === "inactive" && emp.status !== "inactive") return false;
    if (statusFilter === "resigned" && emp.status !== "resigned") return false;

    const code = emp.employee_code?.toLowerCase() || "";
    const name = emp.employee_name?.toLowerCase() || "";
    const manager = emp.reporting_manager?.toLowerCase() || "";

    return (
      code.includes(lowerSearch) ||
      name.includes(lowerSearch) ||
      manager.includes(lowerSearch)
    );
  });

  setFilteredEmployees(filtered);
  setVisibleEmployees(15);
  setHasMoreEmployees(filtered.length > 15);
}, [employees, searchText, statusFilter]);

  // Search filter logic
  // useEffect(() => {
  //   if (searchTimeout.current) {
  //     clearTimeout(searchTimeout.current);
  //   }

  //   searchTimeout.current = setTimeout(() => {
  //     const lowerSearch = searchText.toLowerCase();
  //     const filtered = employees.filter((u) => {
  //       const code = u.employee_code?.toLowerCase() || "";
  //       const name = u.employee_name?.toLowerCase() || "";
  //       const email = u.reporting_manager?.toLowerCase() || "";
  //       return (
  //         code.includes(lowerSearch) ||
  //         name.includes(lowerSearch) ||
  //         email.includes(lowerSearch)
  //       );
  //     });
  //     setFilteredEmployees(filtered);
  //     setVisibleEmployees(15);
  //     setHasMoreEmployees(filtered.length > 15);

  //     if (searchText && filtered.length === 0) {
  //       showInfoToast("No users found");
  //     }
  //   }, 500);

  //   return () => clearTimeout(searchTimeout.current);
  // }, [searchText, employees]);

  return (
    <div className="employee-table-wrapper">
      <div className="user-header">
        <h2 className="employee-title">Employee Details</h2>
         <div className="status-buttons">
      {/* <button
  className="status-btn active-btn"
  onClick={handleActiveClick}
>
  Active
</button> */}

      <button
  className="status-btn Inactive-btn"
  onClick={handleInactiveClick}
>
  Inactive
</button>

    <button 
    className="status-btn resigned-btn"
    onClick={handleResignedClick}
    >
      Resigned
      </button> 
  </div>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search by code, name, or reporting manager"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="search-bar"
          />
        </div>
        <button className="add-user-btn" onClick={() => handleAddClick()}>
          Add Employee
        </button>
      </div>
      <div
        className="table-wrapper"
        style={{ maxHeight: "60vh" }}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (
            scrollTop + clientHeight >= scrollHeight - 15 &&
            !isLoadingMoreEmployees &&
            hasMoreEmployees
          ) {
            setIsLoadingMoreEmployees(true);
            setTimeout(() => {
              const nextVisible = visibleEmployees + 15;
              if (nextVisible >= filteredEmployees.length) {
                setVisibleEmployees(filteredEmployees.length);
                setHasMoreEmployees(false);
              } else {
                setVisibleEmployees(nextVisible);
              }
              setIsLoadingMoreEmployees(false);
            }, 1000); // Simulate 2 seconds loading
          }
        }}
      >
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee Code</th>
              <th>Employee Name</th>
              <th>Last Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Reporting Manager</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.slice(0, visibleEmployees).map((emp) => (
              <tr key={emp.employee_id}>
                <td
                  onClick={() => handleEditClick(emp.employee_id)}
                  style={{
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {emp.employee_code}
                </td>
                <td>{emp.employee_name}</td>
                <td>{emp.last_name}</td>
                <td>{emp.department}</td>
                <td>{emp.designation}</td>
                <td>
                  {emp.hierarchy_details[0]?.reporting_to?.employee_name || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoadingMoreEmployees && (
          <div className="loading-message">Loading...</div>
        )}
        {!hasMoreEmployees && <div className="no-message">No more data</div>}
      </div>
      <ToastContainerComponent />
    </div>
  );
};

export default EmployeeList;
