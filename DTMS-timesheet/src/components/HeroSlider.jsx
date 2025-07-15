// src/components/HeroSlider.jsx

import "swiper/css";
import "swiper/css/effect-fade";
import "./HeroSlider.css"; // custom styles
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function HeroSlider() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page
  };
  return (
    <div style={{ padding: "20px" }}>
      {/* <h2>Welcome to Timesheet Management system</h2> */}
      <div className="hero-content">
        <h2>Your Partner in Engineering Excellence.</h2>
        <p>
          ARRIS brings in integrated multi-disciplinary service to our
          customers, ensuring quality and meeting the schedule requirements of
          the project. We are an ISO 9001-2015 certified company with a
          well-established Quality Management System.
        </p>

        <button
          className="btn-cancel"
          onClick={() => {
            handleLogout();
            navigate("/login");
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
