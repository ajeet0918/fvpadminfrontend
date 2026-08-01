import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type RefundDialogProps = {
  open: boolean;
  orderNumber: string;
  currency: string;
  refundableAmount: number;
  busy: boolean;
  errorMessage: string | null;
  onConfirm: (amount: number, note: string) => void;
  onCancel: () => void;
};

export function RefundDialog({
  open,
  orderNumber,
  currency,
  refundableAmount,
  busy,
  errorMessage,
  onConfirm,
  onCancel
}: RefundDialogProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setAmount(refundableAmount.toFixed(2));
    setNote("");
  }, [open, refundableAmount]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [busy, onCancel, open]);

  if (!open) return null;

  const numericAmount = Number(amount);
  const valid = numericAmount > 0 && numericAmount <= refundableAmount && note.trim().length >= 3;

  return createPortal(
    <div className="confirmation-backdrop" role="presentation">
      <div className="confirmation-dialog refund-dialog" role="dialog" aria-modal="true" aria-labelledby="refund-title">
        <div className="confirmation-dialog-header">
          <span className="confirmation-dialog-icon" aria-hidden="true">INR</span>
          <div>
            <h2 id="refund-title">Issue Cashfree refund</h2>
            <p>Order {orderNumber}. This sends money to the customer through the original payment method.</p>
          </div>
        </div>

        <div className="refund-dialog-fields">
          <label>
            Refund amount ({currency})
            <input
              type="number"
              min="0.01"
              max={refundableAmount}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              autoFocus
            />
            <small>Maximum available: {refundableAmount.toFixed(2)} {currency}</small>
          </label>
          <label>
            Reason
            <textarea
              rows={3}
              maxLength={100}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Reason for the refund"
            />
          </label>
          {errorMessage ? <p className="refund-dialog-error">{errorMessage}</p> : null}
          <p className="refund-dialog-note">Cancelling an order and refunding a payment are separate actions.</p>
        </div>

        <div className="confirmation-dialog-actions">
          <button type="button" className="button-link button-link-secondary" disabled={busy} onClick={onCancel}>
            Keep payment
          </button>
          <button
            type="button"
            className="button-link button-danger"
            disabled={busy || !valid}
            onClick={() => onConfirm(numericAmount, note.trim())}
          >
            {busy ? "Submitting..." : "Confirm refund"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
