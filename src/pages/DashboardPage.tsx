import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { fetchAdminProductsApi, fetchInquiriesApi, fetchLeadsApi, fetchOrdersApi, readErrorMessage } from "../lib/api";
import type { AdminProduct, Inquiry, Lead, Order } from "../types/domain";

function formatStatusLabel(status: Order["status"]) {
  return status.split("_").join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [nextOrders, nextProducts, nextLeads, nextInquiries] = await Promise.all([
          fetchOrdersApi(),
          fetchAdminProductsApi(),
          fetchLeadsApi({}),
          fetchInquiriesApi({})
        ]);
        setOrders(nextOrders);
        setProducts(nextProducts);
        setLeads(nextLeads);
        setInquiries(nextInquiries);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load dashboard metrics."));
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "PENDING_REVIEW").length,
    [orders]
  );

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "DELIVERED").length,
    [orders]
  );

  const cancelledOrders = useMemo(
    () => orders.filter((order) => order.status === "CANCELLED").length,
    [orders]
  );

  const recentOrders = useMemo(
    () => [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [orders]
  );

  const statusSummary = useMemo(
    () =>
      (["PENDING_REVIEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as Order["status"][]).map((status) => ({
        status,
        count: orders.filter((order) => order.status === status).length
      })),
    [orders]
  );

  return (
    <section className="admin-page">
      <PageHeader
        title="Dashboard"
        subtitle="Track operations, pending work, and catalog readiness from one view."
        actions={(
          <>
            <Link className="button-link" to="/products/new">Create Product</Link>
            <Link className="button-link button-link-secondary" to="/leads/new">Add Lead</Link>
            <Link className="button-link button-link-secondary" to="/orders">Open Orders</Link>
          </>
        )}
      />

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {loading ? <p>Loading dashboard...</p> : null}

      {!loading ? (
        <>
          <div className="dashboard-stat-grid">
            <StatCard
              label="Total Orders"
              value={orders.length}
              hint={`${pendingOrders} pending review`}
              tone={pendingOrders > 0 ? "warning" : "neutral"}
              icon={<OrdersIcon />}
            />
            <StatCard
              label="Leads"
              value={leads.length}
              hint="Open sales opportunities"
              tone="brand"
              icon={<LeadsIcon />}
            />
            <StatCard
              label="Products"
              value={products.length}
              hint="Active catalog entries"
              tone="success"
              icon={<ProductsIcon />}
            />
            <StatCard
              label="Inquiries"
              value={inquiries.length}
              hint="Customer and partner intake"
              tone="neutral"
              icon={<InquiriesIcon />}
            />
          </div>

          <div className="dashboard-highlights-grid">
            <article className="dashboard-highlight-card">
              <div className="dashboard-highlight-label">Delivered Orders</div>
              <div className="dashboard-highlight-value">{deliveredOrders}</div>
            </article>
            <article className="dashboard-highlight-card warning">
              <div className="dashboard-highlight-label">Pending Review</div>
              <div className="dashboard-highlight-value">{pendingOrders}</div>
            </article>
            <article className="dashboard-highlight-card danger">
              <div className="dashboard-highlight-label">Cancelled Orders</div>
              <div className="dashboard-highlight-value">{cancelledOrders}</div>
            </article>
          </div>

          <div className="dashboard-panels gap-6">
            <article className="admin-form-card">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3>Recent Orders</h3>
                <Link className="button-link button-small button-link-secondary" to="/orders">View All</Link>
              </div>
              <DataTable isEmpty={recentOrders.length === 0} emptyText="No orders yet.">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Total</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-semibold text-text-primary">{order.orderNumber}</td>
                      <td>{order.companyName}</td>
                      <td>
                        <span className={`status-pill ${statusToneClass(order.status)}`}>{formatStatusLabel(order.status)}</span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.totalAmount === null ? "Pending" : order.totalAmount.toFixed(2)}</td>
                      <td>
                        <Link className="button-link button-small" to={`/orders/${order.id}`}>Open</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </article>

            <article className="admin-form-card">
              <h3 className="mb-4">Status Summary</h3>
              <div className="dashboard-status-grid">
                {statusSummary.map(({ status, count }) => (
                  <article key={status} className={`dashboard-status-card ${statusToneClass(status)}`}>
                    <div className="dashboard-status-label">{formatStatusLabel(status)}</div>
                    <div className="dashboard-status-value">{count}</div>
                  </article>
                ))}
              </div>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}

function statusToneClass(status: Order["status"]) {
  if (status === "DELIVERED") return "status-pill-success";
  if (status === "CANCELLED") return "status-pill-danger";
  if (status === "PENDING_REVIEW" || status === "PROCESSING") return "status-pill-warning";
  return "status-pill-neutral";
}

function OrdersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LeadsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 18c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 8h3M20 6.5v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ProductsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8.5L12 4l8 4.5-8 4.5-8-4.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 8.5V16l8 4 8-4V8.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function InquiriesIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 6h14v9H9l-4 3V6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
