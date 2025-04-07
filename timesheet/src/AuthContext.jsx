// timesheet\src\AuthContext.jsx

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import config from "./config"; // Import config for API endpoints

// Create AuthContext
const AuthContext = createContext(null);

// Custom hook to use AuthContext
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// AuthProvider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }); // Stores user info (email and role)

  const INACTIVITY_TIMEOUT = 1000 * 60 * 1000; // 1000 minutes
  const inactivityTimer = useRef(null); // Store inactivity timer reference

  // Login function
  const login = async (email, password) => {
    try {
      // Call API to authenticate user
      const response = await fetch(`${config.apiBaseURL}/users/`);
      const users = await response.json();
      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        // Fetch employee details based on user info
        const employeeResponse = await fetch(
          `${config.apiBaseURL}/employees-details/${foundUser.employee_id}/`
        );
        const employeeDetails = await employeeResponse.json();
        const loggedInUser = {
          email: foundUser.email,
          role: foundUser.role,
          user_id: foundUser.user_id,
          employee_id: employeeDetails.employee_id,
          employee_name: employeeDetails.employee_name,
          employee_code: employeeDetails.employee_code,
          status: employeeDetails.status,
          designation: employeeDetails.designation,
          department: employeeDetails.department,
          hierarchy_details: employeeDetails.hierarchy_details,
        };

        // const loggedInUser = { email: foundUser.email, role: foundUser.role };

        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser)); // Persist user state
        resetInactivityTimer(); // Start inactivity timer on login
        return true;
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    const now = Date.now();
    localStorage.setItem("lastActivity", now.toString());

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current); // Clear existing timer
    }

    inactivityTimer.current = setTimeout(() => {
      alert("You have been logged out due to inactivity.");
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  // Check for inactivity on page load
  useEffect(() => {
    const storedLastActivity = localStorage.getItem("lastActivity");
    const now = Date.now();

    if (
      storedLastActivity &&
      now - parseInt(storedLastActivity, 10) > INACTIVITY_TIMEOUT
    ) {
      // If inactivity timeout has passed, logout
      logout();
    } else if (user) {
      // Otherwise, reset the timer
      resetInactivityTimer();
    }
  }, [user, logout, resetInactivityTimer]);

  useEffect(() => {
    if (user) {
      // resetInactivityTimer();

      const handleActivity = () => resetInactivityTimer();
      window.addEventListener("mousemove", handleActivity);
      window.addEventListener("keydown", handleActivity);
      window.addEventListener("click", handleActivity);

      return () => {
        window.removeEventListener("mousemove", handleActivity);
        window.removeEventListener("keydown", handleActivity);
        window.removeEventListener("click", handleActivity);
      };
    }
  }, [user, resetInactivityTimer]);

  // Utility to check if user has a specific role
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Named exports for consistency
export { AuthProvider, useAuth };
