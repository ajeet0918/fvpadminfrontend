import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import {
  approveInvestorPayoutApi,
  createInvestorPayoutRequestApi,
  downloadInvestorReceiptFileApi,
  fetchInvestorPayoutsApi,
  fetchInvestorsApi,
  fetchMonthlyReturnsApi,
  generateInvestorReceiptApi,
  markInvestorPayoutPaidApi,
  readErrorMessage,
  rejectInvestorPayoutApi
} from "../lib/api";
import type { InvestorAccount, InvestorMonthlyReturn, InvestorPayout, InvestorPayoutStatus } from "../types/domain";

const payoutStatuses: InvestorPayoutStatus[] = ["PENDING_APPROVAL", "APPROVED", "PAID", "REJECTED", "FAILED"];

export function PayoutCenterPage() {
  const [payouts, setPayouts] = useState<InvestorPayout[]>([]);
  const [investors, setInvestors] = useState<InvestorAccount[]>([]);
  const [approvedReturns, setApprovedReturns] = useState<InvestorMonthlyReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [investorId, setInvestorId] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvestorPayoutStatus | "">("");
  const [selectedReturnIds, setSelectedReturnIds] = useState<number[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      const [nextInvestors, nextReturns, nextPayouts] = await Promise.all([
        fetchInvestorsApi({}),
        fetchMonthlyReturnsApi({ investorId: investorId ? Number(investorId) : null, status: "APPROVED" }),
        fetchInvestorPayoutsApi({ investorId: investorId ? Number(investorId) : null, status: statusFilter })
      ]);
      setInvestors(nextInvestors);
      setApprovedReturns(nextReturns);
      setPayouts(nextPayouts);
    } catch (err) {
      setError(readErrorMessage(err, "Unable to load payout data."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [investorId, statusFilter]);

  const groupedReturns = useMemo(() => {
    const map = new Map<number, InvestorMonthlyReturn[]>();
    for (const item of approvedReturns) {
      const current = map.get(item.investorId) ?? [];
      current.push(item);
      map.set(item.investorId, current);
    }
    return map;
  }, [approvedReturns]);

  const visibleReturns = useMemo(() => {
    if (!investorId) return [];
    return groupedReturns.get(Number(investorId)) ?? [];
  }, [groupedReturns, investorId]);

  async function perform(action: () => Promise<unknown>) {
    try {
      setSaving(true);
      setError(null);
      await action();
      await loadData();
    } catch (err) {
      setError(readErrorMessage(err, "Payout action failed."));
    } finally {
      setSaving(false);
    }
  }

  async function handleReceiptDownload(receiptNumber: string) {
    try {
      setSaving(true);
      setError(null);
      const blob = await downloadInvestorReceiptFileApi(receiptNumber);
      const fileUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = `${receiptNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setError(readErrorMessage(err, "Unable to download receipt."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader title="Payout & Receipt Center" subtitle="Create payout batches, complete approvals, and download generated receipts." />

      <div className="filter-grid">
        <label>
          Investor
          <select value={investorId} onChange={(event) => {
            setInvestorId(event.target.value);
            setSelectedReturnIds([]);
          }}>
            <option value="">All Investors</option>
            {investors.map((item) => <option key={item.id} value={item.id}>{item.investorCode} - {item.fullName}</option>)}
          </select>
        </label>
        <label>
          Payout Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InvestorPayoutStatus | "")}>
            <option value="">All</option>
            {payoutStatuses.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>

      {investorId ? (
        <article className="admin-form-card">
          <h3>Generate Payout</h3>
          <p>Select approved monthly returns for payout batch creation.</p>
          <div className="admin-list">
            {visibleReturns.map((item) => (
              <label key={item.id} className="inline-checkbox">
                <input
                  type="checkbox"
                  checked={selectedReturnIds.includes(item.id)}
                  onChange={(event) => {
                    setSelectedReturnIds((current) => event.target.checked
                      ? [...current, item.id]
                      : current.filter((id) => id !== item.id));
                  }}
                />
                {item.periodYear}-{String(item.periodMonth).padStart(2, "0")} | {item.investmentReference} | {item.finalAmount.toFixed(2)}
              </label>
            ))}
          </div>
          <div className="row">
            <button
              type="button"
              disabled={saving || selectedReturnIds.length === 0}
              onClick={() => void perform(() => createInvestorPayoutRequestApi({
                investorId: Number(investorId),
                monthlyReturnIds: selectedReturnIds,
                notes: "Created from payout approval center"
              }))}
            >
              {saving ? "Generating..." : "Generate Payout"}
            </button>
          </div>
        </article>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading payout data...</p> : null}

      {!loading ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payout Ref</th>
                <th>Investor</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Transaction</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {payouts.map((item) => (
                <tr key={item.id}>
                  <td>{item.payoutReference}</td>
                  <td>{item.investorCode} - {item.investorName}</td>
                  <td>{item.totalAmount.toFixed(2)}</td>
                  <td>{item.status}</td>
                  <td>{item.transactionReference ?? "-"}</td>
                  <td className="actions-cell">
                    {!item.receiptNumber ? (
                      <button
                        type="button"
                        className="button-link button-small button-muted"
                        onClick={() => void perform(() => generateInvestorReceiptApi(item.id))}
                      >
                        Generate Receipt
                      </button>
                    ) : null}
                    {item.receiptNumber ? (
                      <button type="button" className="button-link button-small button-muted" onClick={() => void handleReceiptDownload(item.receiptNumber!)}>
                        Download PDF
                      </button>
                    ) : null}
                    <button type="button" className="button-link button-small" onClick={() => void perform(() => approveInvestorPayoutApi(item.id, { notes: "Approved from payout center" }))}>Approve</button>
                    <button type="button" className="button-link button-small button-danger" onClick={() => void perform(() => rejectInvestorPayoutApi(item.id, { notes: "Rejected from payout center" }))}>Reject</button>
                    <button
                      type="button"
                      className="button-link button-small"
                      onClick={() => {
                        const paymentChannel = window.prompt("Payment channel", item.paymentChannel ?? "Cashfree");
                        if (!paymentChannel) return;
                        const transactionReference = window.prompt("Transaction reference", item.transactionReference ?? "");
                        if (!transactionReference) return;
                        void perform(() => markInvestorPayoutPaidApi(item.id, {
                          paymentChannel,
                          transactionReference,
                          notes: "Marked paid from payout center"
                        }));
                      }}
                    >
                      Mark Paid
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payouts.length === 0 ? <p className="empty-state">No payouts found.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
