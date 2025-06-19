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

  const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // From right to left, 1000 milliseconds, 60 seconds, 60 minutes, 2 hours
  const inactivityTimer = useRef(null); // Store inactivity timer reference

  // Login function
  const login = async (email, password) => {
    try {
      // Call API to authenticate user
      const response = await fetch(
        `${config.apiBaseURL}/login-details/${email}/${password}/`
      );
      const foundUser = await response.json();
      console.log("Found user", foundUser);
      // const foundUser = users.find(
      //   (u) => u.email === email && u.password === password
      // );
      if (foundUser.error === "Password is incorrect") {
        return "passwordinvalid";
      }
      if (foundUser.error === "User not found") {
        return "nouser";
      }
      if (foundUser.error === "Please provide password") {
        return "invalid";
      }
      if (foundUser.error === "Please provide user and password") {
        return "nouser";
      }
      if (!foundUser.error) {
        if (foundUser.status === "active") {
          // Fetch employee details based on user info
          const employeeResponse = await fetch(
            `${config.apiBaseURL}/employees-details/${foundUser.employee_id.employee_id}/`
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
          return "logged";
        } else {
          return "inactive";
          throw new Error("User not active contact admin");
        }
      } else {
        return "invalid";
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      return "nouser";
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    localStorage.setItem("logoutEvent", Date.now()); // broadcast logout
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

  useEffect(() => {
    const syncLogout = (event) => {
      if (event.key === "logoutEvent") {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("lastActivity");
        // window.location.href = "/login"; // Or redirect as needed
      }
    };

    window.addEventListener("storage", syncLogout);
    return () => window.removeEventListener("storage", syncLogout);
  }, []);

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
