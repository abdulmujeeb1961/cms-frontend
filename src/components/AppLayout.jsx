import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ title }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} />
      <div className="main-area">
        <Topbar title={title} onMenuClick={() => setMenuOpen((o) => !o)} />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
