import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
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
  const recentOrders = useMemo(
    () => [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
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
            <Link className="button-link" to="/leads/new">Add Lead</Link>
            <Link className="button-link" to="/orders">Open Orders</Link>
          </>
        )}
      />

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {loading ? <p>Loading dashboard...</p> : null}

      {!loading ? (
        <>
          <div className="kpi-grid kpi-grid-wide">
            <article className="kpi-card">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </article>
            <article className="kpi-card">
              <span>Pending Review</span>
              <strong>{pendingOrders}</strong>
            </article>
            <article className="kpi-card">
              <span>Products</span>
              <strong>{products.length}</strong>
            </article>
            <article className="kpi-card">
              <span>Leads</span>
              <strong>{leads.length}</strong>
            </article>
            <article className="kpi-card">
              <span>Inquiries</span>
              <strong>{inquiries.length}</strong>
            </article>
          </div>

          <div className="dashboard-panels">
            <article className="admin-form-card">
              <h3>Recent Orders</h3>
              {recentOrders.length === 0 ? <p>No orders yet.</p> : null}
              <div className="admin-list compact-list">
                {recentOrders.map((order) => (
                  <article key={order.id} className="admin-list-card">
                    <div>
                      <h4>{order.orderNumber}</h4>
                      <p>{order.companyName}</p>
                    </div>
                    <div className="order-meta">
                      <span className="status-pill">{formatStatusLabel(order.status)}</span>
                      <small>{formatDate(order.createdAt)}</small>
                      <Link className="button-link button-small" to={`/orders/${order.id}`}>Open</Link>
                    </div>
                  </article>
                ))}
              </div>
            </article>

            <article className="admin-form-card">
              <h3>Status Mix</h3>
              <div className="status-grid">
                {(["PENDING_REVIEW", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as Order["status"][])
                  .map((status) => (
                    <div key={status} className="status-chip">
                      <span>{formatStatusLabel(status)}</span>
                      <strong>{orders.filter((order) => order.status === status).length}</strong>
                    </div>
                  ))}
              </div>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}
