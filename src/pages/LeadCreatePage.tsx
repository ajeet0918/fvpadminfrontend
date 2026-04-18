import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LeadForm, type LeadFormValues } from "../components/LeadForm";
import { PageHeader } from "../components/PageHeader";
import { createLeadApi, fetchAssignableOwnersApi, readErrorMessage } from "../lib/api";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadOwners() {
      try {
        const ownerList = await fetchAssignableOwnersApi();
        setOwners(ownerList);
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load owner list."));
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
      throw new Error(readErrorMessage(error, "Unable to create lead."));
    }
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Lead Create"
        subtitle="Capture lead details manually from calls, chats, and referrals."
        actions={<Link className="button-link button-small" to="/leads">Back To Search</Link>}
      />
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      <LeadForm
        title="Create Lead"
        initialValues={{
          ...initialValues,
          assignedTo: isSales ? currentUsername : initialValues.assignedTo
        }}
        owners={owners}
        lockAssignedTo={isSales}
        onSubmit={handleSubmit}
        submitLabel="Save Lead"
      />
    </section>
  );
}
