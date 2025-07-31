// src\pages\Org\ManagerHierarchyChart.jsx

import React, { useEffect, useState } from "react";
import OrgNode from "./OrgNode";
import "./orgchart.css";
import config from "../../config";

const ManagerHierarchyChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`${config.apiBaseURL}/orgchart/manager/`)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      {Object.keys(data).map((managerId) => {
        const managerInfo = data[managerId].manager;
        return (
          <div key={managerId} style={{ marginBottom: "50px" }}>
            <h2 style={{ textAlign: "center" }}>
              Manager: {managerInfo.name} ({managerInfo.designation})
            </h2>
            <div className="org-chart">
              {data[managerId].children.map((rootNode) => (
                <OrgNode key={rootNode.id} node={rootNode} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ManagerHierarchyChart;
