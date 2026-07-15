import { useEffect, useState } from "react";
import api from "../api/axios";
import Modal from "../components/Modal";
import { LuPlus, LuClipboardList, LuPencil, LuTrash2 } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const emptyGradeForm = { exam: "", student: "", marks_obtained: "", remarks: "" };
const emptyExamForm = { course: "", name: "", date: new Date().toISOString().slice(0, 10), max_marks: 100 };

export default function Grades() {
  const { user } = useAuth();
  const canEnter = user?.role === "ADMIN" || user?.role === "FACULTY";

  const [grades, setGrades] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeForm, setGradeForm] = useState(emptyGradeForm);
  const [gradeError, setGradeError] = useState("");
  const [savingGrade, setSavingGrade] = useState(false);

  const [examModalOpen, setExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState(emptyExamForm);
  const [examError, setExamError] = useState("");
  const [savingExam, setSavingExam] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const calls = [api.get("/grades/")];
      if (canEnter) calls.push(api.get("/exams/"), api.get("/students/"), api.get("/courses/"));
      const results = await Promise.all(calls);
      setGrades(results[0].data.results ?? results[0].data);
      if (canEnter) {
        setExams(results[1].data.results ?? results[1].data);
        setStudents(results[2].data.results ?? results[2].data);
        setCourses(results[3].data.results ?? results[3].data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // The exam currently selected in the grade form — used to enforce the max-marks cap client-side.
  const selectedExam = exams.find((ex) => String(ex.id) === String(gradeForm.exam));

  const openCreateGrade = () => {
    setEditingGrade(null);
    setGradeForm(emptyGradeForm);
    setGradeError("");
    setGradeModalOpen(true);
  };

  const openEditGrade = (g) => {
    setEditingGrade(g);
    setGradeForm({ exam: g.exam, student: g.student, marks_obtained: g.marks_obtained, remarks: g.remarks || "" });
    setGradeError("");
    setGradeModalOpen(true);
  };

  const handleMarksChange = (val) => {
    setGradeForm({ ...gradeForm, marks_obtained: val });
    if (selectedExam && val !== "" && Number(val) > selectedExam.max_marks) {
      setGradeError(`Marks can't exceed this exam's maximum of ${selectedExam.max_marks}.`);
    } else {
      setGradeError("");
    }
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();

    if (selectedExam && Number(gradeForm.marks_obtained) > selectedExam.max_marks) {
      setGradeError(`Marks can't exceed this exam's maximum of ${selectedExam.max_marks}.`);
      return;
    }
    if (Number(gradeForm.marks_obtained) < 0) {
      setGradeError("Marks can't be negative.");
      return;
    }

    setSavingGrade(true);
    setGradeError("");
    try {
      if (editingGrade) {
        await api.patch(`/grades/${editingGrade.id}/`, gradeForm);
      } else {
        await api.post("/grades/", gradeForm);
      }
      setGradeModalOpen(false);
      load();
    } catch (err) {
      const data = err.response?.data;
      setGradeError(
        data?.marks_obtained?.[0] ||
        data?.non_field_errors?.[0] ||
        "Couldn't save this grade (maybe already entered for that exam)."
      );
    } finally {
      setSavingGrade(false);
    }
  };

  const handleDeleteGrade = async (g) => {
    if (!confirm(`Delete ${g.student_name}'s grade for ${g.exam_name}?`)) return;
    await api.delete(`/grades/${g.id}/`);
    load();
  };

  const openCreateExam = () => { setExamForm(emptyExamForm); setExamError(""); setExamModalOpen(true); };

  const handleSaveExam = async (e) => {
    e.preventDefault();
    setSavingExam(true);
    setExamError("");
    try {
      const { data: newExam } = await api.post("/exams/", examForm);
      setExams((prev) => [...prev, newExam]);
      setExamModalOpen(false);
      setEditingGrade(null);
      setGradeForm({ ...emptyGradeForm, exam: newExam.id });
      setGradeError("");
      setGradeModalOpen(true);
    } catch {
      setExamError("Couldn't create this exam. Check all fields are filled in.");
    } finally {
      setSavingExam(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h1 className="font-display fw-semibold mb-1" style={{ fontSize: 24 }}>
            {canEnter ? "Grades" : "My Grades"}
          </h1>
          <p className="mb-0" style={{ color: "var(--ink-soft)", fontSize: 14 }}>{grades.length} entries</p>
        </div>
        {canEnter && (
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary d-flex align-items-center gap-2" onClick={openCreateExam}>
              <LuClipboardList size={16} /> Add exam
            </button>
            <button
              className="btn btn-navy d-flex align-items-center gap-2"
              onClick={openCreateGrade}
              disabled={exams.length === 0}
              title={exams.length === 0 ? "Add an exam first" : ""}
            >
              <LuPlus size={16} /> Enter grade
            </button>
          </div>
        )}
      </div>

      {canEnter && exams.length === 0 && !loading && (
        <div className="alert alert-warning py-2 px-3 mb-3" style={{ fontSize: 13.5 }}>
          No exams yet — click <strong>Add exam</strong> first, then you can enter grades for it.
        </div>
      )}

      <div className="panel">
        {loading ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>Loading…</div>
        ) : grades.length === 0 ? (
          <div className="p-4 text-center" style={{ color: "var(--ink-soft)" }}>No grades entered yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-cms mb-0">
              <thead>
                <tr>
                  <th>Exam</th>{canEnter && <th>Student</th>}<th>Marks</th><th>Remarks</th>
                  {canEnter && <th style={{ width: 90 }}></th>}
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id}>
                    <td>{g.exam_name}</td>
                    {canEnter && <td>{g.student_name}</td>}
                    <td className="roll-mono">{g.marks_obtained} / {g.max_marks}</td>
                    <td style={{ color: "var(--ink-soft)" }}>{g.remarks || "—"}</td>
                    {canEnter && (
                      <td>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm border-0" onClick={() => openEditGrade(g)} aria-label="Edit"><LuPencil size={15} /></button>
                          <button className="btn btn-sm border-0 text-danger" onClick={() => handleDeleteGrade(g)} aria-label="Delete"><LuTrash2 size={15} /></button>
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

      {examModalOpen && (
        <Modal
          title="Add exam"
          onClose={() => setExamModalOpen(false)}
          footer={<>
            <button className="btn btn-outline-secondary" onClick={() => setExamModalOpen(false)}>Cancel</button>
            <button className="btn btn-navy" onClick={handleSaveExam} disabled={savingExam}>{savingExam ? "Saving…" : "Save"}</button>
          </>}
        >
          <form onSubmit={handleSaveExam}>
            {examError && <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{examError}</div>}
            <div className="mb-2">
              <div className="form-label-cms">Course</div>
              <select className="form-select" value={examForm.course} onChange={(e) => setExamForm({ ...examForm, course: e.target.value })} required>
                <option value="">Select…</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <div className="form-label-cms">Exam name</div>
              <input className="form-control" placeholder="e.g. Midterm, Final" value={examForm.name}
                onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} required />
            </div>
            <div className="row g-2">
              <div className="col-6">
                <div className="form-label-cms">Date</div>
                <input type="date" className="form-control" value={examForm.date}
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} required />
              </div>
              <div className="col-6">
                <div className="form-label-cms">Max marks</div>
                <input type="number" min="1" className="form-control" value={examForm.max_marks}
                  onChange={(e) => setExamForm({ ...examForm, max_marks: e.target.value })} required />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {gradeModalOpen && (
        <Modal
          title={editingGrade ? "Edit grade" : "Enter grade"}
          onClose={() => setGradeModalOpen(false)}
          footer={<>
            <button className="btn btn-outline-secondary" onClick={() => setGradeModalOpen(false)}>Cancel</button>
            <button className="btn btn-navy" onClick={handleSaveGrade} disabled={savingGrade || !!gradeError}>
              {savingGrade ? "Saving…" : "Save"}
            </button>
          </>}
        >
          <form onSubmit={handleSaveGrade}>
            {gradeError && <div className="alert alert-danger py-2" style={{ fontSize: 13 }}>{gradeError}</div>}
            <div className="mb-2">
              <div className="form-label-cms">Exam</div>
              <select
                className="form-select"
                value={gradeForm.exam}
                disabled={!!editingGrade}
                onChange={(e) => { setGradeForm({ ...gradeForm, exam: e.target.value }); setGradeError(""); }}
                required
              >
                <option value="">Select…</option>
                {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.course_name} — {ex.name} (max {ex.max_marks})</option>)}
              </select>
            </div>
            <div className="mb-2">
              <div className="form-label-cms">Student</div>
              <select
                className="form-select"
                value={gradeForm.student}
                disabled={!!editingGrade}
                onChange={(e) => setGradeForm({ ...gradeForm, student: e.target.value })}
                required
              >
                <option value="">Select…</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.roll_number} — {s.user.first_name} {s.user.last_name}</option>)}
              </select>
            </div>
            <div className="mb-2">
              <div className="form-label-cms">
                Marks obtained {selectedExam ? `(out of ${selectedExam.max_marks})` : ""}
              </div>
              <input
                type="number"
                step="0.5"
                min="0"
                max={selectedExam?.max_marks}
                className="form-control"
                value={gradeForm.marks_obtained}
                onChange={(e) => handleMarksChange(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="form-label-cms">Remarks (optional)</div>
              <input className="form-control" value={gradeForm.remarks} onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })} />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
