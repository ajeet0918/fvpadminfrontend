import { FormEvent, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import {
  createInvestmentApi,
  fetchInvestmentsApi,
  fetchInvestorsApi,
  readErrorMessage,
  updateInvestmentApi
} from "../lib/api";
import type { Investment, InvestmentStatus, InvestorAccount } from "../types/domain";

const investmentStatuses: InvestmentStatus[] = ["ACTIVE", "PAUSED", "CLOSED"];

export function InvestmentListPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investors, setInvestors] = useState<InvestorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<InvestmentStatus | "">("");
  const [form, setForm] = useState({
    investorId: "",
    principalAmount: "",
    monthlyReturnRate: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE" as InvestmentStatus,
    notes: ""
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      const [nextInvestments, nextInvestors] = await Promise.all([
        fetchInvestmentsApi({ status: statusFilter }),
        fetchInvestorsApi({ status: "ACTIVE" })
      ]);
      setInvestments(nextInvestments);
      setInvestors(nextInvestors);
    } catch (err) {
      setError(readErrorMessage(err, "Unable to load investments."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [statusFilter]);

  const editItem = useMemo(
    () => investments.find((item) => item.id === editingId) ?? null,
    [investments, editingId]
  );

  useEffect(() => {
    if (!editItem) return;
    setForm({
      investorId: String(editItem.investorId),
      principalAmount: String(editItem.principalAmount),
      monthlyReturnRate: String(editItem.monthlyReturnRate),
      startDate: editItem.startDate,
      endDate: editItem.endDate ?? "",
      status: editItem.status,
      notes: editItem.notes ?? ""
    });
  }, [editItem]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
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
      setForm({
        investorId: "",
        principalAmount: "",
        monthlyReturnRate: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
        notes: ""
      });
      await loadData();
    } catch (err) {
      setError(readErrorMessage(err, "Unable to create investment."));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) return;
    try {
      setSaving(true);
      setError(null);
      await updateInvestmentApi(editingId, {
        principalAmount: Number(form.principalAmount),
        monthlyReturnRate: Number(form.monthlyReturnRate),
        startDate: form.startDate,
        endDate: form.endDate || null,
        status: form.status,
        notes: form.notes.trim() || null
      });
      setEditingId(null);
      setForm({
        investorId: "",
        principalAmount: "",
        monthlyReturnRate: "",
        startDate: "",
        endDate: "",
        status: "ACTIVE",
        notes: ""
      });
      await loadData();
    } catch (err) {
      setError(readErrorMessage(err, "Unable to update investment."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader title="Investments" subtitle="Manage principal entries and monthly return rates for each investor." />

      <div className="filter-grid">
        <label>
          Status Filter
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InvestmentStatus | "")}>
            <option value="">All</option>
            {investmentStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>

      <article className="admin-form-card">
        <h3>{editingId ? "Edit Investment" : "Create Investment"}</h3>
        <form className="form-grid-2" onSubmit={editingId ? handleUpdate : handleCreate}>
          <label>
            Investor
            <select
              disabled={Boolean(editingId)}
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
            <button type="submit" className="button-link" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Create Investment"}</button>
            {editingId ? <button type="button" className="button-link button-link-secondary" onClick={() => setEditingId(null)}>Cancel Edit</button> : null}
          </div>
        </form>
      </article>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading investments...</p> : null}
      {!loading ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Investor</th>
                <th>Principal</th>
                <th>Rate</th>
                <th>Dates</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {investments.map((item) => (
                <tr key={item.id}>
                  <td>{item.investmentReference}</td>
                  <td>{item.investorCode} - {item.investorName}</td>
                  <td>{item.principalAmount.toFixed(2)}</td>
                  <td>{item.monthlyReturnRate.toFixed(2)}%</td>
                  <td>{item.startDate} {item.endDate ? `to ${item.endDate}` : ""}</td>
                  <td>{item.status}</td>
                  <td><button type="button" className="button-link button-small" onClick={() => setEditingId(item.id)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {investments.length === 0 ? <p className="empty-state">No investments found.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
