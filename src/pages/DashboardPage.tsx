import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { StatCard } from "../components/StatCard";
import { fetchAdminProductsApi, fetchInquiriesApi, fetchLeadsApi, fetchOrdersApi, readErrorMessage } from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
import type { AdminProduct, Inquiry, Lead, Order } from "../types/domain";

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency
  }).format(amount);
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

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "ACTIVE").length,
    [products]
  );

  const recentOrders = useMemo(
    () => [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
    [orders]
  );

  const statusSummary = useMemo(
    () =>
      (["PENDING_REVIEW", "QUOTED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as Order["status"][]).map((status) => ({
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

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading dashboard..." /> : null}

      {!loading ? (
        <>
          <div className="dashboard-stat-grid">
            <StatCard
              label="Total Orders"
              value={orders.length}
              hint={`${pendingOrders} pending review`}
              tone={pendingOrders > 0 ? "warning" : "neutral"}
              icon={<ShoppingCartRoundedIcon fontSize="small" />}
            />
            <StatCard
              label="Leads"
              value={leads.length}
              hint="Open sales opportunities"
              tone="brand"
              icon={<CampaignRoundedIcon fontSize="small" />}
            />
            <StatCard
              label="Products"
              value={products.length}
              hint={`${activeProducts} active catalog entries`}
              tone="success"
              icon={<Inventory2RoundedIcon fontSize="small" />}
            />
            <StatCard
              label="Inquiries"
              value={inquiries.length}
              hint="Customer and partner intake"
              tone="neutral"
              icon={<ManageSearchRoundedIcon fontSize="small" />}
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
            <section className="dashboard-section">
              <div className="dashboard-section-header">
                <h3>Recent Orders</h3>
                <Link className="button-link button-small button-link-secondary" to="/orders">View All</Link>
              </div>
              <DataTable isEmpty={recentOrders.length === 0} emptyText="No orders yet.">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <Link className="record-id-link" to={`/orders/${order.id}`}>{order.orderNumber}</Link>
                      </td>
                      <td>{order.companyName}</td>
                      <td>
                        <span className={`status-pill ${statusToneClass(order.status)}`}>{formatEnumLabel(order.status)}</span>
                      </td>
                      <td>{order.totalAmount === null ? "Pending quote" : formatMoney(order.totalAmount, order.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </section>

            <section className="dashboard-section">
              <h3 className="mb-4">Status Summary</h3>
              <div className="dashboard-status-grid">
                {statusSummary.map(({ status, count }) => (
                  <article key={status} className={`dashboard-status-card ${statusToneClass(status)}`}>
                    <div className="dashboard-status-label">{formatEnumLabel(status)}</div>
                    <div className="dashboard-status-value">{count}</div>
                  </article>
                ))}
              </div>
            </section>
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
