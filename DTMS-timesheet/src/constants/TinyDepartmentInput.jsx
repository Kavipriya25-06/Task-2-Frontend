// TinyDepartmentInput.jsx
import { useMemo } from "react";

export default function TinyDepartmentInput({
  name = "Department",
  value = "",
  Departments = [], // [{id, Department}] or ["Manager", ...]
  onChange, // (e) => setFormData...
  onAddDepartment, // async (title) => created
  listId = "Department-list",
  placeholder = "Type a title…",
}) {
  const names = useMemo(
    () => Departments.map((d) => (typeof d === "string" ? d : d.Department)),
    [Departments]
  );

  const exactMatch = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    return q && names.some((n) => n.toLowerCase() === q);
  }, [names, value]);

  const add = async () => {
    const title = (value || "").trim();
    if (!title || exactMatch) return;
    const created = await onAddDepartment?.(title);
    // ensure parent gets the final value
    const finalVal = created?.Department || title;
    onChange?.({ target: { name, value: finalVal } });
  };

  return (
    <div className="individual-tabs">
      <label>Department</label>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          list={listId}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          autoComplete="off"
          style={{ flex: 1 }}
        />
        {!exactMatch && value.trim() && (
          <button type="button" onClick={add} title="Add new">
            +
          </button>
        )}
      </div>

      <datalist id={listId}>
        {names.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </div>
  );
}
