import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { fetchInquiriesApi, readErrorMessage } from "../lib/api";
import type { Inquiry, InquiryStatus, InquiryType } from "../types/domain";

const statusOptions: Array<InquiryStatus | ""> = [
  "",
  "NEW",
  "IN_PROGRESS",
  "CONTACTED",
  "QUOTED",
  "CONVERTED",
  "CLOSED"
];

const inquiryTypeOptions: Array<InquiryType | ""> = ["", "GENERAL", "INVESTOR", "FARMER", "COLLECTION_HUB"];

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function inquiryTone(status: InquiryStatus) {
  if (status === "CONVERTED" || status === "CLOSED") return "success";
  if (status === "IN_PROGRESS" || status === "CONTACTED" || status === "QUOTED") return "warning";
  return "neutral";
}

export function InquiryListPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "">("");
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState<InquiryType | "">("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadInquiries() {
      try {
        setLoading(true);
        const result = await fetchInquiriesApi({
          search: searchTerm,
          status: statusFilter,
          source: sourceFilter,
          assignedTo: assignedToFilter,
          inquiryType: inquiryTypeFilter
        });
        setInquiries(result);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load inquiries."));
      } finally {
        setLoading(false);
      }
    }

    void loadInquiries();
  }, [searchTerm, statusFilter, sourceFilter, assignedToFilter, inquiryTypeFilter]);

  const list = useMemo(() => inquiries, [inquiries]);

  return (
    <section className="admin-page">
      <PageHeader
        title="Inquiry List"
        subtitle="Review website inquiries, assign owners, and convert qualified records to leads."
        actions={<Link className="button-link" to="/inquiries/new">Create Inquiry</Link>}
      />

      <div className="filter-grid filter-grid-5">
        <label>
          Search
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="name, company, email, product"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InquiryStatus | "")}>
            <option value="">All Statuses</option>
            {statusOptions.filter(Boolean).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select
            value={inquiryTypeFilter}
            onChange={(event) => setInquiryTypeFilter(event.target.value as InquiryType | "")}
          >
            <option value="">All Types</option>
            {inquiryTypeOptions.filter(Boolean).map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Source
          <input
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            placeholder="WEBSITE_INQUIRY"
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
      {loading ? <p>Loading inquiries...</p> : null}

      {!loading ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Name</th>
                <th>Status</th>
                <th>Verification</th>
                <th>Payment</th>
                <th>Assigned</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td>{inquiry.referenceId ?? "-"}</td>
                  <td>{inquiry.inquiryType}</td>
                  <td>{inquiry.fullName}</td>
                  <td>
                    <StatusBadge label={inquiry.status} tone={inquiryTone(inquiry.status)} />
                  </td>
                  <td>{inquiry.verificationStatus}</td>
                  <td>{inquiry.paymentStatus}</td>
                  <td>{inquiry.assignedTo ?? "-"}</td>
                  <td>{formatDate(inquiry.updatedAt)}</td>
                  <td>
                    <Link className="button-link button-small" to={`/inquiries/${inquiry.id}/edit`}>Manage</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 ? <p className="empty-state">No inquiries found.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
