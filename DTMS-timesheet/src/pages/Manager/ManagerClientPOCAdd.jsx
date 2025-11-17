import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import config from "../../config";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const API = {
  POCS: `${config.apiBaseURL}/client-poc/`, // POST to create
  CLIENTS: `${config.apiBaseURL}/client/`, // for dropdown
};

const DEPTS = [
  { value: "bd", label: "Business development" },
  { value: "finance", label: "Finance" },
  { value: "tech", label: "Tech" },
];

export default function ManagerClientPOCAdd() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    poc_name: "",
    phone: "",
    email: "",
    department: "",
    client: "", // id
  });
  const [submitting, setSubmitting] = useState(false);

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const preset = searchParams.get("client");
    if (preset) setForm((p) => ({ ...p, client: preset }));
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(API.CLIENTS);
        const data = await res.json();
        setClients(data || []);
      } catch {
        setClients([]);
      }
    })();
  }, []);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.poc_name?.trim()) return showWarningToast("POC name is required");
    if (!form.client) return showWarningToast("Select a client");

    try {
      setSubmitting(true);
      const res = await fetch(API.POCS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      showSuccessToast("POC created");
      navigate(`/manager/detail/clients/view/${form.client}/`);
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to create POC");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-employee-wrapper">
      <h2 className="employee-title">Add Client POC</h2>
      <form className="add-employee-form" onSubmit={onSubmit}>
        <div className="tab-content">
          <div className="individual-tabs">
            <label>
              POC Name <span className="required-star">*</span>
            </label>
            <input
              name="poc_name"
              value={form.poc_name}
              onChange={onChange}
              placeholder="POC Name"
              required
            />
          </div>
          {/* <div className="individual-tabs">
            <label>Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              placeholder="Phone"
            />
          </div> */}
          <div className="individual-tabs">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone || ""}
              maxLength={15}
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9+-]/g, "");
                setForm((prev) => ({ ...prev, phone: value }));
              }}
              placeholder="Phone"
            />
          </div>

          <div className="individual-tabs">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="Email"
            />
          </div>
          <div className="individual-tabs">
            <label>Department</label>
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
          </div>
          {/* <div className="individual-tabs">
            <label>
              Client <span className="required-star">*</span>
            </label>
            <select
              name="client"
              value={form.client}
              onChange={onChange}
              required
            >
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
          </div> */}
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-green" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="btn-red"
            onClick={() =>
              navigate(`/manager/detail/clients/view/${form.client}/`)
            }
          >
            Cancel
          </button>
        </div>
      </form>
      <ToastContainerComponent />
    </div>
  );
}
