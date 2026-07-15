import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import { LuPlus, LuPencil, LuTrash2 } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const todayISO = () => new Date().toISOString().slice(0, 10);
const emptyForm = { student: "", course: "", date: todayISO(), status: "PRESENT" };

const STATUS_STYLE = {
  PRESENT: { bg: "#E1F0E5", color: "#2F7A4E" },
  ABSENT: { bg: "#FBE2E1", color: "#B5342B" },
  LATE: { bg: "#FBEFDC", color: "#A9722C" },
};

export default function Attendance() {
  const { user } = useAuth();
  const canMark = user?.role === "ADMIN" || user?.role === "FACULTY";

  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const calls = [api.get("/attendance/")];
      if (canMark) calls.push(api.get("/students/"), api.get("/courses/"));
      const results = await Promise.all(calls);
      setRecords(results[0].data.results ?? results[0].data);
      if (canMark) {
        setStudents(results[1].data.results ?? results[1].data);
        setCourses(results[2].data.results ?? results[2].data);
      }
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

  const openEdit = (r) => {
    setEditing(r);
    setForm({ student: r.student, course: r.course, date: r.date, status: r.status });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await api.patch(`/attendance/${editing.id}/`, form);
      } else {
        await api.post("/attendance/", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || "Couldn't save this record (maybe already marked for that date).");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    if (!confirm(`Delete ${r.student_name}'s ${r.status.toLowerCase()} record for ${r.course_name} on ${r.date}?`)) return;
    await api.delete(`/attendance/${r.id}/`);
    load();
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="font-display fw-semibold mb-1" style={{ fontSize: 24 }}>
            {canMark ? "Attendance" : "My Attendance"}
          </h1>
          <p className="mb-0" style={{ color: "var(--ink-soft)", fontSize: 14 }}>{records.length} records</p>
        </div>
        {canMark && (
          <button className="btn btn-navy d-flex align-items-center gap-2" onClick={openCreate}>
            <LuPlus size={16} /> Mark attendance
          </button>
        )}
      </div>

      <div className="panel">
        {loading ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>Loading…</div>
        ) : records.length === 0 ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>No attendance records yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-cms mb-0">
              <thead>
                <tr>
                  <th>Date</th>{canMark && <th>Student</th>}<th>Course</th><th>Status</th>
                  {canMark && <th style={{ width: 90 }}></th>}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const style = STATUS_STYLE[r.status];
                  return (
                    <tr key={r.id}>
                      <td className="roll-mono">{r.date}</td>
                      {canMark && <td>{r.student_name}</td>}
                      <td>{r.course_name}</td>
                      <td>
                        <span className="badge-role" style={{ background: style.bg, color: style.color }}>{r.status}</span>
                      </td>
                      {canMark && (
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm border-0" onClick={() => openEdit(r)} aria-label="Edit"><LuPencil size={15} /></button>
                            <button className="btn btn-sm border-0 text-danger" onClick={() => handleDelete(r)} aria-label="Delete"><LuTrash2 size={15} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editing ? "Edit attendance" : "Mark attendance"}
          onClose={() => setModalOpen(false)}
          footer={<>
            <button className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-navy" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </>}
        >
          <form onSubmit={handleSave}>
            {error && <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{error}</div>}
            <div className="mb-2">
              <div className="form-label-cms">Student</div>
              <select
                className="form-select"
                value={form.student}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, student: e.target.value })}
                required
              >
                <option value="">Select…</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.roll_number} — {s.user.first_name} {s.user.last_name}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <div className="form-label-cms">Course</div>
              <select
                className="form-select"
                value={form.course}
                disabled={!!editing}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                required
              >
                <option value="">Select…</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <div className="form-label-cms">Date</div>
                <input
                  type="date"
                  className="form-control"
                  value={form.date}
                  disabled={!!editing}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <div className="form-label-cms">Status</div>
                <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
