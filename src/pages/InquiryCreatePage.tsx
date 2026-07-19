import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { FormActions } from "../components/FormActions";
import { FormSection } from "../components/FormSection";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner } from "../components/PageState";
import { createInquiryApi, readErrorMessage } from "../lib/api";

type InquiryCreateForm = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  productName: string;
  message: string;
};

const initialValues: InquiryCreateForm = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  productName: "",
  message: ""
};

export function InquiryCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<InquiryCreateForm>(initialValues);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    try {
      const inquiry = await createInquiryApi({
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        productName: form.productName.trim(),
        message: form.message.trim()
      });
      navigate(`/inquiries/${inquiry.id}/edit`);
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to create inquiry."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Create inquiry"
        subtitle="Capture a buyer request manually and continue qualification from the inquiry record."
        actions={<BackLink to="/inquiries" label="Back to inquiries" />}
      />

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      <article className="admin-form-card form-page-card">
        <header className="form-card-header">
          <h2>Inquiry information</h2>
          <p>Record the buyer's contact details and product requirement before assigning the workflow.</p>
        </header>
        <form className="admin-edit-form" onSubmit={handleSubmit} aria-busy={saving}>
          <FormSection title="Buyer details" subtitle="Primary contact information for follow-up and quotation.">
            <div className="form-grid-2">
              <label>
                Full name
                <input
                  required
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                />
              </label>
              <label>
                Company name
                <input
                  required
                  value={form.companyName}
                  onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Phone
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
            </div>
          </FormSection>

          <FormSection title="Buyer requirement" subtitle="Capture the requested product and enough detail for the sales team to respond.">
            <label>
              Product or requirement
              <input
                required
                value={form.productName}
                onChange={(event) => setForm((current) => ({ ...current, productName: event.target.value }))}
              />
            </label>
            <label className="mt-4">
              Inquiry message
              <textarea
                required
                rows={5}
                minLength={10}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Include expected quantity, delivery location, timeline, and any specifications."
              />
            </label>
          </FormSection>

          <FormActions
            submitLabel="Create inquiry"
            submitting={saving}
            onCancel={() => navigate("/inquiries")}
          />
        </form>
      </article>
    </section>
  );
}

