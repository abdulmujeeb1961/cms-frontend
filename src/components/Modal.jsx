import { LuX } from "react-icons/lu";

export default function Modal({ title, onClose, children, footer }) {
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ background: "rgba(20,26,36,0.45)", zIndex: 1050 }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded shadow"
        style={{ width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
          <h3 className="font-display fw-semibold mb-0" style={{ fontSize: 18 }}>{title}</h3>
          <button className="btn btn-sm border-0" onClick={onClose} aria-label="Close">
            <LuX size={18} />
          </button>
        </div>
        <div className="px-4 py-3">{children}</div>
        {footer && <div className="px-4 py-3 border-top d-flex justify-content-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
