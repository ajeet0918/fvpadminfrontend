import { useEffect, useState } from "react";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { downloadInvestorReceiptFileApi, fetchInvestorReceiptsApi, fetchInvestorsApi, readErrorMessage } from "../lib/api";
import type { InvestorAccount, InvestorReceipt } from "../types/domain";

export function ReceiptCenterPage() {
  const [items, setItems] = useState<InvestorReceipt[]>([]);
  const [investors, setInvestors] = useState<InvestorAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [investorId, setInvestorId] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [nextInvestors, nextReceipts] = await Promise.all([
          fetchInvestorsApi({}),
          fetchInvestorReceiptsApi({ investorId: investorId ? Number(investorId) : null })
        ]);
        setInvestors(nextInvestors);
        setItems(nextReceipts);
      } catch (err) {
        setError(readErrorMessage(err, "Unable to load receipts."));
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, [investorId]);

  async function handleDownload(receiptNumber: string) {
    try {
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
    }
  }

  return (
    <section className="admin-page">
      <PageHeader title="Receipt Center" subtitle="View payout receipts and download generated records for investors." />

      <div className="filter-grid">
        <label>
          Investor
          <select value={investorId} onChange={(event) => setInvestorId(event.target.value)}>
            <option value="">All Investors</option>
            {investors.map((item) => <option key={item.id} value={item.id}>{item.investorCode} - {item.fullName}</option>)}
          </select>
        </label>
      </div>

      {error ? <p className="error-text">{error}</p> : null}
      {loading ? <p>Loading receipts...</p> : null}

      {!loading ? (
        <DataTable isEmpty={items.length === 0} emptyText="No receipts available.">
          <thead>
            <tr>
              <th>Receipt Number</th>
              <th>Payout Ref</th>
              <th>Investor</th>
              <th>Amount</th>
              <th>Generated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.receiptNumber}</td>
                <td>{item.payoutReference}</td>
                <td>{item.investorCode} - {item.investorName}</td>
                <td>{item.payoutAmount.toFixed(2)}</td>
                <td>{new Date(item.generatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td>
                  <button
                    type="button"
                    className="button-link button-small"
                    onClick={() => void handleDownload(item.receiptNumber)}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : null}
    </section>
  );
}
