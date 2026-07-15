import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import { LuPlus, LuPencil, LuTrash2 } from "react-icons/lu";
import DepartmentField from "../components/DepartmentField";

const emptyForm = {
  user: { username: "", email: "", first_name: "", last_name: "", password: "" },
  employee_id: "",
  department: "",
  designation: "",
};

export default function Faculty() {
  const [list, setList] = useState([]);
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
      const [facRes, deptRes] = await Promise.all([api.get("/faculty/"), api.get("/departments/")]);
      setList(facRes.data.results ?? facRes.data);
      setDepartments(deptRes.data.results ?? deptRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (f) => {
    setEditing(f);
    setForm({
      user: { username: f.user.username, email: f.user.email, first_name: f.user.first_name, last_name: f.user.last_name, password: "" },
      employee_id: f.employee_id,
      department: f.department ?? "",
      designation: f.designation || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, department: form.department || null };
      if (editing && !payload.user.password) delete payload.user.password;
      if (editing) await api.patch(`/faculty/${editing.id}/`, payload);
      else await api.post("/faculty/", payload);
      setModalOpen(false);
      load();
    } catch {
      setError("Couldn't save this faculty member.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f) => {
    if (!confirm(`Remove ${f.user.first_name || f.user.username}?`)) return;
    await api.delete(`/faculty/${f.id}/`);
    load();
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="font-display fw-semibold mb-1" style={{ fontSize: 24 }}>Faculty</h1>
          <p className="mb-0" style={{ color: "var(--ink-soft)", fontSize: 14 }}>{list.length} staff on record</p>
        </div>
        <button className="btn btn-navy d-flex align-items-center gap-2" onClick={openCreate}>
          <LuPlus size={16} /> Add faculty
        </button>
      </div>

      <div className="panel">
        {loading ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>Loading…</div>
        ) : list.length === 0 ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>No faculty added yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-cms mb-0">
              <thead><tr><th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th style={{ width: 90 }}></th></tr></thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.id}>
                    <td className="roll-mono">{f.employee_id}</td>
                    <td>{f.user.first_name} {f.user.last_name}<div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{f.user.email}</div></td>
                    <td>{f.department_name || "—"}</td>
                    <td>{f.designation || "—"}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm border-0" onClick={() => openEdit(f)}><LuPencil size={15} /></button>
                        <button className="btn btn-sm border-0 text-danger" onClick={() => handleDelete(f)}><LuTrash2 size={15} /></button>
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
          title={editing ? "Edit faculty" : "Add faculty"}
          onClose={() => setModalOpen(false)}
          footer={<>
            <button className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-navy" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </>}
        >
          <form onSubmit={handleSave}>
            {error && <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{error}</div>}
            <div className="row g-2 mb-2">
              <div className="col-6">
                <div className="form-label-cms">First name</div>
                <input className="form-control" value={form.user.first_name}
                  onChange={(e) => setForm({ ...form, user: { ...form.user, first_name: e.target.value } })} required />
              </div>
              <div className="col-6">
                <div className="form-label-cms">Last name</div>
                <input className="form-control" value={form.user.last_name}
                  onChange={(e) => setForm({ ...form, user: { ...form.user, last_name: e.target.value } })} />
              </div>
            </div>
            <div className="mb-2">
              <div className="form-label-cms">Username</div>
              <input className="form-control" value={form.user.username}
                onChange={(e) => setForm({ ...form, user: { ...form.user, username: e.target.value } })} required />
            </div>
            <div className="mb-2">
              <div className="form-label-cms">Email</div>
              <input type="email" className="form-control" value={form.user.email}
                onChange={(e) => setForm({ ...form, user: { ...form.user, email: e.target.value } })} />
            </div>
            <div className="mb-2">
              <div className="form-label-cms">{editing ? "New password (optional)" : "Password"}</div>
              <input type="password" className="form-control" value={form.user.password}
                onChange={(e) => setForm({ ...form, user: { ...form.user, password: e.target.value } })}
                required={!editing} minLength={6} />
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <div className="form-label-cms">Employee ID</div>
                <input className="form-control" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required />
              </div>
              <div className="col-6">
                <div className="form-label-cms">Designation</div>
                <input className="form-control" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Professor" />
              </div>
            </div>
            <div>
              <DepartmentField
                value={form.department}
                onChange={(val) => setForm({ ...form, department: val })}
                departments={departments}
                onDepartmentsChange={setDepartments}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
