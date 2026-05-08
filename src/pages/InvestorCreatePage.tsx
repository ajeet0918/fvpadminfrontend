import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { createInvestorApi, readErrorMessage } from "../lib/api";
import type { InvestorAccountStatus, VerificationStatus } from "../types/domain";

const investorStatuses: InvestorAccountStatus[] = ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "CLOSED"];
const verificationStatuses: VerificationStatus[] = ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"];

export function InvestorCreatePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    investorCode: "",
    fullName: "",
    email: "",
    phone: "",
    status: "PENDING_VERIFICATION" as InvestorAccountStatus,
    verificationStatus: "PENDING" as VerificationStatus,
    notes: ""
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await createInvestorApi({
        investorCode: form.investorCode.trim() || undefined,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        status: form.status,
        verificationStatus: form.verificationStatus,
        notes: form.notes.trim() || null
      });
      navigate("/investors");
    } catch (err) {
      setError(readErrorMessage(err, "Unable to create investor."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader title="Create Investor" subtitle="Register a new investor profile for portfolio operations." />
      {error ? <p className="error-text">{error}</p> : null}
      <article className="admin-form-card">
        <h3>Investor Details</h3>
        <form className="form-grid-2" onSubmit={handleSubmit}>
          <label>Investor Code (optional)<input value={form.investorCode} onChange={(event) => setForm((p) => ({ ...p, investorCode: event.target.value }))} /></label>
          <label>Full Name<input required value={form.fullName} onChange={(event) => setForm((p) => ({ ...p, fullName: event.target.value }))} /></label>
          <label>Email<input required type="email" value={form.email} onChange={(event) => setForm((p) => ({ ...p, email: event.target.value }))} /></label>
          <label>Phone<input required value={form.phone} onChange={(event) => setForm((p) => ({ ...p, phone: event.target.value }))} /></label>
          <label>
            Account Status
            <select value={form.status} onChange={(event) => setForm((p) => ({ ...p, status: event.target.value as InvestorAccountStatus }))}>
              {investorStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>
            Verification Status
            <select value={form.verificationStatus} onChange={(event) => setForm((p) => ({ ...p, verificationStatus: event.target.value as VerificationStatus }))}>
              {verificationStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>Notes<input value={form.notes} onChange={(event) => setForm((p) => ({ ...p, notes: event.target.value }))} /></label>
          <div className="row">
            <button type="submit" className="button-link" disabled={saving}>{saving ? "Creating..." : "Create Investor"}</button>
            <button type="button" className="button-link button-link-secondary" onClick={() => navigate("/investors")}>Cancel</button>
          </div>
        </form>
      </article>
    </section>
  );
}
