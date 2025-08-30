// TinyDesignationInput.jsx
import { useMemo } from "react";

export default function TinyDesignationInput({
  name = "designation",
  value = "",
  designations = [], // [{id, designation}] or ["Manager", ...]
  onChange, // (e) => setFormData...
  onAddDesignation, // async (title) => created
  listId = "designation-list",
  placeholder = "Type a title…",
}) {
  const names = useMemo(
    () => designations.map((d) => (typeof d === "string" ? d : d.designation)),
    [designations]
  );

  const exactMatch = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    return q && names.some((n) => n.toLowerCase() === q);
  }, [names, value]);

  const add = async () => {
    const title = (value || "").trim();
    if (!title || exactMatch) return;
    const created = await onAddDesignation?.(title);
    // ensure parent gets the final value
    const finalVal = created?.designation || title;
    onChange?.({ target: { name, value: finalVal } });
  };

  return (
    <div className="individual-tabs">
      <label>Title</label>
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
