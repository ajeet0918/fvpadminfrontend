import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
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
        title="Create Inquiry"
        subtitle="Capture a manual inquiry and continue workflow from detail screen."
        actions={<Link className="button-link button-link-secondary button-small" to="/inquiries">Back To Search</Link>}
      />

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      <article className="admin-form-card module-form-scroll">
        <h3>Inquiry Details</h3>
        <form className="user-form-grid" onSubmit={handleSubmit}>
          <div className="form-grid-2">
            <label>
              Full Name
              <input
                required
                value={form.fullName}
                onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>
            <label>
              Company Name
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
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              Phone
              <input
                required
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label className="form-span-2">
              Product Name
              <input
                required
                value={form.productName}
                onChange={(event) => setForm((current) => ({ ...current, productName: event.target.value }))}
              />
            </label>
          </div>

          <label>
            Inquiry Message
            <textarea
              required
              rows={5}
              minLength={10}
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="Write customer requirement details..."
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="button-link" disabled={saving}>
              {saving ? "Saving..." : "Create Inquiry"}
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

