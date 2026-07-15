import { LuMenu } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();

  const roleBadgeClass = {
    ADMIN: "badge-admin",
    FACULTY: "badge-faculty",
    STUDENT: "badge-student",
  }[user?.role] || "badge-student";

  return (
    <div className="topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm d-md-none border-0"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <LuMenu size={20} />
        </button>
        <span className="topbar-title">{title}</span>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span className="fw-semibold" style={{ fontSize: 14 }}>{user?.username}</span>
        <span className={`badge-role ${roleBadgeClass}`}>{user?.role}</span>
      </div>
    </div>
  );
}
