import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { fetchAdminCustomersWithFiltersApi, readErrorMessage } from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
import type { AdminCustomer } from "../types/domain";

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function CustomerListPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "ACTIVE" | "INACTIVE">("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const nextCustomers = await fetchAdminCustomersWithFiltersApi({
          search: searchTerm,
          status: statusFilter
        });
        setCustomers(nextCustomers);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load customers."));
      } finally {
        setLoading(false);
      }
    }

    void loadCustomers();
  }, [searchTerm, statusFilter]);

  const visibleCustomers = useMemo(() => customers, [customers]);

  return (
    <section className="admin-page">
      <PageHeader
        title="Customers"
        subtitle="Review customer profiles, contact details, order activity, and account status."
      />

      <div className="filter-grid">
        <label>
          Search Customers
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, company, email, phone, city, or state"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "" | "ACTIVE" | "INACTIVE")}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
      </div>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading customers..." /> : null}

      {!loading ? (
        <DataTable recordCount={visibleCustomers.length} isEmpty={visibleCustomers.length === 0} emptyText="No customers found.">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Last Order</th>
              <th>Status</th>
              <th>Updated</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>
                  <Link className="record-id-link" to={`/customers/${customer.id}/edit`}>
                    {customer.id}
                  </Link>
                </td>
                <td>{customer.fullName}</td>
                <td>{customer.companyName}</td>
                <td>
                  <div>{customer.phone}</div>
                  <div className="table-muted">{customer.email}</div>
                </td>
                <td>{`${customer.city}, ${customer.state}`}</td>
                <td>{customer.totalOrders}</td>
                <td>
                  <div>{customer.lastOrderNumber ?? "-"}</div>
                  <div className="table-muted">{formatDate(customer.lastOrderAt)}</div>
                </td>
                <td>
                  <StatusBadge
                    label={formatEnumLabel(customer.status)}
                    tone={customer.active ? "success" : "warning"}
                  />
                </td>
                <td>{formatDate(customer.updatedAt)}</td>
                <td className="actions-cell">
                  <Link className="button-link button-link-secondary button-small" to={`/customers/${customer.id}/edit`}>
                    View
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
