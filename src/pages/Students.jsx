import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import { LuPlus, LuPencil, LuTrash2, LuSearch } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import DepartmentField from "../components/DepartmentField";

const emptyForm = {
  user: { username: "", email: "", first_name: "", last_name: "", password: "" },
  roll_number: "",
  department: "",
  batch_year: new Date().getFullYear(),
};

export default function Students() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async (q = "") => {
    setLoading(true);
    try {
      const [studentsRes, deptRes] = await Promise.all([
        api.get("/students/", { params: q ? { search: q } : {} }),
        api.get("/departments/"),
      ]);
      setStudents(studentsRes.data.results ?? studentsRes.data);
      setDepartments(deptRes.data.results ?? deptRes.data);
    } catch {
      setError("Couldn't load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      user: { username: s.user.username, email: s.user.email, first_name: s.user.first_name, last_name: s.user.last_name, password: "" },
      roll_number: s.roll_number,
      department: s.department ?? "",
      batch_year: s.batch_year,
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
      if (editing) {
        await api.patch(`/students/${editing.id}/`, payload);
      } else {
        await api.post("/students/", payload);
      }
      setModalOpen(false);
      load(search);
    } catch (err) {
      const data = err.response?.data;
      setError(typeof data === "object" ? JSON.stringify(data) : "Couldn't save this student.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!confirm(`Remove ${s.user.first_name || s.user.username} from the registry?`)) return;
    await api.delete(`/students/${s.id}/`);
    load(search);
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="font-display fw-semibold mb-1" style={{ fontSize: 24 }}>Students</h1>
          <p className="mb-0" style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            {students.length} record{students.length !== 1 ? "s" : ""} on file
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-navy d-flex align-items-center gap-2" onClick={openCreate}>
            <LuPlus size={16} /> Add student
          </button>
        )}
      </div>

      <div className="panel">
        <div className="panel-header">
          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text bg-white border-end-0"><LuSearch size={15} /></span>
            <input
              className="form-control border-start-0"
              placeholder="Search by name or roll no."
              value={search}
              onChange={(e) => { setSearch(e.target.value); load(e.target.value); }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>Loading…</div>
        ) : students.length === 0 ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>
            No students found. {isAdmin && "Add your first student to get started."}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-cms mb-0">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Batch</th>
                  {isAdmin && <th style={{ width: 90 }}></th>}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="roll-mono">{s.roll_number}</td>
                    <td>{s.user.first_name} {s.user.last_name || ""}<div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{s.user.email}</div></td>
                    <td>{s.department_name || "—"}</td>
                    <td>{s.batch_year}</td>
                    {isAdmin && (
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm border-0" onClick={() => openEdit(s)} aria-label="Edit"><LuPencil size={15} /></button>
                          <button className="btn btn-sm border-0 text-danger" onClick={() => handleDelete(s)} aria-label="Delete"><LuTrash2 size={15} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editing ? "Edit student" : "Add student"}
          onClose={() => setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="btn btn-navy" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          }
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
              <div className="form-label-cms">{editing ? "New password (leave blank to keep current)" : "Password"}</div>
              <input type="password" className="form-control" value={form.user.password}
                onChange={(e) => setForm({ ...form, user: { ...form.user, password: e.target.value } })}
                required={!editing} minLength={6} />
            </div>

            <div className="row g-2">
              <div className="col-7">
                <div className="form-label-cms">Roll number</div>
                <input className="form-control" value={form.roll_number}
                  onChange={(e) => setForm({ ...form, roll_number: e.target.value })} required />
              </div>
              <div className="col-5">
                <div className="form-label-cms">Batch year</div>
                <input type="number" className="form-control" value={form.batch_year}
                  onChange={(e) => setForm({ ...form, batch_year: e.target.value })} required />
              </div>
            </div>

            <div className="mt-2">
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
