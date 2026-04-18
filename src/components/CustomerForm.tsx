import { FormEvent, useEffect, useState } from "react";

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
  submitLabel: string;
};

export function CustomerForm({
  title,
  initialValues,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel
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
    <article className="admin-form-card">
      <h3>{title}</h3>
      <form className="user-form-grid" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <label>
            Full Name
            <input
              value={values.fullName}
              onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
              required
            />
          </label>
          <label>
            Company Name
            <input
              value={values.companyName}
              onChange={(event) => setValues((current) => ({ ...current, companyName: event.target.value }))}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={values.phone}
              onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
              required
            />
          </label>
          <label>
            City
            <input
              value={values.city}
              onChange={(event) => setValues((current) => ({ ...current, city: event.target.value }))}
              required
            />
          </label>
          <label>
            State
            <input
              value={values.state}
              onChange={(event) => setValues((current) => ({ ...current, state: event.target.value }))}
              required
            />
          </label>
          <label>
            Postal Code
            <input
              value={values.postalCode}
              onChange={(event) => setValues((current) => ({ ...current, postalCode: event.target.value }))}
              required
            />
          </label>
          <label className="inline-checkbox">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) => setValues((current) => ({ ...current, active: event.target.checked }))}
            />
            Active
          </label>
        </div>

        <label>
          Delivery Address
          <textarea
            value={values.deliveryAddress}
            onChange={(event) => setValues((current) => ({ ...current, deliveryAddress: event.target.value }))}
            rows={4}
            required
          />
        </label>

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <div className="row">
          <button type="submit" disabled={submitting || loading}>
            {submitting ? "Saving..." : submitLabel}
          </button>
          {onCancel ? (
            <button type="button" className="button-muted" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
