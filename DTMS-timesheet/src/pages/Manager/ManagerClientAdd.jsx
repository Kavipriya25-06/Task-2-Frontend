import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import config from "../../config";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const API = {
  CLIENTS: `${config.apiBaseURL}/client/`, // POST to create
};

export default function ManagerClientAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    client_name: "",
    client_address: "",
    gst_number: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.client_name?.trim())
      return showWarningToast("Client name is required");

    try {
      setSubmitting(true);
      const res = await fetch(API.CLIENTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      showSuccessToast("Client created");
      navigate("/manager/detail/clients");
    } catch (err) {
      console.error(err);
      showErrorToast("Failed to create client");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-employee-wrapper">
      <h2 className="employee-title">Add Client</h2>
      <form className="add-employee-form" onSubmit={onSubmit}>
        <div className="tab-content">
          <div className="individual-tabs">
            <label>
              Client Name <span className="required-star">*</span>
            </label>
            <input
              name="client_name"
              value={form.client_name}
              onChange={onChange}
              placeholder="Client Name"
              required
            />
          </div>
          <div className="individual-tabs">
            <label>GST Number</label>
            <input
              name="gst_number"
              value={form.gst_number}
              onChange={onChange}
              placeholder="GST Number"
            />
          </div>
          <div className="individual-tabs">
            <label>Address</label>
            <textarea
              name="client_address"
              value={form.client_address}
              onChange={onChange}
              placeholder="Client Address"
            />
          </div>
        </div>

        <div className="form-buttons">
          <button type="submit" className="btn-green" disabled={submitting}>
            {submitting ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="btn-red"
            onClick={() => navigate("/manager/detail/clients")}
          >
            Cancel
          </button>
        </div>
      </form>
      <ToastContainerComponent />
    </div>
  );
}
