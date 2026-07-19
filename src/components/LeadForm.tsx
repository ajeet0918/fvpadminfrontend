import { type FormEvent, useEffect, useState } from "react";
import { formatEnumLabel } from "../lib/formatters";
import type { LeadStatus, OwnerOption } from "../types/domain";
import { FormActions } from "./FormActions";
import { FormSection } from "./FormSection";
import { ErrorBanner } from "./PageState";

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
  description?: string;
  initialValues: LeadFormValues;
  owners: OwnerOption[];
  lockAssignedTo?: boolean;
  loading?: boolean;
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel: string;
  showDelete?: boolean;
  onDelete?: () => Promise<void> | void;
};

export function LeadForm({
  title,
  description,
  initialValues,
  owners,
  lockAssignedTo = false,
  loading = false,
  onSubmit,
  onCancel,
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
    <article className="admin-form-card form-page-card">
      <header className="form-card-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <form className="admin-edit-form" onSubmit={handleSubmit} aria-busy={submitting}>
        <FormSection title="Contact and company" subtitle="Capture enough context for the sales team to qualify and follow up.">
          <div className="form-grid-2">
            <label>
              Full name
              <input
                required
                autoComplete="name"
                value={values.fullName}
                onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
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
                required
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              Phone
              <input
                required
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </div>
        </FormSection>

        <FormSection title="Pipeline ownership" subtitle="Set the lead stage, source, and responsible operations user.">
          <div className="form-grid-2">
            <label>
              Status
              <select
                required
                value={values.status}
                onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as LeadStatus }))}
              >
                {leadStatuses.map((status) => (
                  <option key={status} value={status}>{formatEnumLabel(status)}</option>
                ))}
              </select>
            </label>
            <label>
              Source
              <input
                value={values.source}
                onChange={(event) => setValues((current) => ({ ...current, source: event.target.value }))}
                placeholder="For example, ADMIN_PANEL"
              />
            </label>
            <label>
              Assigned To
              <select
                value={values.assignedTo}
                disabled={lockAssignedTo}
                onChange={(event) => setValues((current) => ({ ...current, assignedTo: event.target.value }))}
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
                placeholder="Optional"
              />
            </label>
          </div>
          <label className="mt-4 grid gap-1 text-sm font-medium text-text-secondary">
            Internal notes
            <textarea
              rows={4}
              value={values.notes}
              onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Record requirements, qualification context, and the next action."
            />
          </label>
        </FormSection>

        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

        <FormActions
          submitLabel={submitLabel}
          submitting={submitting}
          disabled={loading}
          onCancel={onCancel}
          dangerAction={showDelete && onDelete ? { label: "Delete lead", onClick: () => void onDelete() } : undefined}
        />
      </form>
    </article>
  );
}
