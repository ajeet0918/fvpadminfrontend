import { type FormEvent, useEffect, useState } from "react";
import {
  approveInvestorOnboardingApi,
  downloadInvestorAgreementApi,
  fetchInvestorOnboardingApi,
  readErrorMessage,
  resendInvestorPaymentEmailApi,
  resendInvestorPortalInviteApi
} from "../lib/api";
import { downloadBlob } from "../lib/downloads";
import { formatEnumLabel } from "../lib/formatters";
import type { Inquiry, InvestorOnboarding } from "../types/domain";
import { ErrorBanner, LoadingState, SuccessBanner } from "./PageState";

type Props = {
  inquiry: Inquiry;
  onChanged?: () => Promise<void> | void;
};

export function InvestorOnboardingPanel({ inquiry, onChanged }: Props) {
  const [onboarding, setOnboarding] = useState<InvestorOnboarding | null>(null);
  const [monthlyReturnRate, setMonthlyReturnRate] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, [inquiry.id]);

  async function load() {
    try {
      setLoading(true);
      const response = await fetchInvestorOnboardingApi(inquiry.id);
      setOnboarding(response);
    } catch (requestError) {
      const requestMessage = readErrorMessage(requestError, "Unable to load investor onboarding.");
      if (requestMessage.includes("has not been approved yet")) {
        setOnboarding(null);
      } else {
        setError(requestMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  async function approve(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      const response = await approveInvestorOnboardingApi(inquiry.id, {
        monthlyReturnRate: Number(monthlyReturnRate),
        investmentStartDate: startDate,
        investmentEndDate: endDate || null,
        notes: notes.trim() || null
      });
      setOnboarding(response);
      setMessage("Investor approved. The Cashfree payment link email has been processed.");
      await onChanged?.();
    } catch (requestError) {
      setError(readErrorMessage(requestError, "Unable to approve investor onboarding."));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendPaymentEmail() {
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      const response = await resendInvestorPaymentEmailApi(inquiry.id);
      setOnboarding(response);
      setMessage("Payment link email sent again.");
    } catch (requestError) {
      setError(readErrorMessage(requestError, "Unable to resend payment email."));
    } finally {
      setSubmitting(false);
    }
  }

  async function downloadAgreement() {
    if (!onboarding?.agreementNumber) return;
    try {
      setSubmitting(true);
      setError(null);
      const blob = await downloadInvestorAgreementApi(inquiry.id);
      downloadBlob(blob, `${onboarding.agreementNumber}.pdf`);
    } catch (requestError) {
      setError(readErrorMessage(requestError, "Unable to download investor agreement."));
    } finally {
      setSubmitting(false);
    }
  }

  async function resendPortalInvite() {
    try {
      setSubmitting(true);
      setError(null);
      setMessage(null);
      await resendInvestorPortalInviteApi(inquiry.id);
      await load();
      setMessage("Investor portal activation email sent again.");
    } catch (requestError) {
      setError(readErrorMessage(requestError, "Unable to resend the investor portal invite."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="admin-form-card form-page-card">
      <header className="form-card-header">
        <h2>Investor payment onboarding</h2>
        <p>Approval creates the pending investor record, Cashfree payment link, payment email, and agreement snapshot.</p>
      </header>
      <div className="inquiry-detail-body">
        {error ? <ErrorBanner message={error} /> : null}
        {message ? <SuccessBanner message={message} /> : null}
        {loading ? <LoadingState label="Loading investor onboarding..." /> : null}

        {!loading && !onboarding ? (
          <form className="admin-edit-form" onSubmit={approve}>
            <p className="table-muted">
              Save the inquiry with verification status <strong>Verified</strong> before approval. The investor portal invite is sent automatically only after Cashfree confirms full payment.
            </p>
            <div className="form-grid-2">
              <label>
                Monthly return rate (%)
                <input
                  required
                  type="number"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={monthlyReturnRate}
                  onChange={(event) => setMonthlyReturnRate(event.target.value)}
                />
              </label>
              <label>
                Investment start date
                <input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </label>
              <label>
                Investment end date
                <input type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
              </label>
              <label>
                Approval notes
                <input value={notes} maxLength={1200} onChange={(event) => setNotes(event.target.value)} />
              </label>
            </div>
            <div className="settings-section-actions">
              <button
                className="button-link"
                type="submit"
                disabled={submitting || inquiry.verificationStatus !== "VERIFIED"}
              >
                {submitting ? "Approving..." : "Approve and send payment link"}
              </button>
            </div>
          </form>
        ) : null}

        {onboarding ? (
          <>
            <div className="record-detail-grid">
              <Detail label="Investor" value={`${onboarding.investorCode} · ${formatEnumLabel(onboarding.investorStatus)}`} />
              <Detail label="Investment" value={`${onboarding.investmentReference} · ${formatEnumLabel(onboarding.investmentStatus)}`} />
              <Detail label="Principal" value={`INR ${onboarding.principalAmount.toLocaleString("en-IN")}`} />
              <Detail label="Monthly return" value={`${onboarding.monthlyReturnRate}%`} />
              <Detail label="Payment" value={formatEnumLabel(onboarding.paymentStatus)} />
              <Detail label="Amount paid" value={`INR ${onboarding.amountPaid.toLocaleString("en-IN")}`} />
              <Detail label="Payment email" value={formatEnumLabel(onboarding.paymentEmailStatus)} />
              <Detail label="Portal invite" value={formatEnumLabel(onboarding.portalInviteStatus)} />
              <Detail label="Agreement" value={onboarding.agreementStatus ? formatEnumLabel(onboarding.agreementStatus) : "Pending"} />
              <Detail label="Agreement number" value={onboarding.agreementNumber ?? "Pending"} />
            </div>
            {onboarding.paymentEmailError ? <ErrorBanner message={onboarding.paymentEmailError} /> : null}
            {onboarding.portalInviteError ? <ErrorBanner message={onboarding.portalInviteError} /> : null}
            <div className="form-actions">
              {onboarding.paymentStatus !== "PAID" ? (
                <button type="button" className="button-link button-link-secondary" disabled={submitting} onClick={() => void resendPaymentEmail()}>
                  Resend payment email
                </button>
              ) : null}
              {onboarding.paymentLink && onboarding.paymentStatus !== "PAID" ? (
                <a className="button-link button-link-secondary" href={onboarding.paymentLink} target="_blank" rel="noreferrer">
                  Open Cashfree link
                </a>
              ) : null}
              {onboarding.agreementDownloadUrl ? (
                <button type="button" className="button-link" disabled={submitting} onClick={() => void downloadAgreement()}>
                  Download agreement
                </button>
              ) : null}
              {onboarding.paymentStatus === "PAID" && onboarding.portalInviteStatus !== "SENT" ? (
                <button type="button" className="button-link button-link-secondary" disabled={submitting} onClick={() => void resendPortalInvite()}>
                  Resend portal invite
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
