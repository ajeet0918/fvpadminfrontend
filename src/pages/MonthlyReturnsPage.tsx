import { useEffect, useMemo, useState } from "react";
import { ActionDropdown } from "../components/ActionDropdown";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import {
  approveMonthlyReturnApi,
  fetchInvestmentsApi,
  fetchInvestorsApi,
  fetchMonthlyReturnsApi,
  generateMonthlyReturnsApi,
  holdMonthlyReturnApi,
  readErrorMessage,
  rejectMonthlyReturnApi,
  submitMonthlyReturnApi,
  updateMonthlyReturnApi
} from "../lib/api";
import type {
  InvestorAccount,
  InvestorMonthlyReturn
} from "../types/domain";

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

const monthLabelByNumber = Object.fromEntries(monthOptions.map((item) => [Number(item.value), item.label])) as Record<number, string>;

function formatPeriod(periodYear: number, periodMonth: number) {
  const monthLabel = monthLabelByNumber[periodMonth] ?? `Month ${periodMonth}`;
  return `${monthLabel} ${periodYear}`;
}

export function MonthlyReturnsPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const yearOptions = useMemo(
    () => Array.from({ length: 11 }, (_, index) => String(currentYear - 5 + index)),
    [currentYear]
  );

  const [items, setItems] = useState<InvestorMonthlyReturn[]>([]);
  const [investors, setInvestors] = useState<InvestorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    investorId: "",
    year: String(currentYear),
    month: String(currentMonth)
  });
  const [generation, setGeneration] = useState({
    companyFund: "",
    companyProfit: "",
    returnPercentage: "5.00"
  });
  const [activeInvestmentCount, setActiveInvestmentCount] = useState<number | null>(null);
  const [editingReturnId, setEditingReturnId] = useState<number | null>(null);
  const [editingFinalAmount, setEditingFinalAmount] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [nextInvestors, nextReturns] = await Promise.all([
        fetchInvestorsApi({}),
        fetchMonthlyReturnsApi({
          investorId: filters.investorId ? Number(filters.investorId) : null,
          year: filters.year ? Number(filters.year) : null,
          month: filters.month ? Number(filters.month) : null
        })
      ]);
      setInvestors(nextInvestors);
      setItems(nextReturns);
    } catch (err) {
      setError(readErrorMessage(err, "Unable to load monthly returns."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [filters.investorId, filters.year, filters.month]);

  useEffect(() => {
    let cancelled = false;

    async function syncReturnPercentage() {
      if (!filters.investorId) {
        setActiveInvestmentCount(null);
        setGeneration((previous) => ({
          ...previous,
          returnPercentage: previous.returnPercentage.trim() || "5.00"
        }));
        return;
      }

      try {
        const activeInvestments = await fetchInvestmentsApi({
          investorId: Number(filters.investorId),
          status: "ACTIVE"
        });
        if (cancelled) return;

        const selectedRate = activeInvestments[0]?.monthlyReturnRate;
        setActiveInvestmentCount(activeInvestments.length);
        setGeneration((previous) => ({
          ...previous,
          returnPercentage: selectedRate ? selectedRate.toFixed(2) : "5.00"
        }));
      } catch {
        if (!cancelled) {
          setActiveInvestmentCount(null);
          setGeneration((previous) => ({
            ...previous,
            returnPercentage: previous.returnPercentage.trim() || "5.00"
          }));
        }
      }
    }

    void syncReturnPercentage();
    return () => {
      cancelled = true;
    };
  }, [filters.investorId]);

  async function generate() {
    if (filters.investorId && activeInvestmentCount === 0) {
      setError("No ACTIVE investment found for this investor in the selected period.");
      return;
    }

    const parsedFund = generation.companyFund.trim() ? Number(generation.companyFund) : null;
    const parsedProfit = Number(generation.companyProfit);
    const parsedReturnPercentage = generation.returnPercentage.trim() ? Number(generation.returnPercentage) : null;

    if (parsedFund !== null && (!Number.isFinite(parsedFund) || parsedFund <= 0)) {
      setError("Company fund must be greater than zero when provided.");
      return;
    }
    if (!Number.isFinite(parsedProfit) || parsedProfit <= 0) {
      setError("Please enter a valid monthly company profit greater than zero.");
      return;
    }
    if (parsedReturnPercentage !== null && (!Number.isFinite(parsedReturnPercentage) || parsedReturnPercentage <= 0)) {
      setError("Please enter a valid return percentage greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await generateMonthlyReturnsApi({
        investorId: filters.investorId ? Number(filters.investorId) : null,
        year: Number(filters.year),
        month: Number(filters.month),
        distributionMode: "COMPANY_PROFIT",
        companyFund: parsedFund,
        companyProfit: parsedProfit,
        returnPercentage: parsedReturnPercentage
      });
      await loadData();
    } catch (err) {
      setError(readErrorMessage(err, "Unable to generate monthly returns."));
    } finally {
      setSaving(false);
    }
  }

  async function applyAction(action: () => Promise<unknown>) {
    try {
      setSaving(true);
      setError(null);
      await action();
      await loadData();
    } catch (err) {
      setError(readErrorMessage(err, "Unable to process action."));
    } finally {
      setSaving(false);
    }
  }

  function startInlineEdit(item: InvestorMonthlyReturn) {
    setEditingReturnId(item.id);
    setEditingFinalAmount(item.finalAmount.toFixed(2));
  }

  function cancelInlineEdit() {
    setEditingReturnId(null);
    setEditingFinalAmount("");
  }

  async function saveInlineEdit(item: InvestorMonthlyReturn) {
    const parsedValue = Number(editingFinalAmount);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      setError("Please enter a valid final amount greater than zero.");
      return;
    }

    const roundedValue = Number(parsedValue.toFixed(2));
    const roundedCalculated = Number(item.calculatedAmount.toFixed(2));
    const clearOverride = Math.abs(roundedValue - roundedCalculated) < 0.01;

    await applyAction(() => updateMonthlyReturnApi(item.id, {
      overrideAmount: clearOverride ? null : roundedValue,
      overrideReason: clearOverride ? null : "Inline final amount edit",
      notes: "Final amount edited in monthly returns table"
    }));
    cancelInlineEdit();
  }

  return (
    <section className="admin-page">
      <PageHeader title="Monthly Returns" subtitle="Generate in DRAFT mode, then submit and approve in workflow." />

      <div className="filter-grid monthly-return-filters">
        <label>
          Investor
          <select value={filters.investorId} onChange={(event) => setFilters((p) => ({ ...p, investorId: event.target.value }))}>
            <option value="">All Investors</option>
            {investors.map((item) => <option key={item.id} value={item.id}>{item.investorCode} - {item.fullName}</option>)}
          </select>
        </label>
        <label>
          Year
          <select value={filters.year} onChange={(event) => setFilters((p) => ({ ...p, year: event.target.value }))}>
            {yearOptions.map((yearValue) => <option key={yearValue} value={yearValue}>{yearValue}</option>)}
          </select>
        </label>
        <label>
          Month
          <select value={filters.month} onChange={(event) => setFilters((p) => ({ ...p, month: event.target.value }))}>
            {monthOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label>
          Company Fund (optional)
          <input
            type="number"
            min={0.01}
            step="0.01"
            value={generation.companyFund}
            onChange={(event) => setGeneration((prev) => ({ ...prev, companyFund: event.target.value }))}
            placeholder="Auto if blank"
          />
        </label>
        <label>
          Monthly Company Profit
          <input
            type="number"
            min={0.01}
            step="0.01"
            value={generation.companyProfit}
            onChange={(event) => setGeneration((prev) => ({ ...prev, companyProfit: event.target.value }))}
          />
        </label>
        <label>
          Return Percentage (%)
          <input
            type="number"
            min={0.01}
            max={100}
            step="0.01"
            value={generation.returnPercentage}
            readOnly={Boolean(filters.investorId)}
            onChange={(event) => setGeneration((prev) => ({ ...prev, returnPercentage: event.target.value }))}
          />
        </label>
        <label>
          Generated Status
          <input value="DRAFT" readOnly className="readonly-field" />
        </label>
        <div className="form-actions monthly-return-actions">
          <button type="button" className="button-link w-full justify-center" onClick={() => void generate()} disabled={saving}>
            {saving ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading monthly returns...</p> : null}

      {!loading ? (
        <DataTable isEmpty={items.length === 0} emptyText="No return entries found for selected filters.">
          <thead>
            <tr>
              <th>Period</th>
              <th>Investor</th>
              <th>Investment</th>
              <th>Calculated</th>
              <th>Final</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isInlineEditing = editingReturnId === item.id;
              const canEditFinalAmount = item.status !== "PAID";

              return (
                <tr key={item.id}>
                  <td>{formatPeriod(item.periodYear, item.periodMonth)}</td>
                  <td>{item.investorCode} - {item.investorName}</td>
                  <td>{item.investmentReference}</td>
                  <td>{item.calculatedAmount.toFixed(2)}</td>
                  <td>
                    {isInlineEditing ? (
                      <input
                        className="inline-final-amount"
                        type="number"
                        min={0.01}
                        step="0.01"
                        value={editingFinalAmount}
                        onChange={(event) => setEditingFinalAmount(event.target.value)}
                      />
                    ) : (
                      item.finalAmount.toFixed(2)
                    )}
                  </td>
                  <td>{item.status}</td>
                  <td className="actions-cell">
                    {isInlineEditing ? (
                      <>
                        <button type="button" className="button-link button-small" onClick={() => void saveInlineEdit(item)} disabled={saving}>Save</button>
                        <button type="button" className="button-link button-small button-link-secondary" onClick={cancelInlineEdit} disabled={saving}>Cancel</button>
                      </>
                    ) : (
                      <ActionDropdown
                        triggerLabel="Change Status"
                        disabled={saving}
                        items={[
                          ...(canEditFinalAmount
                            ? [{
                              label: "Edit Final Amount",
                              icon: "\u270E",
                              onClick: () => startInlineEdit(item)
                            }]
                            : []),
                          {
                            label: "Submit",
                            icon: "\u21E7",
                            onClick: () => void applyAction(() => submitMonthlyReturnApi(item.id, { notes: "Submitted for approval" }))
                          },
                          {
                            label: "Approve",
                            icon: "\u2713",
                            onClick: () => void applyAction(() => approveMonthlyReturnApi(item.id, { notes: "Approved" }))
                          },
                          {
                            label: "Hold",
                            icon: "\u23F8",
                            onClick: () => void applyAction(() => holdMonthlyReturnApi(item.id, { notes: "On hold" }))
                          },
                          {
                            label: "Reject",
                            tone: "danger" as const,
                            icon: "\u2715",
                            onClick: () => void applyAction(() => rejectMonthlyReturnApi(item.id, { notes: "Rejected" }))
                          }
                        ]}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      ) : null}
    </section>
  );
}

