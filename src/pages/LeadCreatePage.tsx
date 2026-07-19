import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { LeadForm, type LeadFormValues } from "../components/LeadForm";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { createErrorWithCause, createLeadApi, fetchAssignableOwnersApi, readErrorMessage } from "../lib/api";
import { getCurrentRole, getCurrentUsername } from "../lib/auth";
import type { OwnerOption } from "../types/domain";

const initialValues: LeadFormValues = {
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

export function LeadCreatePage() {
  const navigate = useNavigate();
  const currentRole = getCurrentRole();
  const currentUsername = getCurrentUsername();
  const isSales = currentRole === "SALES";
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOwners() {
      try {
        setLoading(true);
        const ownerList = await fetchAssignableOwnersApi();
        setOwners(ownerList);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load owner list."));
      } finally {
        setLoading(false);
      }
    }
    void loadOwners();
  }, []);

  async function handleSubmit(values: LeadFormValues) {
    try {
      await createLeadApi({
        fullName: values.fullName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        companyName: values.companyName.trim() || null,
        source: values.source.trim() || null,
        notes: values.notes.trim() || null,
        assignedTo: values.assignedTo.trim() || null,
        inquiryId: values.inquiryId ? Number(values.inquiryId) : null
      });
      navigate("/leads");
    } catch (error) {
      throw createErrorWithCause(error, "Unable to create lead.");
    }
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Create lead"
        subtitle="Capture lead details manually from calls, chats, and referrals."
        actions={<BackLink to="/leads" label="Back to leads" />}
      />
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {loading ? <LoadingState label="Preparing lead form..." /> : (
        <LeadForm
          title="Lead information"
          description="Capture buyer context, ownership, and the next step for the sales pipeline."
          initialValues={{
            ...initialValues,
            assignedTo: isSales ? currentUsername : initialValues.assignedTo
          }}
          owners={owners}
          lockAssignedTo={isSales}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/leads")}
          submitLabel="Create lead"
        />
      )}
    </section>
  );
}
