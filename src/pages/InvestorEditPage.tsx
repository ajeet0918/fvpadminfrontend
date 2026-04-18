import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { fetchInvestorApi, readErrorMessage, updateInvestorApi } from "../lib/api";
import type { InvestorAccountStatus, VerificationStatus } from "../types/domain";

const investorStatuses: InvestorAccountStatus[] = ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "CLOSED"];
const verificationStatuses: VerificationStatus[] = ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"];

export function InvestorEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const investorId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "PENDING_VERIFICATION" as InvestorAccountStatus,
    verificationStatus: "PENDING" as VerificationStatus,
    notes: ""
  });

  useEffect(() => {
    async function loadInvestor() {
      try {
        setLoading(true);
        const investor = await fetchInvestorApi(investorId);
        setForm({
          fullName: investor.fullName,
          email: investor.email,
          phone: investor.phone,
          status: investor.status,
          verificationStatus: investor.verificationStatus,
          notes: investor.notes ?? ""
        });
      } catch (err) {
        setError(readErrorMessage(err, "Unable to load investor."));
      } finally {
        setLoading(false);
      }
    }
    if (Number.isFinite(investorId)) {
      void loadInvestor();
    } else {
      setLoading(false);
      setError("Invalid investor id.");
    }
  }, [investorId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await updateInvestorApi(investorId, {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        status: form.status,
        verificationStatus: form.verificationStatus,
        notes: form.notes.trim() || null
      });
      navigate("/investors");
    } catch (err) {
      setError(readErrorMessage(err, "Unable to save investor."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader title="Investor Edit" subtitle="Update investor profile and verification lifecycle." />
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading investor...</p> : null}

      {!loading ? (
        <article className="admin-form-card">
          <h3>Edit Investor</h3>
          <form className="form-grid-2" onSubmit={handleSubmit}>
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
              <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
              <button type="button" className="button-muted" onClick={() => navigate("/investors")}>Cancel</button>
            </div>
          </form>
        </article>
      ) : null}
    </section>
  );
}
