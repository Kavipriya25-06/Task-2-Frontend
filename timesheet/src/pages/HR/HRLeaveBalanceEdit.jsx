import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import ExcelJS from "exceljs";
import { FaEdit } from "react-icons/fa";
import { saveAs } from "file-saver";
import config from "../../config";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  ToastContainerComponent,
} from "../../constants/Toastify";

const HRLeaveBalanceEdit = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [editingRow, setEditingRow] = useState(null);
  const [tempRow, setTempRow] = useState({});
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [year]);

  const fetchLeaves = () => {
    setLoading(true);
    fetch(`${config.apiBaseURL}/leaves-available-report/?year=${year}`)
      .then((res) => res.json())
      .then((json) => {
        setLeaveData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Leave fetch error:", err);
        setLoading(false);
      });
  };

  const handleEdit = (index) => {
    setEditingRow(index);
    setTempRow({ ...leaveData[index] });
  };

  const handleCancel = () => {
    setEditingRow(null);
    setTempRow({});
  };

  const handleChange = (field, value) => {
    setTempRow({ ...tempRow, [field]: value });
  };

  const handleSave = async (leaveId) => {
    setIsSending(true);
    try {
      const patchData = {
        casual_leave: tempRow.casual_leave || 0,
        sick_leave: tempRow.sick_leave || 0,
        earned_leave: tempRow.earned_leave || 0,
        comp_off: tempRow.comp_off || 0,
        lop: tempRow.lop || 0,
      };

      await fetch(`${config.apiBaseURL}/leaves-available/${leaveId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchData),
      });

      const updated = [...leaveData];
      updated[editingRow] = { ...tempRow };
      setLeaveData(updated);
      showSuccessToast("Leave balance updated successfully");
      setEditingRow(null);
    } catch (err) {
      console.error("Save error:", err);
      showErrorToast("Error updating leave balance");
    } finally {
      setIsSending(false);
    }
    // fetchLeaves();
  };

  return (
    <div className="leaves-container">
      <div className="leaves-balance-container">
        <div className="user-header">
          <h3>Leave Balance</h3>
          <div style={{ margin: "10px 0", textAlign: "center" }}>
            <input
              type="text"
              placeholder="Search employee by name or code..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="search-bar"
              style={{
                width: "300px",
                fontSize: "14px",
                height: "30px",
              }}
            />
          </div>
          <div></div>
        </div>
        {loading ? (
          <div style={{ padding: 20 }}>Loading leave data...</div>
        ) : leaveData.length === 0 ? (
          <div style={{ padding: 20 }}>No leave records found.</div>
        ) : (
          <table className="leaves-table">
            <thead>
              <tr>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>DOJ</th>
                <th>Present Status</th>
                <th style={{ width: 60 }}>CL</th>
                <th style={{ width: 60 }}>SL</th>
                <th style={{ width: 60 }}>EL</th>
                <th style={{ width: 60 }}>Comp-off</th>
                <th style={{ width: 60 }}>LOP</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveData
                .filter((l) => {
                  const search = employeeSearch.toLowerCase();
                  const name = l.employee?.employee_name?.toLowerCase() || "";
                  const code = l.employee?.employee_code?.toLowerCase() || "";

                  return name.includes(search) || code.includes(search);
                })
                .map((l, index) => {
                  const isEditing = index === editingRow;
                  const safeParse = (value) => parseFloat(value || 0);
                  const total =
                    safeParse(
                      isEditing ? tempRow.casual_leave : l.casual_leave
                    ) +
                    safeParse(isEditing ? tempRow.sick_leave : l.sick_leave) +
                    safeParse(
                      isEditing ? tempRow.earned_leave : l.earned_leave
                    ) +
                    safeParse(isEditing ? tempRow.comp_off : l.comp_off);

                  return (
                    <tr key={l.leave_avail_id}>
                      <td>{l.employee.employee_code}</td>
                      <td>{l.employee.employee_name}</td>
                      <td>
                        {new Date(l.employee.doj).toLocaleDateString("en-GB")}
                      </td>
                      <td>{l.employee.status}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempRow.casual_leave ?? 0}
                            onChange={(e) =>
                              handleChange("casual_leave", e.target.value)
                            }
                          />
                        ) : (
                          parseFloat(l.casual_leave || 0)
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempRow.sick_leave ?? 0}
                            onChange={(e) =>
                              handleChange("sick_leave", e.target.value)
                            }
                          />
                        ) : (
                          parseFloat(l.sick_leave || 0)
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempRow.earned_leave ?? 0}
                            onChange={(e) =>
                              handleChange("earned_leave", e.target.value)
                            }
                          />
                        ) : (
                          parseFloat(l.earned_leave || 0)
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={tempRow.comp_off ?? 0}
                            onChange={(e) =>
                              handleChange("comp_off", e.target.value)
                            }
                          />
                        ) : (
                          parseFloat(l.comp_off || 0)
                        )}
                      </td>
                      <td>{parseFloat(l.lop || 0)}</td>
                      <td>{Math.max(0, total)}</td>
                      <td>
                        {isEditing ? (
                          <>
                            <img
                              src="/approve.png"
                              alt="save"
                              className="leavebutton"
                              onClick={() =>
                                !isSending && handleSave(l.leave_avail_id)
                              }
                              disabled={isSending}
                            />
                            <img
                              src="/reject.png"
                              alt="cancel"
                              className="leavebutton"
                              onClick={handleCancel}
                              disabled={isSending}
                            />
                          </>
                        ) : (
                          <button
                            type="edit"
                            onClick={() => handleEdit(index)}
                            className="btn-leave"
                            title="Edit"
                          >
                            <FaEdit className="edit-icon" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      <ToastContainerComponent />
    </div>
  );
};

export default HRLeaveBalanceEdit;
