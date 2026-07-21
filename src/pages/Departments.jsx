import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import { LuPlus, LuPencil, LuTrash2 } from "react-icons/lu";

const emptyForm = { name: "", code: "" };

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/departments/");
      setDepartments(data.results ?? data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, code: d.code }); setError(""); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) await api.patch(`/departments/${editing.id}/`, form);
      else await api.post("/departments/", form);
      setModalOpen(false);
      load();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.code?.[0] || data?.name?.[0] || "Couldn't save this department. Code must be unique.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d) => {
    if (!confirm(`Delete the "${d.name}" department? This may affect students, faculty, and courses assigned to it.`)) return;
    try {
      await api.delete(`/departments/${d.id}/`);
      load();
    } catch {
      alert("Couldn't delete this department — it may still have students, faculty, or courses assigned to it.");
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="font-display fw-semibold mb-1" style={{ fontSize: 24 }}>Departments</h1>
          <p className="mb-0" style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            {departments.length} department{departments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-navy d-flex align-items-center gap-2" onClick={openCreate}>
          <LuPlus size={16} /> Add department
        </button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>Loading…</div>
        ) : departments.length === 0 ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>
            No departments yet. Add your first one to get started.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-cms mb-0">
              <thead><tr><th>Code</th><th>Name</th><th style={{ width: 90 }}></th></tr></thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td className="roll-mono">{d.code}</td>
                    <td>{d.name}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm border-0" onClick={() => openEdit(d)} aria-label="Edit"><LuPencil size={15} /></button>
                        <button className="btn btn-sm border-0 text-danger" onClick={() => handleDelete(d)} aria-label="Delete"><LuTrash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editing ? "Edit department" : "Add department"}
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
