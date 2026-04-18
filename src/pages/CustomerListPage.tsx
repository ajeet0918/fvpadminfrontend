import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { fetchAdminCustomersWithFiltersApi, readErrorMessage } from "../lib/api";
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
        subtitle="View and update customer profiles linked to order activity."
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
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </label>
      </div>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {loading ? <p>Loading customers...</p> : null}

      {!loading ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Company</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Last Order</th>
                <th>Status</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <tr key={customer.id}>
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
                      label={customer.status}
                      tone={customer.active ? "success" : "warning"}
                    />
                  </td>
                  <td>{formatDate(customer.updatedAt)}</td>
                  <td>
                    <Link className="button-link button-small" to={`/customers/${customer.id}/edit`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleCustomers.length === 0 ? <p className="empty-state">No customers found.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
