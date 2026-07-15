import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      const dest = location.state?.from?.pathname || "/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Incorrect username or password."
          : "Couldn't sign in. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-visual d-none d-md-flex">
        <div className="d-flex align-items-center gap-2">
          <div className="brand-mark">M</div>
          <div>
            <div className="brand-name">Meridian</div>
            <div className="brand-sub">College Portal</div>
          </div>
        </div>
        <div>
          <h1 className="font-display fw-semibold" style={{ fontSize: 34, lineHeight: 1.2, maxWidth: 420 }}>
            One record for every student, course, and grade.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", maxWidth: 380, fontSize: 14.5 }}>
            Admins manage the registry, faculty track attendance and grades,
            students see their own record — all in one place.
          </p>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Est. registry system — v1.0
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="d-md-none d-flex align-items-center gap-2 mb-4">
            <div className="brand-mark">M</div>
            <div>
              <div className="brand-name" style={{ color: "var(--ink)" }}>Meridian</div>
              <div className="brand-sub" style={{ color: "var(--ink-soft)" }}>College Portal</div>
            </div>
          </div>

          <h2 className="font-display fw-semibold mb-1" style={{ fontSize: 24 }}>Sign in</h2>
          <p className="mb-4" style={{ color: "var(--ink-soft)", fontSize: 14 }}>
            Enter your credentials to access your dashboard.
          </p>

          {error && (
            <div className="alert alert-danger py-2 px-3" style={{ fontSize: 13.5 }} role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <div className="form-label-cms">Username</div>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="mb-4">
              <div className="form-label-cms">Password</div>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-navy w-100 py-2" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
