import { type FormEvent, useEffect, useState } from "react";
import type { InquiryStatus, OwnerOption, PaymentStatus, VerificationStatus } from "../types/domain";
import { FormSection } from "./FormSection";

export const inquiryStatuses: InquiryStatus[] = [
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "QUOTED",
  "CONVERTED",
  "CLOSED"
];

export const verificationStatuses: VerificationStatus[] = [
  "PENDING",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED"
];

export const paymentStatuses: PaymentStatus[] = [
  "NOT_REQUIRED",
  "PENDING",
  "RECEIVED",
  "VERIFIED",
  "FAILED"
];

export type InquiryFormValues = {
  status: InquiryStatus;
  verificationStatus: VerificationStatus;
  paymentStatus: PaymentStatus;
  agreementId: string;
  committedReturnAmount: string;
  farmerActionNote: string;
  hubActionNote: string;
  adminNotes: string;
  assignedTo: string;
};

type InquiryFormProps = {
  title: string;
  initialValues: InquiryFormValues;
  owners: OwnerOption[];
  lockAssignedTo?: boolean;
  loading?: boolean;
  onSubmit: (values: InquiryFormValues) => Promise<void> | void;
  submitLabel: string;
  onConvertToLead?: (values: InquiryFormValues) => Promise<void> | void;
  disableConvert?: boolean;
};

export function InquiryForm({
  title,
  initialValues,
  owners,
  lockAssignedTo = false,
  loading = false,
  onSubmit,
  submitLabel,
  onConvertToLead,
  disableConvert = false
}: InquiryFormProps) {
  const [values, setValues] = useState<InquiryFormValues>(initialValues);
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
      setErrorMessage(error instanceof Error ? error.message : "Unable to save inquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="admin-form-card module-form-scroll">
      <h3 className="m-0 text-lg font-semibold text-text-primary">{title}</h3>
      <form className="mt-3 grid gap-4" onSubmit={handleSubmit}>
        <FormSection title="Inquiry Workflow">
          <div className="form-grid-2">
            <label>
              Status
              <select
                required
                value={values.status}
                onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as InquiryStatus }))}
              >
                {inquiryStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Verification Status
              <select
                value={values.verificationStatus}
                onChange={(event) => setValues((current) => ({
                  ...current,
                  verificationStatus: event.target.value as VerificationStatus
                }))}
              >
                {verificationStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Payment Status
              <select
                value={values.paymentStatus}
                onChange={(event) => setValues((current) => ({
                  ...current,
                  paymentStatus: event.target.value as PaymentStatus
                }))}
              >
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>

            <label>
              Agreement ID
              <input
                value={values.agreementId}
                onChange={(event) => setValues((current) => ({ ...current, agreementId: event.target.value }))}
                placeholder="Optional for investor approval stage"
              />
            </label>

            <label>
              Committed Return Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={values.committedReturnAmount}
                onChange={(event) => setValues((current) => ({ ...current, committedReturnAmount: event.target.value }))}
                placeholder="Investor return projection"
              />
            </label>

            <label>
              Farmer Action Note
              <input
                value={values.farmerActionNote}
                onChange={(event) => setValues((current) => ({ ...current, farmerActionNote: event.target.value }))}
                placeholder="Seed allocation or next farmer action"
              />
            </label>

            <label>
              Hub Action Note
              <input
                value={values.hubActionNote}
                onChange={(event) => setValues((current) => ({ ...current, hubActionNote: event.target.value }))}
                placeholder="Collection hub onboarding or field action"
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
          </div>

          <label className="mt-3 grid gap-1 text-sm font-medium text-text-secondary">
            Admin Notes
            <textarea
              rows={5}
              value={values.adminNotes}
              onChange={(event) => setValues((current) => ({ ...current, adminNotes: event.target.value }))}
            />
          </label>
        </FormSection>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <div className="form-actions">
          <button type="submit" className="button-link" disabled={submitting || loading}>
            {submitting ? "Saving..." : submitLabel}
          </button>
          {onConvertToLead ? (
            <button
              type="button"
              className="button-link button-link-secondary"
              disabled={disableConvert}
              onClick={() => void onConvertToLead(values)}
            >
              Convert To Lead
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
