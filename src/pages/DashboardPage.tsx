import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import { DataTable } from "../components/DataTable";
import {
  ColumnChart,
  HorizontalBarChart,
  type ChartDataPoint
} from "../components/OperationalCharts";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { fetchAdminProductsApi, fetchInquiriesApi, fetchLeadsApi, fetchOrdersApi, readErrorMessage } from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
import type { AdminProduct, Inquiry, Lead, Order } from "../types/domain";

const orderStatuses: Order["status"][] = [
  "PENDING_REVIEW",
  "QUOTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];

type DashboardData = {
  orders: Order[];
  products: AdminProduct[];
  leads: Lead[];
  inquiries: Inquiry[];
};

const emptyDashboardData: DashboardData = {
  orders: [],
  products: [],
  leads: [],
  inquiries: []
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyDashboardData);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [orders, products, leads, inquiries] = await Promise.all([
          fetchOrdersApi(),
          fetchAdminProductsApi(),
          fetchLeadsApi({}),
          fetchInquiriesApi({})
        ]);
        setData({ orders, products, leads, inquiries });
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load dashboard metrics."));
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  return (
    <section className="admin-page">
      <DashboardHeader />
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading dashboard..." /> : <DashboardContent data={data} />}
    </section>
  );
}

function DashboardHeader() {
  return (
    <PageHeader
      eyebrow="Operations control centre"
      title="Operations dashboard"
      subtitle="Monitor order flow, sales workload, catalog readiness, and work requiring attention."
      context={<span>Use the queue to focus the team on the next action.</span>}
      actions={(
        <>
          <Link className="button-link" to="/orders">
            Review orders
            <ArrowForwardRoundedIcon fontSize="small" />
          </Link>
          <Link className="button-link button-link-secondary" to="/products/new">
            <AddRoundedIcon fontSize="small" />
            Add product
          </Link>
        </>
      )}
    />
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  const metrics = useMemo(() => getDashboardMetrics(data), [data]);
  const orderActivity = useMemo(() => getRecentOrderActivity(data.orders), [data.orders]);
  const orderDistribution = useMemo(() => getOrderDistribution(data.orders), [data.orders]);
  const recentOrders = useMemo(() => getRecentOrders(data.orders), [data.orders]);

  return (
    <>
      <DashboardMetricCards metrics={metrics} />
      <DashboardOverview metrics={metrics} />
      <div className="dashboard-primary-grid">
        <ChartPanel title="Order activity" description="Orders created during the last seven days.">
          <ColumnChart
            data={orderActivity}
            emptyText="New orders will appear here as they are created."
            ariaLabel="Orders created during the last seven days"
          />
        </ChartPanel>
        <WorkQueue metrics={metrics} />
      </div>
      <div className="dashboard-secondary-grid">
        <RecentOrders orders={recentOrders} />
        <ChartPanel title="Order lifecycle" description="Current distribution across fulfilment stages.">
          <HorizontalBarChart
            data={orderDistribution}
            emptyText="Order stages will appear after the first order is placed."
            ariaLabel="Current orders grouped by lifecycle status"
          />
        </ChartPanel>
      </div>
    </>
  );
}

function DashboardOverview({ metrics }: { metrics: DashboardMetrics }) {
  const items = [
    { label: "Order review", detail: metrics.pendingReview === 0 ? "No orders waiting" : `${metrics.pendingReview} order${metrics.pendingReview === 1 ? "" : "s"} need review`, tone: metrics.pendingReview > 0 ? "attention" : "clear" },
    { label: "Customer follow-up", detail: metrics.unassignedInquiries === 0 ? "All inquiries assigned" : `${metrics.unassignedInquiries} ${metrics.unassignedInquiries === 1 ? "inquiry" : "inquiries"} without an owner`, tone: metrics.unassignedInquiries > 0 ? "attention" : "clear" },
    { label: "Catalog health", detail: metrics.inactiveProducts === 0 ? "All products active" : `${metrics.inactiveProducts} inactive listing${metrics.inactiveProducts === 1 ? "" : "s"}`, tone: metrics.inactiveProducts > 0 ? "attention" : "clear" }
  ];

  return (
    <section className="dashboard-overview" aria-label="Operations overview">
      <div className="dashboard-overview-heading">
        <span>Today’s focus</span>
        <p>Review the signals below before moving into the work queue.</p>
      </div>
      <div className="dashboard-overview-items">
        {items.map((item) => (
          <div className="dashboard-overview-item" key={item.label}>
            <span className={`dashboard-overview-dot dashboard-overview-dot-${item.tone}`} aria-hidden="true" />
            <div>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type DashboardMetrics = {
  openOrders: number;
  pendingReview: number;
  activeProducts: number;
  inactiveProducts: number;
  activeLeads: number;
  qualifiedLeads: number;
  openInquiries: number;
  unassignedInquiries: number;
};

function DashboardMetricCards({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="dashboard-stat-grid">
      <StatCard
        label="Open orders"
        value={metrics.openOrders}
        hint={`${metrics.pendingReview} waiting for review`}
        tone={metrics.pendingReview > 0 ? "warning" : "neutral"}
        icon={<ShoppingCartRoundedIcon fontSize="small" />}
      />
      <StatCard
        label="Active leads"
        value={metrics.activeLeads}
        hint={`${metrics.qualifiedLeads} qualified opportunities`}
        tone="brand"
        icon={<CampaignRoundedIcon fontSize="small" />}
      />
      <StatCard
        label="Active products"
        value={metrics.activeProducts}
        hint={`${metrics.inactiveProducts} inactive catalog entries`}
        tone="success"
        icon={<Inventory2RoundedIcon fontSize="small" />}
      />
      <StatCard
        label="Open inquiries"
        value={metrics.openInquiries}
        hint={`${metrics.unassignedInquiries} need an owner`}
        tone={metrics.unassignedInquiries > 0 ? "warning" : "neutral"}
        icon={<ManageSearchRoundedIcon fontSize="small" />}
      />
    </div>
  );
}

function WorkQueue({ metrics }: { metrics: DashboardMetrics }) {
  const items = [
    { label: "Orders waiting for review", value: metrics.pendingReview, to: "/orders" },
    { label: "Unassigned inquiries", value: metrics.unassignedInquiries, to: "/inquiries" },
    { label: "Qualified leads", value: metrics.qualifiedLeads, to: "/leads" },
    { label: "Inactive products", value: metrics.inactiveProducts, to: "/products" }
  ];

  return (
    <section className="dashboard-panel">
      <PanelHeader title="Work queue" description="Records that may need action from the operations team." />
      <div className="work-queue-list">
        {items.map((item) => (
          <Link className="work-queue-item" to={item.to} key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <ArrowForwardRoundedIcon fontSize="small" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function RecentOrders({ orders }: { orders: Order[] }) {
  return (
    <section className="dashboard-panel dashboard-recent-orders">
      <PanelHeader
        title="Recent orders"
        description="Latest buyer orders and their current state."
        action={<Link className="text-action-link" to="/orders">View all orders</Link>}
      />
      <DataTable isEmpty={orders.length === 0} emptyText="No orders have been created yet." className="dashboard-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Buyer</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><Link className="record-id-link" to={`/orders/${order.id}`}>{order.orderNumber}</Link></td>
              <td>{order.companyName || order.fullName}</td>
              <td><StatusBadge label={formatEnumLabel(order.status)} tone={getStatusTone(order.status)} /></td>
              <td>{order.totalAmount === null ? "Pending quote" : formatMoney(order.totalAmount, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </section>
  );
}

function ChartPanel({ title, description, children }: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="dashboard-panel">
      <PanelHeader title={title} description={description} />
      {children}
    </section>
  );
}

function PanelHeader({ title, description, action }: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="dashboard-panel-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

function getDashboardMetrics(data: DashboardData): DashboardMetrics {
  return {
    openOrders: data.orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length,
    pendingReview: data.orders.filter((order) => order.status === "PENDING_REVIEW").length,
    activeProducts: data.products.filter((product) => product.status === "ACTIVE").length,
    inactiveProducts: data.products.filter((product) => product.status === "INACTIVE").length,
    activeLeads: data.leads.filter((lead) => !["DISQUALIFIED", "CONVERTED", "CLOSED"].includes(lead.status)).length,
    qualifiedLeads: data.leads.filter((lead) => lead.status === "QUALIFIED").length,
    openInquiries: data.inquiries.filter((inquiry) => !["CONVERTED", "CLOSED"].includes(inquiry.status)).length,
    unassignedInquiries: data.inquiries.filter(
      (inquiry) => !["CONVERTED", "CLOSED"].includes(inquiry.status) && !inquiry.assignedTo
    ).length
  };
}

function getRecentOrders(orders: Order[]) {
  return [...orders]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 6);
}

function getRecentOrderActivity(orders: Order[]): ChartDataPoint[] {
  const today = startOfDay(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    return {
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      value: orders.filter((order) => {
        const createdAt = new Date(order.createdAt);
        return createdAt >= date && createdAt < nextDate;
      }).length
    };
  });
}

function getOrderDistribution(orders: Order[]): ChartDataPoint[] {
  return orderStatuses.map((status) => ({
    label: formatEnumLabel(status),
    value: orders.filter((order) => order.status === status).length,
    tone: getChartTone(status)
  }));
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
}

function getStatusTone(status: Order["status"]) {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
  if (status === "PENDING_REVIEW" || status === "PROCESSING") return "warning";
  return "neutral";
}

function getChartTone(status: Order["status"]): ChartDataPoint["tone"] {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELLED") return "danger";
  if (status === "PENDING_REVIEW" || status === "PROCESSING") return "warning";
  return "brand";
}
