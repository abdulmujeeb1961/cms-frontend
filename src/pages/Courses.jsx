import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import { LuPlus, LuPencil, LuTrash2 } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import DepartmentField from "../components/DepartmentField";

const emptyForm = { name: "", code: "", department: "", credits: 3, faculty: "", semester: 1 };

export default function Courses() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const calls = [api.get("/courses/")];
      if (isAdmin) calls.push(api.get("/departments/"), api.get("/faculty/"));
      const results = await Promise.all(calls);
      setCourses(results[0].data.results ?? results[0].data);
      if (isAdmin) {
        setDepartments(results[1].data.results ?? results[1].data);
        setFacultyList(results[2].data.results ?? results[2].data);
      }
    } catch {
      setError("Couldn't load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name, code: c.code, department: c.department, credits: c.credits, faculty: c.faculty ?? "", semester: c.semester });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, faculty: form.faculty || null };
      if (editing) await api.patch(`/courses/${editing.id}/`, payload);
      else await api.post("/courses/", payload);
      setModalOpen(false);
      load();
    } catch {
      setError("Couldn't save this course. Check the code is unique.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c) => {
    if (!confirm(`Remove course ${c.code}?`)) return;
    await api.delete(`/courses/${c.id}/`);
    load();
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="font-display fw-semibold mb-1" style={{ fontSize: 24 }}>
            {isAdmin ? "Courses" : "My Courses"}
          </h1>
          <p className="mb-0" style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            {courses.length} course{courses.length !== 1 ? "s" : ""} offered
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-navy d-flex align-items-center gap-2" onClick={openCreate}>
            <LuPlus size={16} /> Add course
          </button>
        )}
      </div>

      <div className="panel">
        {loading ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>Loading…</div>
        ) : courses.length === 0 ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>No courses yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-cms mb-0">
              <thead>
                <tr>
                  <th>Code</th><th>Course</th><th>Department</th><th>Faculty</th><th>Credits</th><th>Sem</th>
                  {isAdmin && <th style={{ width: 90 }}></th>}
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="roll-mono">{c.code}</td>
                    <td>{c.name}</td>
                    <td>{c.department_name || "—"}</td>
                    <td>{c.faculty_name || "Unassigned"}</td>
                    <td>{c.credits}</td>
                    <td>{c.semester}</td>
                    {isAdmin && (
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm border-0" onClick={() => openEdit(c)}><LuPencil size={15} /></button>
                          <button className="btn btn-sm border-0 text-danger" onClick={() => handleDelete(c)}><LuTrash2 size={15} /></button>
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
          title={editing ? "Edit course" : "Add course"}
          onClose={() => setModalOpen(false)}
          footer={<>
            <button className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-navy" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </>}
        >
          <form onSubmit={handleSave}>
            {error && <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{error}</div>}
            <div className="mb-2">
              <div className="form-label-cms">Course name</div>
              <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <div className="form-label-cms">Code</div>
                <input className="form-control" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              </div>
              <div className="col-3">
                <div className="form-label-cms">Credits</div>
                <input type="number" className="form-control" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
              </div>
              <div className="col-3">
                <div className="form-label-cms">Sem</div>
                <input type="number" className="form-control" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
              </div>
            </div>
            <div className="mb-2">
              <DepartmentField
                value={form.department}
                onChange={(val) => setForm({ ...form, department: val })}
                departments={departments}
                onDepartmentsChange={setDepartments}
                required
              />
            </div>
            <div>
              <div className="form-label-cms">Faculty</div>
              <select className="form-select" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
                <option value="">Unassigned</option>
                {facultyList.map((f) => <option key={f.id} value={f.id}>{f.user.first_name} {f.user.last_name}</option>)}
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
