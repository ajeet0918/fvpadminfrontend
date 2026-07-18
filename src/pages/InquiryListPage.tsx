import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { StatusBadge } from "../components/StatusBadge";
import { fetchInquiriesApi, readErrorMessage } from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
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
        title="Inquiries"
        subtitle="Review website inquiries, assign owners, and convert qualified records to leads."
        actions={<Link className="button-link" to="/inquiries/new">Create Inquiry</Link>}
      />

      <div className="filter-grid filter-grid-5">
        <label>
          Search
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Name, company, email, or product"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as InquiryStatus | "")}>
            <option value="">All Statuses</option>
            {statusOptions.filter(Boolean).map((status) => (
              <option key={status} value={status}>{formatEnumLabel(status)}</option>
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
              <option key={type} value={type}>{formatEnumLabel(type)}</option>
            ))}
          </select>
        </label>
        <label>
          Source
          <input
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
            placeholder="Source name"
          />
        </label>
        <label>
          Assigned To
          <input
            value={assignedToFilter}
            onChange={(event) => setAssignedToFilter(event.target.value)}
            placeholder="Owner username"
          />
        </label>
      </div>

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Loading inquiries..." /> : null}

      {!loading ? (
        <DataTable isEmpty={list.length === 0} emptyText="No inquiries found.">
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
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((inquiry) => (
              <tr key={inquiry.id}>
                <td>
                  <Link className="record-id-link" to={`/inquiries/${inquiry.id}/edit`}>
                    {inquiry.referenceId ?? `INQ-${inquiry.id}`}
                  </Link>
                </td>
                <td>{formatEnumLabel(inquiry.inquiryType)}</td>
                <td>{inquiry.fullName}</td>
                <td>
                  <StatusBadge label={formatEnumLabel(inquiry.status)} tone={inquiryTone(inquiry.status)} />
                </td>
                <td>{formatEnumLabel(inquiry.verificationStatus)}</td>
                <td>{formatEnumLabel(inquiry.paymentStatus)}</td>
                <td>{inquiry.assignedTo ?? "-"}</td>
                <td>{formatDate(inquiry.updatedAt)}</td>
                <td className="actions-cell">
                  <Link className="button-link button-link-secondary button-small" to={`/inquiries/${inquiry.id}/edit`}>
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
