import { useEffect } from "react";
import { createPortal } from "react-dom";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [busy, onCancel, open]);

  if (!open) return null;

  return createPortal(
    <div
      className="confirmation-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onCancel();
        }
      }}
    >
      <div
        className="confirmation-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-message"
        aria-busy={busy}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="confirmation-dialog-header">
          <span className="confirmation-dialog-icon" aria-hidden="true">!</span>
          <div>
            <h2 id="confirmation-dialog-title">{title}</h2>
            <p id="confirmation-dialog-message">{message}</p>
          </div>
        </div>
        <div className="confirmation-dialog-actions">
          <button
            type="button"
            className="button-link button-link-secondary"
            disabled={busy}
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="button-link button-danger"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
