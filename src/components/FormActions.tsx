import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import type { ReactNode } from "react";

type DangerAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type FormActionsProps = {
  submitLabel: string;
  submitting: boolean;
  disabled?: boolean;
  onCancel?: () => void;
  secondaryActions?: ReactNode;
  dangerAction?: DangerAction;
};

export function FormActions({
  submitLabel,
  submitting,
  disabled = false,
  onCancel,
  secondaryActions,
  dangerAction
}: FormActionsProps) {
  return (
    <div className="form-action-bar">
      <div className="form-primary-actions">
        <button type="submit" className="button-link" disabled={disabled || submitting}>
          <SaveRoundedIcon fontSize="small" />
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="button-link button-link-secondary" onClick={onCancel}>
            <CloseRoundedIcon fontSize="small" />
            Cancel
          </button>
        ) : null}
        {secondaryActions}
      </div>
      {dangerAction ? (
        <button
          type="button"
          className="button-link button-danger"
          onClick={dangerAction.onClick}
          disabled={dangerAction.disabled}
        >
          <DeleteOutlineRoundedIcon fontSize="small" />
          {dangerAction.label}
        </button>
      ) : null}
    </div>
  );
}
