import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { fetchLeadsApi, readErrorMessage } from "../lib/api";
import type { Lead, LeadStatus } from "../types/domain";

const statusOptions: Array<LeadStatus | ""> = [
  "",
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "DISQUALIFIED",
  "CONVERTED",
  "CLOSED"
];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function leadTone(status: LeadStatus) {
  if (status === "CLOSED" || status === "DISQUALIFIED") return "danger";
  if (status === "QUALIFIED" || status === "CONVERTED") return "success";
  if (status === "CONTACTED") return "warning";
  return "neutral";
}

export function LeadListPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true);
        const result = await fetchLeadsApi({
          search: searchTerm,
          status: statusFilter,
          source: sourceFilter,
          assignedTo: assignedToFilter
        });
        setLeads(result);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load leads."));
      } finally {
        setLoading(false);
      }
    }

    void loadLeads();
  }, [searchTerm, statusFilter, sourceFilter, assignedToFilter]);

  const list = useMemo(() => leads, [leads]);

  return (
    <section className="admin-page">
      <PageHeader
        title="Lead List"
        subtitle="Track pipeline-ready contacts from website and inquiry conversions."
        actions={<Link className="button-link" to="/leads/new">Create Lead</Link>}
      />

      <div className="filter-grid filter-grid-4">
        <label>
          Search
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="name, email, phone, company"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as LeadStatus | "")}>
            <option value="">All Statuses</option>
            {statusOptions.filter(Boolean).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Source
          <input
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            placeholder="WEBSITE_CONTACT"
          />
        </label>
        <label>
          Assigned To
          <input
            value={assignedToFilter}
            onChange={(event) => setAssignedToFilter(event.target.value)}
            placeholder="owner"
          />
        </label>
      </div>

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {loading ? <p>Loading leads...</p> : null}

      {!loading ? (
        <DataTable isEmpty={list.length === 0} emptyText="No leads found.">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Company</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Source</th>
              <th>Assigned</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {list.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <Link className="record-id-link" to={`/leads/${lead.id}/edit`}>
                    {lead.id}
                  </Link>
                </td>
                <td>{lead.fullName}</td>
                <td>{lead.companyName ?? "-"}</td>
                <td>{lead.phone}</td>
                <td>
                  <StatusBadge label={lead.status} tone={leadTone(lead.status)} />
                </td>
                <td>{lead.source}</td>
                <td>{lead.assignedTo ?? "-"}</td>
                <td>{formatDate(lead.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      ) : null}
    </section>
  );
}
