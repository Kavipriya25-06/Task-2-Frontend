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
        <h2>Empower your missions</h2>
        <p>
          <strong>Aero360 -</strong> from Dronix Technologies Pvt Ltd, designs
          and builds indigenous high performance autonomous drones to enhance
          aerial surveying, surveillance and monitoring operations
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
