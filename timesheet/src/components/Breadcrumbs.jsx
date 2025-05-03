// src/components/Breadcrumbs.jsx

import { useNavigate } from "react-router-dom";
import "./Breadcrumbs.css";

const Breadcrumbs = ({ crumbs = [], showBack = false }) => {
  const navigate = useNavigate();

  return (
    <div className="breadcrumbs-container">
      {showBack && (
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
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
