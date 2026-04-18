import { FormEvent, useEffect, useState } from "react";
import type { LeadStatus } from "../types/domain";
import type { OwnerOption } from "../types/domain";

export const leadStatuses: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "DISQUALIFIED",
  "CONVERTED",
  "CLOSED"
];

export type LeadFormValues = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  status: LeadStatus;
  source: string;
  notes: string;
  assignedTo: string;
  inquiryId: string;
};

type LeadFormProps = {
  title: string;
  initialValues: LeadFormValues;
  owners: OwnerOption[];
  lockAssignedTo?: boolean;
  loading?: boolean;
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
  submitLabel: string;
  showDelete?: boolean;
  onDelete?: () => Promise<void> | void;
};

export function LeadForm({
  title,
  initialValues,
  owners,
  lockAssignedTo = false,
  loading = false,
  onSubmit,
  submitLabel,
  showDelete = false,
  onDelete
}: LeadFormProps) {
  const [values, setValues] = useState<LeadFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setErrorMessage(null);
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save lead.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="admin-form-card">
      <h3>{title}</h3>
      <form className="user-form-grid" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <label>
            Full Name
            <input
              value={values.fullName}
              onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
              required
            />
          </label>
          <label>
            Company
            <input
              value={values.companyName}
              onChange={(event) => setValues((current) => ({ ...current, companyName: event.target.value }))}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={values.phone}
              onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
              required
            />
          </label>
          <label>
            Status
            <select
              value={values.status}
              onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as LeadStatus }))}
              required
            >
              {leadStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Source
            <input
              value={values.source}
              onChange={(event) => setValues((current) => ({ ...current, source: event.target.value }))}
              placeholder="WEBSITE_CONTACT / ADMIN_PANEL"
            />
          </label>
          <label>
            Assigned To
            <select
              value={values.assignedTo}
              onChange={(event) => setValues((current) => ({ ...current, assignedTo: event.target.value }))}
              disabled={lockAssignedTo}
            >
              <option value="">Unassigned</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.username}>
                  {owner.displayName} ({owner.username})
                </option>
              ))}
            </select>
          </label>
          <label>
            Inquiry ID
            <input
              type="number"
              min="1"
              value={values.inquiryId}
              onChange={(event) => setValues((current) => ({ ...current, inquiryId: event.target.value }))}
              placeholder="optional"
            />
          </label>
        </div>
        <label>
          Notes
          <textarea
            rows={4}
            value={values.notes}
            onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
          />
        </label>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <div className="form-actions">
          <button type="submit" disabled={submitting || loading}>
            {submitting ? "Saving..." : submitLabel}
          </button>
          {showDelete && onDelete ? (
            <button type="button" className="button-danger button-muted" onClick={() => void onDelete()}>
              Delete
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
