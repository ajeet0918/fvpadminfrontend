import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { fetchOrdersApi, readErrorMessage } from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
import type { Order } from "../types/domain";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function QuotesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setOrders(await fetchOrdersApi());
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load quotes."));
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, []);

  const quoteCandidates = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return orders
      .filter((order) => order.status === "PENDING_REVIEW" || order.status === "QUOTED")
      .filter((order) => {
        if (!normalized) return true;
        return (
          order.orderNumber.toLowerCase().includes(normalized) ||
          order.companyName.toLowerCase().includes(normalized) ||
          order.fullName.toLowerCase().includes(normalized)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm]);

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === "PENDING_REVIEW").length,
    [orders]
  );
  const quotedCount = useMemo(
    () => orders.filter((order) => order.status === "QUOTED").length,
    [orders]
  );

  return (
    <section className="admin-page">
      <PageHeader
        title="Quotes"
        subtitle="Prepare new quotes and revise already quoted orders from one workspace."
      />

      <div className="kpi-grid quote-kpi-grid">
        <article className="kpi-card">
          <span>Pending Quote</span>
          <strong>{pendingCount}</strong>
        </article>
        <article className="kpi-card">
          <span>Already Quoted</span>
          <strong>{quotedCount}</strong>
        </article>
      </div>

      <div className="filter-grid">
        <label>
          Search Orders
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by order number, company, or customer"
          />
        </label>
      </div>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading quote queue..." /> : null}

      {!loading ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Company</th>
                <th>Status</th>
                <th>Quote Ref</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {quoteCandidates.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.companyName}</td>
                  <td><span className="status-pill">{formatEnumLabel(order.status)}</span></td>
                  <td>{order.quoteReference ?? "Not created"}</td>
                  <td>{formatDate(order.quotedAt ?? order.createdAt)}</td>
                  <td>
                    <Link to={`/orders/${order.id}`}>
                      {order.status === "PENDING_REVIEW" ? "Prepare Quote" : "Edit Quote"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quoteCandidates.length === 0 ? <p className="empty-state">No quote-ready orders found.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
