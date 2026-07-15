import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function LedgerCard({ eyebrow, value, sub }) {
  return (
    <div className="ledger-card">
      <div className="ledger-eyebrow">{eyebrow}</div>
      <div className="ledger-number">{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>{sub}</div>}
      <div className="ledger-rule" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ students: null, faculty: null, courses: null, enrollments: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const endpoints = ["/students/", "/faculty/", "/courses/", "/enrollments/"];
        const results = await Promise.allSettled(endpoints.map((e) => api.get(e, { params: { page_size: 1 } })));
        const [students, faculty, courses, enrollments] = results.map((r) =>
          r.status === "fulfilled" ? r.value.data.count ?? r.value.data.length ?? 0 : "—"
        );
        setCounts({ students, faculty, courses, enrollments });
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div>
      <h1 className="font-display fw-semibold mb-1" style={{ fontSize: 26 }}>
        Welcome back{user?.username ? `, ${user.username}` : ""}
      </h1>
      <p style={{ color: "var(--ink-soft)", fontSize: 14.5 }} className="mb-4">
        Here's what's happening across the registry today.
      </p>

      <div className="row g-3 mb-4">
        {user?.role === "ADMIN" && (
          <>
            <div className="col-6 col-lg-3">
              <LedgerCard eyebrow="Students" value={loading ? "…" : counts.students} sub="Enrolled total" />
            </div>
            <div className="col-6 col-lg-3">
              <LedgerCard eyebrow="Faculty" value={loading ? "…" : counts.faculty} sub="Active staff" />
            </div>
          </>
        )}
        <div className="col-6 col-lg-3">
          <LedgerCard eyebrow="Courses" value={loading ? "…" : counts.courses} sub="Offered" />
        </div>
        <div className="col-6 col-lg-3">
          <LedgerCard eyebrow="Enrollments" value={loading ? "…" : counts.enrollments} sub="Records on file" />
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Getting started</h2>
        </div>
        <div className="p-4" style={{ fontSize: 14.5, color: "var(--ink-soft)" }}>
          {user?.role === "ADMIN" && (
            <ul className="mb-0 ps-3">
              <li>Add departments, then students and faculty, from the sidebar.</li>
              <li>Create courses and assign faculty to them.</li>
              <li>Faculty can then mark attendance and enter grades for their courses.</li>
            </ul>
          )}
          {user?.role === "FACULTY" && (
            <ul className="mb-0 ps-3">
              <li>Open <strong>My Courses</strong> to see what you're teaching this term.</li>
              <li>Mark daily attendance from the <strong>Attendance</strong> tab.</li>
              <li>Record exam scores from the <strong>Grades</strong> tab.</li>
            </ul>
          )}
          {user?.role === "STUDENT" && (
            <ul className="mb-0 ps-3">
              <li>Check <strong>My Courses</strong> for your current enrollments.</li>
              <li>Review your attendance record and grades any time from the sidebar.</li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
