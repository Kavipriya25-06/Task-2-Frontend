// src\pages\Org\DepartmentHierarchyChart.jsx

import React, { useEffect, useState } from "react";
import OrgNode from "./OrgNode";
import "./orgchart.css";
import config from "../../config";

const DepartmentHierarchyChart = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/orgchart/department/")
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      {Object.keys(data).map((dept) => (
        <div key={dept} style={{ marginBottom: "50px" }}>
          <h2 style={{ textAlign: "center" }}>{dept}</h2>
          <div className="org-chart">
            {data[dept].map((rootNode) => (
              <OrgNode key={rootNode.id} node={rootNode} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DepartmentHierarchyChart;
