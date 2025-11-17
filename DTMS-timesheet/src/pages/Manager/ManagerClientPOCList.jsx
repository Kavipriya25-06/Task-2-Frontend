import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import config from "../../config";

import {
  showErrorToast,
  showInfoToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const POC_URL = `${config.apiBaseURL}/client-and-poc/`; // GET list, POST create
const DEPT_LABEL = {
  bd: "Business development",
  finance: "Finance",
  tech: "Tech",
};

export default function ManagerClientPOCList() {
  const navigate = useNavigate();
  const [pocs, setPocs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const searchTimeout = useRef(null);

  const fetchPocs = async () => {
    try {
      const res = await fetch(POC_URL);
      if (!res.ok) throw new Error(`Failed to load POCs: ${res.status}`);
      const data = await res.json();
      setPocs(data);
      setFiltered(data);
      setVisible(10);
      setHasMore(data.length > 10);
    } catch (e) {
      console.error(e);
      showErrorToast("Could not fetch client POCs");
    }
  };

  useEffect(() => {
    fetchPocs();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      const q = search.toLowerCase();
      const f = pocs.filter((p) => {
        const name = p.poc_name?.toLowerCase() || "";
        const phone = p.phone?.toLowerCase() || "";
        const email = p.email?.toLowerCase() || "";
        const client =
          (typeof p.client === "object"
            ? p.client?.client_name
            : p.client_name || p.client || ""
          )?.toLowerCase?.() || "";
        const dept = (
          DEPT_LABEL[p.department] ||
          p.department ||
          ""
        ).toLowerCase();
        return (
          name.includes(q) ||
          phone.includes(q) ||
          email.includes(q) ||
          client.includes(q) ||
          dept.includes(q)
        );
      });
      setFiltered(f);
      setVisible(10);
      setHasMore(f.length > 10);
      if (search && f.length === 0) showInfoToast("No POCs found");
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search, pocs]);

  const handleAdd = () => navigate(`add`);
  const handleEdit = (id) => navigate(`edit/${id}`);

  return (
    <div className="employee-table-wrapper">
      <div className="user-header">
        <h2 className="employee-title">Client Points of Contact</h2>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search by name, phone, email, client, or department"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-bar"
          />
        </div>
        <button className="add-user-btn" onClick={handleAdd}>
          Add POC
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
              <th>POC Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Department</th>
              <th>Client</th>
              <th style={{ width: 80 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, visible).map((p) => {
              const rowId = p.id ?? p.clientpoc_id ?? p.pk;
              const clientLabel =
                (typeof p.client === "object" && p.client?.client_name) ||
                p.client_name ||
                p.client ||
                "-";
              return (
                <tr key={rowId}>
                  <td
                    onClick={() => handleEdit(rowId)}
                    style={{ cursor: "pointer", textDecoration: "underline" }}
                  >
                    {p.poc_name || "-"}
                  </td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.email || "-"}</td>
                  <td>{DEPT_LABEL[p.department] || p.department || "-"}</td>
                  <td>{clientLabel}</td>
                  <td>
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => handleEdit(rowId)}
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loadingMore && <div className="loading-message">Loading…</div>}
        {!hasMore && <div className="no-message">No more data</div>}
      </div>

      <ToastContainerComponent />
    </div>
  );
}
