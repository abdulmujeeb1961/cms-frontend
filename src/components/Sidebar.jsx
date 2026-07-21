import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard, LuUsers, LuGraduationCap, LuBookOpen,
  LuCalendarCheck, LuClipboardList, LuLogOut, LuBuilding2,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  ADMIN: [
    { to: "/dashboard", label: "Overview", icon: LuLayoutDashboard },
    { to: "/departments", label: "Departments", icon: LuBuilding2 },
    { to: "/students", label: "Students", icon: LuGraduationCap },
    { to: "/faculty", label: "Faculty", icon: LuUsers },
    { to: "/courses", label: "Courses", icon: LuBookOpen },
    { to: "/attendance", label: "Attendance", icon: LuCalendarCheck },
    { to: "/grades", label: "Grades", icon: LuClipboardList },
  ],
  FACULTY: [
    { to: "/dashboard", label: "Overview", icon: LuLayoutDashboard },
    { to: "/courses", label: "My Courses", icon: LuBookOpen },
    { to: "/attendance", label: "Attendance", icon: LuCalendarCheck },
    { to: "/grades", label: "Grades", icon: LuClipboardList },
  ],
  STUDENT: [
    { to: "/dashboard", label: "Overview", icon: LuLayoutDashboard },
    { to: "/courses", label: "My Courses", icon: LuBookOpen },
    { to: "/attendance", label: "My Attendance", icon: LuCalendarCheck },
    { to: "/grades", label: "My Grades", icon: LuClipboardList },
  ],
};

export default function Sidebar({ open }) {
  const { user, logout } = useAuth();
  const items = NAV_BY_ROLE[user?.role] || [];

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-mark">M</div>
        <div>
          <div className="brand-name">Meridian</div>
          <div className="brand-sub">College Portal</div>
        </div>
      </div>

      <div className="nav-section-label">Menu</div>
      <nav>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link-custom ${isActive ? "active" : ""}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={logout}
          className="nav-link-custom border-0 bg-transparent w-100"
          style={{ cursor: "pointer" }}
        >
          <LuLogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
