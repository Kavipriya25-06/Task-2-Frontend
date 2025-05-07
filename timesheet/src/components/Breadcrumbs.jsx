// src/components/Breadcrumbs.jsx

import { useNavigate } from "react-router-dom";
import "./Breadcrumbs.css";
import { FaArrowLeft } from "react-icons/fa";


const Breadcrumbs = ({ crumbs = [], showBack = false, backPath = null }) => {
  const navigate = useNavigate();

  return (
    <div className="breadcrumbs-container">
      {showBack && (
        <button
          className="back-button"
          onClick={() => {
            if (backPath) {
              navigate(backPath);
            } else {
              navigate(-1); // Go back one step by default
            }
          }}
        >
          <FaArrowLeft style={{ marginRight: "6px" }} /> Back
        </button>
      )}
      <div className="breadcrumbs">
        {crumbs.map((c, i) => (
          <span key={i}>
            {c.link ? (
              <span
                className="breadcrumb-link"
                onClick={() => navigate(c.link)}
              >
                {c.label}
              </span>
            ) : (
              <span>{c.label}</span>
            )}
            {i < crumbs.length - 1 && <span> / </span>}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumbs;
