import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import config from "../../config";

import {
  showErrorToast,
  showInfoToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const CLIENTS_URL = `${config.apiBaseURL}/client/`; // GET list, POST create

export default function ManagerClientList() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeout = useRef(null);

  const fetchClients = async () => {
    try {
      const res = await fetch(CLIENTS_URL);
      if (!res.ok) throw new Error(`Failed to load clients: ${res.status}`);
      const data = await res.json();
      setClients(data);
      setFiltered(data);
      setVisible(10);
      setHasMore(data.length > 10);
    } catch (e) {
      console.error(e);
      showErrorToast("Could not fetch clients");
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const q = search.toLowerCase();
      const f = clients.filter((c) => {
        const name = c.client_name?.toLowerCase() || "";
        const gst = c.gst_number?.toLowerCase() || "";
        const addr = c.client_address?.toLowerCase() || "";
        return name.includes(q) || gst.includes(q) || addr.includes(q);
      });
      setFiltered(f);
      setVisible(10);
      setHasMore(f.length > 10);
      if (search && f.length === 0) showInfoToast("No clients found");
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search, clients]);

  const handleAdd = () => navigate(`add`);
  const handleEdit = (id) => navigate(`view/${id}`);

  return (
    <div className="employee-table-wrapper">
      <div className="user-header">
        <h2 className="employee-title">Clients</h2>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search by name, GST, or address"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
        </div>
        <button className="add-user-btn" onClick={handleAdd}>
          Add Client
        </button>
      </div>

      <div
        className="table-wrapper"
        style={{ maxHeight: "400px" }}
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
          if (
            scrollTop + clientHeight >= scrollHeight - 10 &&
            !loadingMore &&
            hasMore
          ) {
            setLoadingMore(true);
            setTimeout(() => {
              const next = visible + 10;
              if (next >= filtered.length) {
                setVisible(filtered.length);
                setHasMore(false);
              } else {
                setVisible(next);
              }
              setLoadingMore(false);
            }, 800);
          }
        }}
      >
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>GST</th>
              <th>Address</th>
              {/* <th style={{ width: 80 }}>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, visible).map((c) => (
              <tr key={c.id ?? c.client_id ?? c.pk}>
                <td
                  onClick={() => handleEdit(c.id ?? c.client_id ?? c.pk)}
                  style={{ cursor: "pointer", textDecoration: "underline" }}
                >
                  {c.client_name}
                </td>
                <td>{c.gst_number || "-"}</td>
                <td style={{ whiteSpace: "pre-wrap" }}>
                  {c.client_address || "-"}
                </td>
                {/* <td>
                  <button
                    className="icon-btn"
                    title="Edit"
                    onClick={() => handleEdit(c.id ?? c.client_id ?? c.pk)}
                  >
                    <FaEdit />
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {loadingMore && <div className="loading-message">Loading…</div>}
        {!hasMore && <div className="no-message">No more data</div>}
      </div>

      <ToastContainerComponent />
    </div>
  );
}
