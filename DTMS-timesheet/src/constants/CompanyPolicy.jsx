import React, { useEffect, useState } from "react";
// import config from "../../config"; // update path as per your project
import config from "../config";

import { useAttachmentManager } from "./useAttachmentManager";

const CompanyPolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    attachments,
    setAttachments,
    newAttachments,
    setNewAttachments,
    handleAttachmentChange,
    removeExistingAttachment,
    removeNewAttachment,
    profilePicture,
    setProfilePicture,
    profilePictureUrl,
    setProfilePictureUrl,
  } = useAttachmentManager([]);

  useEffect(() => {
    fetch(`${config.apiBaseURL}/company-policy/`)
      .then((res) => res.json())
      .then((data) => {
        setPolicies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching company policies:", err);
        setLoading(false);
      });
  }, []);

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = `${config.apiBaseURL}${fileUrl}`;
    link.download = fileName;
    link.target = "_blank";
    link.click();
  };

  if (loading) return <p>Loading policies...</p>;

  return (
    <div className="company-policy-wrapper">
      <h2 className="section-header">Company Policies</h2>
      {policies.length > 0 ? (
        <table className="info-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Uploaded At</th>
              <th>View</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id}>
                <td>{policy.document_name}</td>
                <td>{new Date(policy.uploaded_at).toLocaleString()}</td>
                <td>
                  <a
                    href={config.apiBaseURL + policy.file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </td>
                <td>
                  <button
                    className="download-button"
                    onClick={() =>
                      handleDownload(policy.file, policy.document_name)
                    }
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No company policies found.</p>
      )}
    </div>
  );
};

export default CompanyPolicy;
