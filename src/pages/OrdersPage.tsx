import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { fetchOrdersApi, readErrorMessage } from "../lib/api";
import type { Order } from "../types/domain";

const statusOptions: Array<Order["status"] | "ALL"> = [
  "ALL",
  "PENDING_REVIEW",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];

function formatStatusLabel(status: Order["status"]) {
  return status.split("_").join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("ALL");

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setOrders(await fetchOrdersApi());
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load orders."));
      } finally {
        setLoading(false);
      }
    }

    void loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return orders
      .filter((order) => statusFilter === "ALL" || order.status === statusFilter)
      .filter((order) => {
        if (!normalizedSearch) return true;
        return (
          order.orderNumber.toLowerCase().includes(normalizedSearch) ||
          order.companyName.toLowerCase().includes(normalizedSearch) ||
          order.fullName.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, searchTerm, statusFilter]);

  return (
    <section className="admin-page">
      <PageHeader
        title="Orders"
        subtitle="Search, filter, and manage product-priced orders with clean status operations."
      />

      <div className="filter-grid">
        <label>
          Search
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by order number, company, or customer"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All Statuses" : formatStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {loading ? <p>Loading orders...</p> : null}

      {!loading ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Company</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.companyName}</td>
                  <td>
                    <span className="status-pill">{formatStatusLabel(order.status)}</span>
                  </td>
                  <td>{order.totalAmount === null ? "Pending Pricing" : order.totalAmount.toFixed(2)}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <Link className="button-link button-small" to={`/orders/${order.id}`}>
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 ? <p className="empty-state">No orders match your filters.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
