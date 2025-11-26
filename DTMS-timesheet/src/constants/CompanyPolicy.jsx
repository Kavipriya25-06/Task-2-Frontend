// src\constants\CompanyPolicy.jsx

import React, { useEffect, useState } from "react";
// import config from "../../config"; // update path as per your project
import config from "../config";
import { useAuth } from "../AuthContext";
import confirm from "./ConfirmDialog";

import { useAttachmentManager } from "./useAttachmentManager";

import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  showWarningToast,
  ToastContainerComponent,
} from "../constants/Toastify";

const getFileIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  switch (ext) {
    case "pdf":
      return <i className="fas fa-file-pdf" style={{ color: "red" }} />;
    case "doc":
    case "docx":
      return <i className="fas fa-file-word" style={{ color: "blue" }} />;
    case "xls":
    case "xlsx":
      return <i className="fas fa-file-excel" style={{ color: "green" }} />;
    default:
      return <i className="fas fa-file" />;
  }
};

const CompanyPolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [newDocName, setNewDocName] = useState("");

  const { user } = useAuth();
  const selectedRole = user?.role;
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

  const handleDelete = async (id) => {
    const confirmDelete = await confirm({
      message: `Are you sure you want to  delete this document??`,
    });
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${config.apiBaseURL}/company-policy/${id}/`, {
        method: "DELETE",
        headers: {
          // Authorization: `Bearer ${user?.access}`,
        },
      });

      if (!res.ok && res.status !== 204) {
        throw new Error("Failed to delete policy");
      }

      setPolicies((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting policy:", err);
      showErrorToast("Failed to delete document. Check console for details.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newFile) {
      showErrorToast("Please select a file");
      return;
    }

    if (!newDocName) {
      showErrorToast("Please provide a file name");
      return;
    }

    const formData = new FormData();
    formData.append("file", newFile);
    if (newDocName) {
      formData.append("document_name", newDocName);
    }
    formData.append("employee", user.employee_id);

    try {
      setUploading(true);
      const res = await fetch(`${config.apiBaseURL}/company-policy/`, {
        method: "POST",
        body: formData,
        headers: {
          // Do NOT set Content-Type here (browser sets boundary)
          // Authorization: `Bearer ${user?.access}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
      }

      // backend now returns serializer.data (single object)
      const createdPolicy = await res.json();

      setPolicies((prev) => [createdPolicy, ...prev]);
      setNewFile(null);
      setNewDocName("");
      e.target.reset();
    } catch (err) {
      console.error("Error uploading policy:", err);
      showErrorToast("Failed to upload document. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p>Loading policies...</p>;

  return (
    <div className="company-policy-wrapper">
      <h2 className="section-header">Company Policies</h2>
      {/* Upload form - HR only */}
      {selectedRole === "hr" && (
        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h3>Add New Policy</h3>
          <form
            onSubmit={handleUpload}
            className="policy-upload-row"
            // style={{ display: "flex", flexDirection: "row" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                gap: "60px",
              }}
            >
              <div className="policy-upload-group">
                <label>
                  Document Name:{" "}
                  <input
                    type="text"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g., Leave Policy 2025"
                    className="policy-upload-input"
                    // style={{ padding: "0.3rem 0.5rem", minWidth: "250px" }}
                  />
                </label>
              </div>
              <div className="policy-upload-group">
                <label>
                  File:{" "}
                  <input
                    type="file"
                    className="policy-upload-file"
                    onChange={(e) => setNewFile(e.target.files[0] || null)}
                  />
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="policy-upload-btn"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload Policy"}
            </button>
          </form>
        </div>
      )}
      {policies.length > 0 ? (
        <table className="info-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Uploaded At</th>
              <th>Uploaded By</th>
              {/* {selectedRole === "hr" && <th>Modify</th>} */}
              {/* <th>View</th> */}
              {/* <th>Download</th> */}
              {selectedRole === "hr" && <th>Delete</th>}
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id}>
                {/* <td>{getFileIcon(policy.file)}</td> */}
                <td>
                  <a
                    href={config.apiBaseURL + policy.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={"Open " + policy.document_name}
                    style={{ marginRight: "10px" }}
                  >
                    {policy.document_name}
                  </a>
                </td>
                <td>{new Date(policy.uploaded_at).toLocaleString()}</td>
                {/* <td>{policy.uploaded_by?.employee_name || "-"}</td> */}
                <td>
                  {policy.uploaded_by
                    ? `${policy.uploaded_by?.employee_name ?? ""} ${
                        policy.uploaded_by?.last_name ?? ""
                      }`.trim()
                    : "-"}
                </td>

                {/*<td>
                   <a
                    href={config.apiBaseURL + policy.file}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a> 
                </td>*/}
                {/* <td>
                  <button
                    className="download-button"
                    onClick={() =>
                      handleDownload(policy.file, policy.document_name)
                    }
                  >
                    Download
                  </button>
                </td> */}
                {selectedRole === "hr" && (
                  <td>
                    <button
                      className="btn-danger"
                      onClick={() => handleDelete(policy.id)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No company policies found.</p>
      )}
      <ToastContainerComponent />
    </div>
  );
};

export default CompanyPolicy;
