import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import config from "../../config";
import { FaEdit } from "react-icons/fa";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const API = {
  CLIENTS: `${config.apiBaseURL}/client/`, // GET list; GET/PATCH/DELETE :id/
};

function ClientPOCSection({ clientId, disabledNav = false }) {
  const [pocs, setPocs] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [visible, setVisible] = useState(10);

  const loadPocs = async () => {
    try {
      const res = await fetch(
        `${config.apiBaseURL}/client-poc-by-client/${clientId}/`
      );
      if (!res.ok) throw new Error("POC fetch failed");
      const data = await res.json();
      setPocs(data);
      setFiltered(data);
      setVisible(10);
    } catch (e) {
      console.error(e);
      showErrorToast("Failed to load POCs");
    }
  };

  useEffect(() => {
    if (clientId) loadPocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    const q = search.toLowerCase();
    const f = pocs.filter(
      (p) =>
        (p.poc_name || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.department || "").toLowerCase().includes(q)
    );
    setFiltered(f);
    setVisible(10);
  }, [search, pocs]);

  // Helper: renders a Link when enabled, otherwise a <span> that looks disabled
  const NavIfEnabled = ({ to, className, title, children }) =>
    disabledNav ? (
      <span
        className={`disabled-link ${className || ""}`}
        aria-disabled="true"
        title={title || "Disabled while editing client"}
      >
        {children}
      </span>
    ) : (
      <Link to={to} className={className} title={title}>
        {children}
      </Link>
    );

  const DEPTS = [
    { value: "bd", label: "Business development" },
    { value: "finance", label: "Finance" },
    { value: "tech", label: "Tech" },
  ];

  return (
    <div className="poc-section">
      <div className="user-header" style={{ marginTop: 24 }}>
        <h3 className="employee-title">Points of Contact</h3>
        <div className="search-bar-container">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search POCs by name/phone/email/department"
            className="search-bar"
          />
        </div>

        {/* pass the client id via query param so the Add form can preselect it */}
        {/* <Link
          className="add-user-btn"
          to={`/manager/detail/clients/view/${clientId}/pocs/add?client=${clientId}`}
        >
          Add POC
        </Link> */}
        {disabledNav ? (
          <button
            className="disabled-link-add-user-btn"
            disabled
            title="Finish editing client to add a POC"
          >
            Add POC
          </button>
        ) : (
          <Link
            className="add-user-btn"
            to={`/manager/detail/clients/view/${clientId}/pocs/add?client=${clientId}`}
          >
            Add POC
          </Link>
        )}
      </div>

      <div
        className="table-wrapper"
        style={{ maxHeight: 300, overflow: "auto" }}
      >
        <table className="employee-table">
          <thead>
            <tr>
              <th>POC Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Department</th>
              {/* <th style={{ width: 80 }}>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, visible).map((p) => {
              const id = p.id ?? p.clientpoc_id ?? p.pk;
              const pocEditPath = `/manager/detail/clients/view/${clientId}/pocs/view/${id}`;
              return (
                <tr key={id}>
                  <td>
                    {/* <Link
                      to={`/manager/detail/clients/view/${clientId}/pocs/view/${id}`}
                      style={{ textDecoration: "underline" }}
                    >
                      {p.poc_name || "-"}
                    </Link> */}
                    <NavIfEnabled to={pocEditPath} className="poc-name-link">
                      {p.poc_name || "-"}
                    </NavIfEnabled>
                  </td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.email || "-"}</td>
                  {/* <td>{p.department || "-"}</td> */}
                  <td>
                    {DEPTS.find((d) => d.value === p.department)?.label || "-"}
                  </td>
                  {/* <td>
                    <Link
                      className="icon-btn"
                      title="Edit"
                      to={`/manager/detail/clients/view/${clientId}/pocs/view/${id}`}
                    >
                      <FaEdit />
                    </Link>
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>

        {visible < filtered.length && (
          <div style={{ padding: 12, textAlign: "center" }}>
            <button
              className="btn-green"
              onClick={() => setVisible((v) => v + 10)}
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ManagerClientEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    client_name: "",
    client_address: "",
    gst_number: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`${API.CLIENTS}${id}/`);
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const data = await res.json();
      setForm({
        client_name: data.client_name ?? "",
        client_address: data.client_address ?? "",
        gst_number: data.gst_number ?? "",
      });
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to load client");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!editMode) return;
    if (!form.client_name?.trim())
      return showWarningToast("Client name is required");

    try {
      setSubmitting(true);
      const res = await fetch(`${API.CLIENTS}${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      showSuccessToast("Client updated");
      setEditMode(false);
      await load();
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to update client");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-message">Loading…</div>;

  const field = (label, name, type = "text") => (
    <div className="individual-tabs">
      <label>{label}</label>
      {editMode ? (
        type === "textarea" ? (
          <textarea
            name={name}
            value={form[name] || ""}
            onChange={onChange}
            placeholder={label}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={form[name] || ""}
            onChange={onChange}
            placeholder={label}
          />
        )
      ) : (
        <div className="uneditable">{form[name] || "-"}</div>
      )}
    </div>
  );

  return (
    <div className="add-employee-wrapper">
      <h2 className="employee-title">
        {editMode ? "Edit Client" : "View Client"}
      </h2>
      {!editMode && (
        <button
          onClick={() => setEditMode(true)}
          className="edit-toggle-btn"
          title="Edit"
        >
          <FaEdit className="edit-icon" />
        </button>
      )}

      <form className="add-employee-form" onSubmit={onSubmit}>
        <div className="tab-content">
          {field("Client Name", "client_name")}
          {field("GST Number", "gst_number")}
          {field("Address", "client_address", "textarea")}
        </div>

        {editMode && (
          <div className="form-buttons">
            <button type="submit" className="btn-save" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
      <ClientPOCSection clientId={id} disabledNav={editMode} />
      <ToastContainerComponent />
    </div>
  );
}
