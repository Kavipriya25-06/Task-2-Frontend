import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../../AuthContext";
import config from "../../config";
import { useNavigate } from "react-router-dom";

const ManagerBuildingCreate = () => {
  const [buildingData, setBuildingData] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBuildingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    navigate("/manager/detail/projects/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = buildingData;

    try {
      const res = await fetch(`${config.apiBaseURL}/buildings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Building created successfully!");
      } else {
        console.error(data);
        alert("Failed to create Building.");
      }
      setTimeout(() => navigate(`/manager/detail/projects/`), 1000);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="create-building-container">
      <h2>Create Building</h2>
      <form onSubmit={handleSubmit}>
        <div className="building-elements">
          <div className="top-elements">
            <div>
              <label>Building code</label><br />
              <input
                name="building_code"
                value={buildingData.building_code || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <label>Building Title</label><br />
              <input
                name="building_title"
                value={buildingData.building_title || ""}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="bottom-elements">
            <div>
              <label>Building Description</label><br />
              <textarea
                name="building_description"
                value={buildingData.building_description || ""}
                onChange={handleChange}
                rows={4} // optional: sets the height
                className="textarea" // optional: for styling
              />
            </div>
          </div>
        </div>
        <div className="form-buttons">
          <button type="submit" className="btn-green">
            Create
          </button>
          <button
            type="reset"
            className="btn-red"
            onClick={() => handleCancel()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ManagerBuildingCreate;
