import { useEffect, useRef } from "react";

export function Modal({ open, onClose, title, children }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose?.();
    }

    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modalOverlay"
      ref={overlayRef}
      onMouseDown={(event) => {
        if (event.target === overlayRef.current) onClose?.();
      }}
    >
      <div className="modal">
        <div className="modal__head">
          <div className="modal__title">{title}</div>
          <button className="modal__close" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}
