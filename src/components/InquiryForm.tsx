import { type FormEvent, useEffect, useState } from "react";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import { formatEnumLabel } from "../lib/formatters";
import type { InquiryStatus, OwnerOption, PaymentStatus, VerificationStatus } from "../types/domain";
import { FormActions } from "./FormActions";
import { FormSection } from "./FormSection";
import { ErrorBanner } from "./PageState";

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
  description?: string;
  initialValues: InquiryFormValues;
  owners: OwnerOption[];
  lockAssignedTo?: boolean;
  loading?: boolean;
  onSubmit: (values: InquiryFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel: string;
  onConvertToLead?: (values: InquiryFormValues) => Promise<void> | void;
  disableConvert?: boolean;
  automatedInvestorFlow?: boolean;
};

export function InquiryForm({
  title,
  description,
  initialValues,
  owners,
  lockAssignedTo = false,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
  onConvertToLead,
  disableConvert = false,
  automatedInvestorFlow = false
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
    <article className="admin-form-card form-page-card">
      <header className="form-card-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <form className="admin-edit-form" onSubmit={handleSubmit} aria-busy={submitting}>
        <FormSection title="Workflow status" subtitle="Keep verification, payment, and ownership aligned with the current stage.">
          <div className="form-grid-2">
            <label>
              Status
              <select
                required
                value={values.status}
                onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as InquiryStatus }))}
              >
                {inquiryStatuses.map((status) => (
                  <option key={status} value={status}>{formatEnumLabel(status)}</option>
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
                  <option key={status} value={status}>{formatEnumLabel(status)}</option>
                ))}
              </select>
            </label>

            {!automatedInvestorFlow ? (
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
                    <option key={status} value={status}>{formatEnumLabel(status)}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <label>
              Assigned to
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
        </FormSection>

        <FormSection title="Operational details" subtitle="Use only the fields relevant to this inquiry type and current approval stage.">
          <div className="form-grid-2">
            {!automatedInvestorFlow ? (
              <>
                <label>
                  Agreement ID
                  <input
                    value={values.agreementId}
                    onChange={(event) => setValues((current) => ({ ...current, agreementId: event.target.value }))}
                    placeholder="Optional for investor approval stage"
                  />
                </label>

                <label>
                  Committed return amount
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={values.committedReturnAmount}
                    onChange={(event) => setValues((current) => ({ ...current, committedReturnAmount: event.target.value }))}
                    placeholder="Investor return projection"
                  />
                </label>
              </>
            ) : null}

            <label>
              Farmer action
              <input
                value={values.farmerActionNote}
                onChange={(event) => setValues((current) => ({ ...current, farmerActionNote: event.target.value }))}
                placeholder="Seed allocation or next farmer action"
              />
            </label>

            <label>
              Collection hub action
              <input
                value={values.hubActionNote}
                onChange={(event) => setValues((current) => ({ ...current, hubActionNote: event.target.value }))}
                placeholder="Collection hub onboarding or field action"
              />
            </label>

          </div>

          <label className="mt-4 grid gap-1 text-sm font-medium text-text-secondary">
            Internal notes
            <textarea
              rows={5}
              value={values.adminNotes}
              onChange={(event) => setValues((current) => ({ ...current, adminNotes: event.target.value }))}
              placeholder="Record decisions, outstanding documents, and the next action."
            />
          </label>
        </FormSection>

        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

        <FormActions
          submitLabel={submitLabel}
          submitting={submitting}
          disabled={loading}
          onCancel={onCancel}
          secondaryActions={onConvertToLead ? (
            <button
              type="button"
              className="button-link button-link-secondary"
              disabled={disableConvert}
              onClick={() => void onConvertToLead(values)}
            >
              <PersonAddAltRoundedIcon fontSize="small" />
              Convert to lead
            </button>
          ) : null}
        />
      </form>
    </article>
  );
}
