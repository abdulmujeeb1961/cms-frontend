import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import api from "../api/axios";
import Modal from "./Modal";

/**
 * A department <select> with an inline "+" button to create a new department
 * on the fly, without leaving the current form. Newly created departments are
 * appended to the shared `departments` list and auto-selected.
 */
export default function DepartmentField({ value, onChange, departments, onDepartmentsChange, required = false, label = "Department" }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const openCreate = () => { setForm({ name: "", code: "" }); setError(""); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data: newDept } = await api.post("/departments/", form);
      onDepartmentsChange([...departments, newDept]);
      onChange(String(newDept.id));
      setModalOpen(false);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.code?.[0] || data?.name?.[0] || "Couldn't create this department. Code must be unique.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between">
        <div className="form-label-cms mb-0">{label}</div>
        <button
          type="button"
          className="btn btn-sm p-0 border-0 d-flex align-items-center gap-1"
          style={{ fontSize: 12.5, color: "var(--navy)", fontWeight: 600 }}
          onClick={openCreate}
        >
          <LuPlus size={13} /> New department
        </button>
      </div>
      <select className="form-select mt-1" value={value} onChange={(e) => onChange(e.target.value)} required={required}>
        <option value="">{required ? "Select…" : "— None —"}</option>
        {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>

      {modalOpen && (
        <Modal
          title="New department"
          onClose={() => setModalOpen(false)}
          footer={<>
            <button className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-navy" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </>}
        >
          <form onSubmit={handleSave}>
            {error && <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{error}</div>}
            <div className="mb-2">
              <div className="form-label-cms">Name</div>
              <input className="form-control" placeholder="e.g. Computer Science" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div>
              <div className="form-label-cms">Code</div>
              <input className="form-control" placeholder="e.g. CS" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
