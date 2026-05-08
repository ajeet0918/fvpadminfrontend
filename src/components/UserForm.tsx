import { type FormEvent, useEffect, useState } from "react";
import type { AdminRole } from "../types/domain";
import { FormSection } from "./FormSection";

export type UserFormValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleCode: string;
  active: boolean;
  password: string;
};

type UserFormProps = {
  title: string;
  roles: AdminRole[];
  initialValues: UserFormValues;
  loading?: boolean;
  onSubmit: (values: UserFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel: string;
  showPassword?: boolean;
  showResetPassword?: boolean;
  onResetPassword?: (password: string) => Promise<void> | void;
  onDeactivateOrDelete?: () => Promise<void> | void;
  deactivateLabel?: string;
};

export function UserForm({
  title,
  roles,
  initialValues,
  loading = false,
  onSubmit,
  onCancel,
  submitLabel,
  showPassword = true,
  showResetPassword = false,
  onResetPassword,
  onDeactivateOrDelete,
  deactivateLabel = "Deactivate"
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>(initialValues);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setResetPasswordValue("");
    setErrorMessage(null);
  }, [initialValues]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await onSubmit(values);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="admin-form-card module-form-scroll">
      <h3 className="m-0 text-lg font-semibold text-text-primary">{title}</h3>
      <form className="mt-3 grid gap-4" onSubmit={handleSubmit}>
        <FormSection title="Profile">
          <div className="form-grid-2">
            <label>
              Username
              <input
                required
                disabled={!showPassword}
                value={values.username}
                onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))}
              />
            </label>
            <label>
              First Name
              <input
                required
                value={values.firstName}
                onChange={(event) => setValues((current) => ({ ...current, firstName: event.target.value }))}
              />
            </label>
            <label>
              Last Name
              <input
                required
                value={values.lastName}
                onChange={(event) => setValues((current) => ({ ...current, lastName: event.target.value }))}
              />
            </label>
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
                value={values.phone}
                onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label>
              Role
              <select
                required
                value={values.roleCode}
                onChange={(event) => setValues((current) => ({ ...current, roleCode: event.target.value }))}
              >
                <option value="">Select role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.code}>
                    {role.code}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="inline-checkbox mt-3">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) => setValues((current) => ({ ...current, active: event.target.checked }))}
            />
            Active
          </label>
        </FormSection>

        {showPassword ? (
          <FormSection title="Password">
            <label>
              Password
              <input
                required
                type="password"
                value={values.password}
                onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
          </FormSection>
        ) : null}

        {showResetPassword && onResetPassword ? (
          <FormSection title="Reset Password">
            <div className="reset-password-box">
              <label>
                New Password
                <input
                  type="password"
                  value={resetPasswordValue}
                  onChange={(event) => setResetPasswordValue(event.target.value)}
                  placeholder="Enter new password"
                />
              </label>
              <button
                type="button"
                className="button-link button-link-secondary w-fit"
                disabled={!resetPasswordValue || resetPasswordValue.length < 8}
                onClick={() => void onResetPassword(resetPasswordValue)}
              >
                Update Password
              </button>
            </div>
          </FormSection>
        ) : null}

        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

        <div className="form-actions">
          <button type="submit" className="button-link" disabled={submitting || loading}>
            {submitting ? "Saving..." : submitLabel}
          </button>
          {onCancel ? (
            <button type="button" className="button-link button-link-secondary" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          {onDeactivateOrDelete ? (
            <button type="button" className="button-link button-danger" onClick={() => void onDeactivateOrDelete()}>
              {deactivateLabel}
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
