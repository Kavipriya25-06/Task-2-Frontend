// src\pages\Org\OrgNode.jsx
import React from "react";

const OrgNode = ({ node }) => {
  return (
    <div className="org-node-line">
      <div className="org-node">
        {node.profile_picture && (
          <img
            src={node.profile_picture}
            alt={node.name}
            style={{ width: "40px", height: "40px", borderRadius: "50%" }}
          />
        )}
        <div>
          <strong>{node.name}</strong>
        </div>
        <div>{node.designation}</div>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="org-children">
          {node.children.map((child) => (
            <OrgNode key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgNode;
