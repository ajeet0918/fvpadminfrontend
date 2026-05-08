import { type FormEvent, useEffect, useState } from "react";
import { FormSection } from "./FormSection";

export type CustomerFormValues = {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  state: string;
  postalCode: string;
  active: boolean;
};

type CustomerFormProps = {
  title: string;
  initialValues: CustomerFormValues;
  loading?: boolean;
  onSubmit: (values: CustomerFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

export function CustomerForm({
  title,
  initialValues,
  loading = false,
  onSubmit,
  onCancel
}: CustomerFormProps) {
  const [values, setValues] = useState<CustomerFormValues>(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setErrorMessage(null);
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save customer.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="admin-form-card module-form-scroll">
      <h3 className="m-0 text-lg font-semibold text-text-primary">{title}</h3>
      <form className="mt-3 grid gap-4" onSubmit={handleSubmit}>
        <FormSection title="Section 1: Basic Info" subtitle="Core customer identity and business context.">
          <div className="form-grid-2">
            <label>
              Full Name
              <input
                required
                value={values.fullName}
                onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>
            <label>
              Company Name
              <input
                required
                value={values.companyName}
                onChange={(event) => setValues((current) => ({ ...current, companyName: event.target.value }))}
              />
            </label>
          </div>

          <label className="inline-checkbox mt-3">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) => setValues((current) => ({ ...current, active: event.target.checked }))}
            />
            Active Customer
          </label>
        </FormSection>

        <FormSection title="Section 2: Contact Details" subtitle="Primary contact channels for order communication.">
          <div className="form-grid-2">
            <label>
              Email
              <input
                required
                type="email"
                value={values.email}
                onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              Phone
              <input
                required
                value={values.phone}
                onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </div>
        </FormSection>

        <FormSection title="Section 3: Additional Details" subtitle="Address and fulfillment details.">
          <div className="form-grid-2">
            <label>
              City
              <input
                required
                value={values.city}
                onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))}
              />
            </label>
            <label>
              State
              <input
                required
                value={values.state}
                onChange={(event) => setValues((current) => ({ ...current, state: event.target.value }))}
              />
            </label>
            <label>
              Postal Code
              <input
                required
                value={values.postalCode}
                onChange={(event) => setValues((current) => ({ ...current, postalCode: event.target.value }))}
              />
            </label>
          </div>

          <label className="mt-3 grid gap-1 text-sm font-medium text-text-secondary">
            Delivery Address
            <textarea
              required
              rows={4}
              value={values.deliveryAddress}
              onChange={(event) => setValues((current) => ({ ...current, deliveryAddress: event.target.value }))}
            />
          </label>
        </FormSection>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <div className="form-actions">
          <button type="submit" className="button-link" disabled={submitting || loading}>
            {submitting ? "Saving..." : "Save"}
          </button>
          {onCancel ? (
            <button type="button" className="button-link button-link-secondary" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
