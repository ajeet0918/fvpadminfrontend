import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { LeadForm, type LeadFormValues } from "../components/LeadForm";
import { PageHeader } from "../components/PageHeader";
import {
  createErrorWithCause,
  deleteLeadApi,
  fetchAssignableOwnersApi,
  fetchLeadApi,
  readErrorMessage,
  updateLeadApi
} from "../lib/api";
import { getCurrentRole, getCurrentUsername } from "../lib/auth";
import type { OwnerOption } from "../types/domain";

const emptyValues: LeadFormValues = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  status: "NEW",
  source: "ADMIN_PANEL",
  notes: "",
  assignedTo: "",
  inquiryId: ""
};

export function LeadEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const leadId = Number(params.id);
  const currentRole = getCurrentRole();
  const currentUsername = getCurrentUsername();
  const isSales = currentRole === "SALES";
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [values, setValues] = useState<LeadFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isValidId = useMemo(() => Number.isFinite(leadId), [leadId]);

  useEffect(() => {
    async function loadLead() {
      if (!isValidId) {
        setErrorMessage("Invalid lead id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [lead, ownerList] = await Promise.all([
          fetchLeadApi(leadId),
          fetchAssignableOwnersApi()
        ]);
        setOwners(ownerList);
        setValues({
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          companyName: lead.companyName ?? "",
          status: lead.status,
          source: lead.source,
          notes: lead.notes ?? "",
          assignedTo: isSales ? currentUsername : (lead.assignedTo ?? ""),
          inquiryId: lead.inquiryId ? String(lead.inquiryId) : ""
        });
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load lead."));
      } finally {
        setLoading(false);
      }
    }

    void loadLead();
  }, [isSales, currentUsername, isValidId, leadId]);

  async function handleSubmit(nextValues: LeadFormValues) {
    try {
      await updateLeadApi(leadId, {
        fullName: nextValues.fullName.trim(),
        email: nextValues.email.trim().toLowerCase(),
        phone: nextValues.phone.trim(),
        companyName: nextValues.companyName.trim() || null,
        status: nextValues.status,
        source: nextValues.source.trim() || null,
        notes: nextValues.notes.trim() || null,
        assignedTo: nextValues.assignedTo.trim() || null,
        inquiryId: nextValues.inquiryId ? Number(nextValues.inquiryId) : null
      });
      setSuccessMessage("Lead updated successfully.");
    } catch (error) {
      throw createErrorWithCause(error, "Unable to update lead.");
    }
  }

  function handleDelete() {
    setDeleteConfirmationOpen(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    setErrorMessage(null);
    try {
      await deleteLeadApi(leadId);
      navigate("/leads");
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to delete lead."));
      setDeleteConfirmationOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Lead Edit"
        subtitle="Update ownership, stage, notes, and inquiry linkage."
        actions={<Link className="button-link button-small" to="/leads">Back To Search</Link>}
      />
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}
      <LeadForm
        title="Edit Lead"
        initialValues={values}
        owners={owners}
        lockAssignedTo={isSales}
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        showDelete
        onDelete={handleDelete}
      />
      <ConfirmationDialog
        open={deleteConfirmationOpen}
        title="Delete lead?"
        message="This will permanently remove the lead and its record from the admin workspace."
        confirmLabel="Delete Lead"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleteConfirmationOpen(false)}
      />
    </section>
  );
}
