import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LeadForm, type LeadFormValues } from "../components/LeadForm";
import { PageHeader } from "../components/PageHeader";
import {
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
      throw new Error(readErrorMessage(error, "Unable to update lead."));
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this lead?");
    if (!confirmed) return;
    await deleteLeadApi(leadId);
    navigate("/leads");
  }

  return (
    <section className="admin-page">
      <PageHeader title="Lead Edit" subtitle="Update ownership, stage, notes, and inquiry linkage." />
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}
      <LeadForm
        title="Edit Lead"
        initialValues={values}
        owners={owners}
        lockAssignedTo={isSales}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/leads")}
        submitLabel="Save Changes"
        showDelete
        onDelete={handleDelete}
      />
    </section>
  );
}
