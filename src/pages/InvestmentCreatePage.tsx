import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { createInvestmentApi, fetchInvestorsApi, readErrorMessage } from "../lib/api";
import type { InvestmentStatus, InvestorAccount } from "../types/domain";

const investmentStatuses: InvestmentStatus[] = ["ACTIVE", "PAUSED", "CLOSED"];

export function InvestmentCreatePage() {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState<InvestorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    investorId: "",
    principalAmount: "",
    monthlyReturnRate: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE" as InvestmentStatus,
    notes: ""
  });

  useEffect(() => {
    async function loadInvestors() {
      try {
        setLoading(true);
        setInvestors(await fetchInvestorsApi({ status: "ACTIVE" }));
      } catch (err) {
        setError(readErrorMessage(err, "Unable to load investors."));
      } finally {
        setLoading(false);
      }
    }
    void loadInvestors();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await createInvestmentApi({
        investorId: Number(form.investorId),
        principalAmount: Number(form.principalAmount),
        monthlyReturnRate: Number(form.monthlyReturnRate),
        startDate: form.startDate,
        endDate: form.endDate || null,
        status: form.status,
        notes: form.notes.trim() || null
      });
      navigate("/investors");
    } catch (err) {
      setError(readErrorMessage(err, "Unable to create investment."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader title="Create Investment" subtitle="Create a new investment entry for an investor account." />
      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading investors...</p> : null}

      {!loading ? (
        <article className="admin-form-card">
          <h3>Investment Details</h3>
          <form className="form-grid-2" onSubmit={handleSubmit}>
            <label>
              Investor
              <select
                value={form.investorId}
                onChange={(event) => setForm((p) => ({ ...p, investorId: event.target.value }))}
                required
              >
                <option value="">Select investor</option>
                {investors.map((item) => (
                  <option key={item.id} value={item.id}>{item.investorCode} - {item.fullName}</option>
                ))}
              </select>
            </label>
            <label>Principal Amount<input required type="number" min="0.01" step="0.01" value={form.principalAmount} onChange={(event) => setForm((p) => ({ ...p, principalAmount: event.target.value }))} /></label>
            <label>Monthly Return Rate (%)<input required type="number" min="0.01" max="100" step="0.01" value={form.monthlyReturnRate} onChange={(event) => setForm((p) => ({ ...p, monthlyReturnRate: event.target.value }))} /></label>
            <label>Start Date<input required type="date" value={form.startDate} onChange={(event) => setForm((p) => ({ ...p, startDate: event.target.value }))} /></label>
            <label>End Date<input type="date" value={form.endDate} onChange={(event) => setForm((p) => ({ ...p, endDate: event.target.value }))} /></label>
            <label>
              Status
              <select value={form.status} onChange={(event) => setForm((p) => ({ ...p, status: event.target.value as InvestmentStatus }))}>
                {investmentStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>Notes<input value={form.notes} onChange={(event) => setForm((p) => ({ ...p, notes: event.target.value }))} /></label>
            <div className="row">
              <button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Investment"}</button>
              <button type="button" className="button-muted" onClick={() => navigate("/investors")}>Cancel</button>
            </div>
          </form>
        </article>
      ) : null}
    </section>
  );
}
