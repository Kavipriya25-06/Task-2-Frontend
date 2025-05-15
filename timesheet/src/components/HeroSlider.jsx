// src/components/HeroSlider.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
// import { Lazy } from "swiper/modules"; // import Lazy
// import "swiper/css/lazy";
import "swiper/css";
import "swiper/css/effect-fade";
import "./HeroSlider.css"; // custom styles
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

const slides = [
  // "https://arrisltd.com/wp-content/uploads/2025/03/NZ-Post.png",
  // "https://arrisltd.com/wp-content/uploads/2025/03/MRF-PONDY-ETPSTP-NWF-05-03-1.png",
  // "https://arrisltd.com/wp-content/uploads/2025/03/Kuwait-Energy-2-copy.png",
];

export default function HeroSlider() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page
  };
  return (
    // <div className="hero-banner">
    //   <Swiper
    //     modules={[Autoplay, EffectFade]}
    //     autoplay={{ delay: 5000 }}
    //     effect="fade"
    //     // loop={true}
    //     className="hero-slide swiper-lazy"
    //   >
    //     {slides.map((src, index) => (
    //       <SwiperSlide key={index}>
    //         <div
    //           className="hero-slide"
    //           style={{ backgroundImage: `url(${src})` }}
    //         />
    //       </SwiperSlide>
    //     ))}
    //   </Swiper>

    //   <div className="hero-content">
    //     <h2>Your Partner in Engineering Excellence.</h2>
    //     <p>
    //       ARRIS brings in integrated multi-disciplinary service to our
    //       customers, ensuring quality and meeting the schedule requirements of
    //       the project. We are an ISO 9001-2015 certified company with a
    //       well-established Quality Management System.
    //     </p>
    //     <a
    //       className="hero-button"
    //       href="https://arrisltd.com/civil-and-structural-engineering/"
    //     >
    //       Get Started
    //     </a>
    //   </div>
    // </div>
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
        {/* <a
          className="hero-button"
          href="https://arrisltd.com/civil-and-structural-engineering/"
        >
          Get Started
        </a> */}

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
