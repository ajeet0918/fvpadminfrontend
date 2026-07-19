import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { fetchOrdersApi, readErrorMessage } from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
import type { Order } from "../types/domain";

const statusOptions: Array<Order["status"] | "ALL"> = [
  "ALL",
  "PENDING_REVIEW",
  "QUOTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency
  }).format(amount);
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("ALL");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      setOrders(await fetchOrdersApi());
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to load orders."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

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

  function getStatusTone(status: Order["status"]) {
    if (status === "PENDING_REVIEW" || status === "PROCESSING") return "warning";
    if (status === "CANCELLED") return "danger";
    return "success";
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Orders"
        subtitle="Review customer orders, payment state, fulfilment progress, and totals."
        actions={
          <button type="button" className="button-link button-link-secondary" onClick={() => void loadOrders()} disabled={loading}>
            <RefreshRoundedIcon fontSize="small" />
            Refresh
          </button>
        }
      />

      <div className="table-toolbar">
        <label>
          Search
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value.trimStart())}
            placeholder="Search by ID, name, or customer"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All Statuses" : formatEnumLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading orders..." /> : null}

      {!loading ? (
        <DataTable isEmpty={filteredOrders.length === 0} emptyText="No orders match your filters.">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Date</th>
              <th>Amount</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link className="record-id-link" to={`/orders/${order.id}`}>
                    {order.orderNumber}
                  </Link>
                </td>
                <td>{order.companyName || order.fullName}</td>
                <td>
                  <StatusBadge label={formatEnumLabel(order.status)} tone={getStatusTone(order.status)} />
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.totalAmount === null ? "Pending quote" : formatMoney(order.totalAmount, order.currency)}</td>
                <td className="actions-cell">
                  <Link className="button-link button-link-secondary button-small" to={`/orders/${order.id}`}>
                    Review
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : null}
    </section>
  );
}
