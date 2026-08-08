import { type FormEvent, useEffect, useState } from "react";
import { FormActions } from "./FormActions";
import { FormSection } from "./FormSection";
import { ErrorBanner } from "./PageState";

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
  deferredPaymentEligible: boolean;
};

type CustomerFormProps = {
  title: string;
  description?: string;
  initialValues: CustomerFormValues;
  loading?: boolean;
  onSubmit: (values: CustomerFormValues) => Promise<void> | void;
  onCancel?: () => void;
};

export function CustomerForm({
  title,
  description,
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
    <article className="admin-form-card form-page-card">
      <header className="form-card-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <form className="admin-edit-form" onSubmit={handleSubmit} aria-busy={submitting}>
        <FormSection title="Customer identity" subtitle="Primary contact and business information used across orders.">
          <div className="form-grid-2">
            <label>
              Full name
              <input
                required
                autoComplete="name"
                value={values.fullName}
                onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
              />
            </label>
            <label>
              Company name
              <input
                required
                value={values.companyName}
                onChange={(event) => setValues((current) => ({ ...current, companyName: event.target.value }))}
              />
            </label>
          </div>

          <label className="inline-checkbox mt-4">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) => setValues((current) => ({ ...current, active: event.target.checked }))}
            />
            Customer account is active
          </label>
          <label className="inline-checkbox mt-3">
            <input
              type="checkbox"
              checked={values.deferredPaymentEligible}
              onChange={(event) => setValues((current) => ({ ...current, deferredPaymentEligible: event.target.checked }))}
            />
            Approved for online payment after delivery
          </label>
          <p className="form-help-text">Only enable this after the business account has been reviewed and approved for deferred payment terms.</p>
        </FormSection>

        <FormSection title="Contact details" subtitle="Used for order updates, delivery coordination, and support.">
          <div className="form-grid-2">
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
            <label>
              Phone
              <input
                required
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
          </div>
        </FormSection>

        <FormSection title="Delivery address" subtitle="Default destination used when coordinating fulfilment.">
          <div className="form-grid-2">
            <label>
              City
              <input
                required
                autoComplete="address-level2"
                value={values.city}
                onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))}
              />
            </label>
            <label>
              State
              <input
                required
                autoComplete="address-level1"
                value={values.state}
                onChange={(event) => setValues((current) => ({ ...current, state: event.target.value }))}
              />
            </label>
            <label>
              Postal code
              <input
                required
                inputMode="numeric"
                autoComplete="postal-code"
                value={values.postalCode}
                onChange={(event) => setValues((current) => ({ ...current, postalCode: event.target.value }))}
              />
            </label>
          </div>

          <label className="mt-3 grid gap-1 text-sm font-medium text-text-secondary">
            Street address
            <textarea
              required
              rows={4}
              autoComplete="street-address"
              value={values.deliveryAddress}
              onChange={(event) => setValues((current) => ({ ...current, deliveryAddress: event.target.value }))}
            />
          </label>
        </FormSection>

        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

        <FormActions
          submitLabel="Save customer"
          submitting={submitting}
          disabled={loading}
          onCancel={onCancel}
        />
      </form>
    </article>
  );
}
