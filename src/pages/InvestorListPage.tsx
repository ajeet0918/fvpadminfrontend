import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  createInvestorProfileApi,
  fetchInvestorOverviewApi,
  readErrorMessage,
  updateInvestorProfileApi
} from "../lib/api";
import type {
  Investment,
  InvestmentStatus,
  InvestorAccount,
  InvestorAccountStatus,
  VerificationStatus
} from "../types/domain";

const investorStatuses: InvestorAccountStatus[] = ["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "CLOSED"];
const verificationStatuses: VerificationStatus[] = ["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"];
const investmentStatuses: InvestmentStatus[] = ["ACTIVE", "PAUSED", "CLOSED"];

type ViewMode = "LIST" | "CREATE" | "EDIT";

type InvestorProfileForm = {
  investorCode: string;
  fullName: string;
  email: string;
  phone: string;
  status: InvestorAccountStatus;
  verificationStatus: VerificationStatus;
  notes: string;
  includeInvestment: boolean;
  investmentId: string;
  principalAmount: string;
  monthlyReturnRate: string;
  startDate: string;
  endDate: string;
  investmentStatus: InvestmentStatus;
  investmentNotes: string;
};

const initialForm: InvestorProfileForm = {
  investorCode: "",
  fullName: "",
  email: "",
  phone: "",
  status: "PENDING_VERIFICATION",
  verificationStatus: "PENDING",
  notes: "",
  includeInvestment: false,
  investmentId: "",
  principalAmount: "",
  monthlyReturnRate: "",
  startDate: "",
  endDate: "",
  investmentStatus: "ACTIVE",
  investmentNotes: ""
};

export function InvestorListPage() {
  const [mode, setMode] = useState<ViewMode>("LIST");
  const [activeList, setActiveList] = useState<"INVESTORS" | "INVESTMENTS">("INVESTORS");
  const [editingInvestorId, setEditingInvestorId] = useState<number | null>(null);

  const [investors, setInvestors] = useState<InvestorAccount[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [investorSearch, setInvestorSearch] = useState("");
  const [investorStatusFilter, setInvestorStatusFilter] = useState<InvestorAccountStatus | "">("");
  const [verificationStatusFilter, setVerificationStatusFilter] = useState<VerificationStatus | "">("");

  const [investmentSearch, setInvestmentSearch] = useState("");
  const [investmentStatusFilter, setInvestmentStatusFilter] = useState<InvestmentStatus | "">("");

  const [form, setForm] = useState<InvestorProfileForm>(initialForm);

  const investmentByInvestor = useMemo(() => {
    const map = new Map<number, Investment[]>();
    for (const item of investments) {
      const current = map.get(item.investorId) ?? [];
      current.push(item);
      map.set(item.investorId, current);
    }
    return map;
  }, [investments]);

  async function loadData() {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await fetchInvestorOverviewApi({
        investorSearch,
        investorStatus: investorStatusFilter,
        verificationStatus: verificationStatusFilter,
        investmentSearch,
        investmentStatus: investmentStatusFilter
      });
      setInvestors(response.investors);
      setInvestments(response.investments);
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to load investor data."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [investorSearch, investorStatusFilter, verificationStatusFilter, investmentSearch, investmentStatusFilter]);

  function openCreatePage() {
    setMode("CREATE");
    setEditingInvestorId(null);
    setForm(initialForm);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function openEditInvestorPage(investor: InvestorAccount) {
    const linkedInvestments = investmentByInvestor.get(investor.id) ?? [];
    const primaryInvestment = linkedInvestments[0] ?? null;

    setMode("EDIT");
    setEditingInvestorId(investor.id);
    setForm({
      investorCode: investor.investorCode,
      fullName: investor.fullName,
      email: investor.email,
      phone: investor.phone,
      status: investor.status,
      verificationStatus: investor.verificationStatus,
      notes: investor.notes ?? "",
      includeInvestment: Boolean(primaryInvestment),
      investmentId: primaryInvestment ? String(primaryInvestment.id) : "",
      principalAmount: primaryInvestment ? String(primaryInvestment.principalAmount) : "",
      monthlyReturnRate: primaryInvestment ? String(primaryInvestment.monthlyReturnRate) : "",
      startDate: primaryInvestment?.startDate ?? "",
      endDate: primaryInvestment?.endDate ?? "",
      investmentStatus: primaryInvestment?.status ?? "ACTIVE",
      investmentNotes: primaryInvestment?.notes ?? ""
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function openEditFromInvestment(investment: Investment) {
    const investor = investors.find((item) => item.id === investment.investorId);
    if (!investor) {
      setErrorMessage("Unable to open editor: investor record is missing.");
      return;
    }
    setMode("EDIT");
    setEditingInvestorId(investor.id);
    setForm({
      investorCode: investor.investorCode,
      fullName: investor.fullName,
      email: investor.email,
      phone: investor.phone,
      status: investor.status,
      verificationStatus: investor.verificationStatus,
      notes: investor.notes ?? "",
      includeInvestment: true,
      investmentId: String(investment.id),
      principalAmount: String(investment.principalAmount),
      monthlyReturnRate: String(investment.monthlyReturnRate),
      startDate: investment.startDate,
      endDate: investment.endDate ?? "",
      investmentStatus: investment.status,
      investmentNotes: investment.notes ?? ""
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function closeEditor() {
    setMode("LIST");
    setEditingInvestorId(null);
    setForm(initialForm);
    setErrorMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        investorCode: mode === "CREATE" ? form.investorCode.trim() || undefined : undefined,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        status: form.status,
        verificationStatus: form.verificationStatus,
        notes: form.notes.trim() || null,
        investmentId: form.includeInvestment && form.investmentId ? Number(form.investmentId) : null,
        principalAmount: form.includeInvestment ? Number(form.principalAmount) : null,
        monthlyReturnRate: form.includeInvestment ? Number(form.monthlyReturnRate) : null,
        startDate: form.includeInvestment ? form.startDate : null,
        endDate: form.includeInvestment ? form.endDate || null : null,
        investmentStatus: form.includeInvestment ? form.investmentStatus : null,
        investmentNotes: form.includeInvestment ? form.investmentNotes.trim() || null : null
      };

      if (mode === "CREATE") {
        await createInvestorProfileApi(payload);
        setSuccessMessage("Investor profile created successfully.");
      } else {
        if (!editingInvestorId) {
          throw new Error("Investor id is missing for edit.");
        }
        await updateInvestorProfileApi(editingInvestorId, payload);
        setSuccessMessage("Investor profile updated successfully.");
      }

      setMode("LIST");
      setEditingInvestorId(null);
      setForm(initialForm);
      await loadData();
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to save investor profile."));
    } finally {
      setSaving(false);
    }
  }

  const totalInvestors = investors.length;
  const totalInvestments = investments.length;

  if (mode !== "LIST") {
    return (
      <section className="admin-page">
        <PageHeader
          title={mode === "CREATE" ? "Create Investor Profile" : "Edit Investor Profile"}
          subtitle="Use one form for investor details and optional investment details."
          actions={<button type="button" className="button-link button-link-secondary" onClick={closeEditor}>Back To Search</button>}
        />

        <article className="admin-form-card module-form-scroll">
          <h3>Investor & Investment Form</h3>
          <form className="user-form-grid" onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <label>
                Investor Code (optional)
                <input
                  disabled={mode === "EDIT"}
                  value={form.investorCode}
                  onChange={(event) => setForm((current) => ({ ...current, investorCode: event.target.value }))}
                />
              </label>
              <label>
                Full Name
                <input
                  required
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Phone
                <input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
              <label>
                Investor Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as InvestorAccountStatus }))}
                >
                  {investorStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
              <label>
                Verification Status
                <select
                  value={form.verificationStatus}
                  onChange={(event) => setForm((current) => ({ ...current, verificationStatus: event.target.value as VerificationStatus }))}
                >
                  {verificationStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </label>
            </div>

            <label>
              Notes
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>

            <div className="section-subhead">
              <h4>Investment Section</h4>
              <label className="inline-checkbox">
                <input
                  type="checkbox"
                  checked={form.includeInvestment}
                  onChange={(event) => setForm((current) => ({ ...current, includeInvestment: event.target.checked }))}
                />
                Include Investment Details
              </label>
            </div>

            {form.includeInvestment ? (
              <div className="form-grid-2">
                <label>
                  Principal Amount
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.principalAmount}
                    onChange={(event) => setForm((current) => ({ ...current, principalAmount: event.target.value }))}
                  />
                </label>
                <label>
                  Monthly Return Rate (%)
                  <input
                    required
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    value={form.monthlyReturnRate}
                    onChange={(event) => setForm((current) => ({ ...current, monthlyReturnRate: event.target.value }))}
                  />
                </label>
                <label>
                  Start Date
                  <input
                    required
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                  />
                </label>
                <label>
                  End Date
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                  />
                </label>
                <label>
                  Investment Status
                  <select
                    value={form.investmentStatus}
                    onChange={(event) => setForm((current) => ({ ...current, investmentStatus: event.target.value as InvestmentStatus }))}
                  >
                    {investmentStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
                <label>
                  Investment Notes
                  <input
                    value={form.investmentNotes}
                    onChange={(event) => setForm((current) => ({ ...current, investmentNotes: event.target.value }))}
                  />
                </label>
              </div>
            ) : null}

            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
            {successMessage ? <p className="success-text">{successMessage}</p> : null}

            <div className="row">
              <button type="submit" className="button-link" disabled={saving}>
                {saving ? "Saving..." : mode === "CREATE" ? "Create Profile" : "Save Profile"}
              </button>
              <button type="button" className="button-link button-link-secondary" onClick={closeEditor}>Cancel</button>
            </div>
          </form>
        </article>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Investor Search"
        subtitle="Search investors and investments. Open create or edit as needed."
        actions={<button type="button" className="button-link" onClick={openCreatePage}>Create Investor Profile</button>}
      />

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}
      {loading ? <p>Loading investor data...</p> : null}

      <div className="kpi-grid quote-kpi-grid">
        <article className="kpi-card">
          <span>Total Investors</span>
          <strong>{totalInvestors}</strong>
        </article>
        <article className="kpi-card">
          <span>Total Investments</span>
          <strong>{totalInvestments}</strong>
        </article>
      </div>

      <div className="segmented-tabs" role="tablist" aria-label="Investor data lists">
        <button
          type="button"
          role="tab"
          aria-selected={activeList === "INVESTORS"}
          className={`segmented-tab ${activeList === "INVESTORS" ? "active" : ""}`}
          onClick={() => setActiveList("INVESTORS")}
        >
          Investors ({totalInvestors})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeList === "INVESTMENTS"}
          className={`segmented-tab ${activeList === "INVESTMENTS" ? "active" : ""}`}
          onClick={() => setActiveList("INVESTMENTS")}
        >
          Investments ({totalInvestments})
        </button>
      </div>

      {activeList === "INVESTORS" ? (
        <article className="admin-form-card">
          <div className="list-section-head">
            <h3>Investor List</h3>
            <span className="table-muted">Search and manage investor account profiles</span>
          </div>
          <div className="filter-grid filter-grid-4 financial-filter-row">
            <label>
              Search
              <input
                value={investorSearch}
                onChange={(event) => setInvestorSearch(event.target.value)}
                placeholder="Code, name, email, phone"
              />
            </label>
            <label>
              Status
              <select
                value={investorStatusFilter}
                onChange={(event) => setInvestorStatusFilter(event.target.value as InvestorAccountStatus | "")}
              >
                <option value="">All</option>
                {investorStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label>
              Verification
              <select
                value={verificationStatusFilter}
                onChange={(event) => setVerificationStatusFilter(event.target.value as VerificationStatus | "")}
              >
                <option value="">All</option>
                {verificationStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>

          <DataTable className="section-table-scroll" isEmpty={investors.length === 0} emptyText="No investors found.">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Investor</th>
                  <th className="text-right">Total Invested</th>
                  <th className="text-right">Returns Received</th>
                  <th className="text-right">Pending Payout</th>
                  <th>Status</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button type="button" className="record-id-link record-id-button" onClick={() => openEditInvestorPage(item)}>
                        {item.investorCode}
                      </button>
                    </td>
                    <td>
                      <div className="font-medium">{item.fullName}</div>
                      <div className="table-muted">{item.email} • {item.phone}</div>
                    </td>
                    <td className="text-right tabular-nums">{item.totalInvested.toFixed(2)}</td>
                    <td className="text-right tabular-nums">{item.totalReturnsReceived.toFixed(2)}</td>
                    <td className="text-right tabular-nums">{item.pendingPayout.toFixed(2)}</td>
                    <td><StatusBadge label={item.status} tone={item.status === "ACTIVE" ? "success" : "warning"} /></td>
                    <td><StatusBadge label={item.verificationStatus} tone={item.verificationStatus === "VERIFIED" ? "success" : "neutral"} /></td>
                  </tr>
                ))}
              </tbody>
          </DataTable>
        </article>
      ) : (
        <article className="admin-form-card">
          <div className="list-section-head">
            <h3>Investment List</h3>
            <span className="table-muted">Search and manage investment records linked to investors</span>
          </div>
          <div className="filter-grid filter-grid-4 financial-filter-row">
            <label>
              Search
              <input
                value={investmentSearch}
                onChange={(event) => setInvestmentSearch(event.target.value)}
                placeholder="Reference, investor code, investor name"
              />
            </label>
            <label>
              Status
              <select
                value={investmentStatusFilter}
                onChange={(event) => setInvestmentStatusFilter(event.target.value as InvestmentStatus | "")}
              >
                <option value="">All</option>
                {investmentStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>

          <DataTable className="section-table-scroll" isEmpty={investments.length === 0} emptyText="No investments found.">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Investor</th>
                  <th className="text-right">Principal</th>
                  <th className="text-right">Monthly Rate</th>
                  <th>Status</th>
                  <th>Dates</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button type="button" className="record-id-link record-id-button font-medium" onClick={() => openEditFromInvestment(item)}>
                        {item.investmentReference}
                      </button>
                    </td>
                    <td>{item.investorCode} - {item.investorName}</td>
                    <td className="text-right tabular-nums">{item.principalAmount.toFixed(2)}</td>
                    <td className="text-right tabular-nums">{item.monthlyReturnRate.toFixed(2)}%</td>
                    <td>
                      <StatusBadge
                        label={item.status}
                        tone={item.status === "ACTIVE" ? "success" : item.status === "PAUSED" ? "warning" : "neutral"}
                      />
                    </td>
                    <td>{item.startDate} {item.endDate ? `to ${item.endDate}` : ""}</td>
                  </tr>
                ))}
              </tbody>
          </DataTable>
        </article>
      )}
    </section>
  );
}
