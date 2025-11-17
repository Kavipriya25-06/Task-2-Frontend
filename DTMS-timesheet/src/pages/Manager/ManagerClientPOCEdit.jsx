import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import config from "../../config";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const API = {
  POCS: `${config.apiBaseURL}/client-poc/`, // GET/PATCH :id/
  CLIENTS: `${config.apiBaseURL}/client/`, // for dropdown
};

const DEPTS = [
  { value: "bd", label: "Business development" },
  { value: "finance", label: "Finance" },
  { value: "tech", label: "Tech" },
];

export default function ManagerClientPOCEdit() {
  const { pocid } = useParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    poc_name: "",
    phone: "",
    email: "",
    department: "",
    client: "",
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const [pocRes, clientsRes] = await Promise.all([
        fetch(`${API.POCS}${pocid}/`),
        fetch(API.CLIENTS),
      ]);
      if (!pocRes.ok) throw new Error(`Fetch POC failed (${pocRes.status})`);
      const poc = await pocRes.json();
      const cl = (await clientsRes.json()) || [];
      setClients(cl);

      // Accept both nested client object or id
      const clientId =
        typeof poc.client === "object"
          ? poc.client.id ?? poc.client.pk
          : poc.client;

      setForm({
        poc_name: poc.poc_name ?? "",
        phone: poc.phone ?? "",
        email: poc.email ?? "",
        department: poc.department ?? "",
        client: clientId ?? "",
      });
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to load POC");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pocid]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!editMode) return;
    if (!form.poc_name?.trim()) return showWarningToast("POC name is required");
    if (!form.client) return showWarningToast("Select a client");

    try {
      setSubmitting(true);
      const res = await fetch(`${API.POCS}${pocid}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);
      showSuccessToast("POC updated");
      setEditMode(false);
      await load();
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to update POC");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-message">Loading…</div>;

  const field = (label, name, type = "text") => (
    <div className="individual-tabs">
      <label>{label}</label>
      {editMode ? (
        <input
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={onChange}
          placeholder={label}
        />
      ) : (
        <div className="uneditable">{form[name] || "-"}</div>
      )}
    </div>
  );

  const numericfield = (label, name, type = "text", numericOnly = false) => (
    <div className="individual-tabs">
      <label>{label}</label>
      {editMode ? (
        <input
          type={type}
          name={name}
          value={form[name] || ""}
          maxLength={15}
          onChange={(e) => {
            let value = e.target.value.replace(/[^0-9+-]/g, "");

            onChange({ target: { name, value } });
          }}
          placeholder={label}
        />
      ) : (
        <div className="uneditable">{form[name] || "-"}</div>
      )}
    </div>
  );

  return (
    <div className="add-employee-wrapper">
      <h2 className="employee-title">
        {editMode ? "Edit Client POC" : "View Client POC"}
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
          {field("POC Name", "poc_name")}
          {/* {field("Phone", "phone")} */}
          {numericfield("Phone", "phone", "text", true)}

          {field("Email", "email")}

          <div className="individual-tabs">
            <label>Department</label>
            {editMode ? (
              <select
                name="department"
                value={form.department}
                onChange={onChange}
              >
                <option value="">Select Department</option>
                {DEPTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="uneditable">
                {DEPTS.find((d) => d.value === form.department)?.label || "-"}
              </div>
            )}
          </div>

          {/* <div className="individual-tabs">
            <label>Client</label>
            {editMode ? (
              <select name="client" value={form.client} onChange={onChange}>
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option
                    key={c.id ?? c.client_id ?? c.pk}
                    value={c.id ?? c.client_id ?? c.pk}
                  >
                    {c.client_name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="uneditable">
                {clients.find(
                  (c) => (c.id ?? c.client_id ?? c.pk) === form.client
                )?.client_name || "-"}
              </div>
            )}
          </div> */}
        </div>

        {editMode && (
          <div className="form-buttons">
            <button type="submit" className="btn-save" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setEditMode(false);
                load();
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
      <ToastContainerComponent />
    </div>
  );
}
