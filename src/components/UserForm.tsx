import { FormEvent, useEffect, useState } from "react";
import type { AdminRole } from "../types/domain";

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
    <article className="admin-form-card">
      <h3>{title}</h3>
      <form className="user-form-grid" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <label>
            Username
            <input
              value={values.username}
              onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))}
              required
              disabled={!showPassword}
            />
          </label>
          <label>
            First Name
            <input
              value={values.firstName}
              onChange={(event) => setValues((current) => ({ ...current, firstName: event.target.value }))}
              required
            />
          </label>
          <label>
            Last Name
            <input
              value={values.lastName}
              onChange={(event) => setValues((current) => ({ ...current, lastName: event.target.value }))}
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
            />
          </label>
          <label>
            Role
            <select
              value={values.roleCode}
              onChange={(event) => setValues((current) => ({ ...current, roleCode: event.target.value }))}
              required
            >
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.code}>
                  {role.code}
                </option>
              ))}
            </select>
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

        {showPassword ? (
          <label>
            Password
            <input
              type="password"
              value={values.password}
              onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
              minLength={8}
              required
            />
          </label>
        ) : null}

        {showResetPassword && onResetPassword ? (
          <div className="reset-password-box">
            <label>
              Reset Password
              <input
                type="password"
                value={resetPasswordValue}
                onChange={(event) => setResetPasswordValue(event.target.value)}
                minLength={8}
                placeholder="Enter new password"
              />
            </label>
            <button
              type="button"
              className="button-muted"
              disabled={!resetPasswordValue || resetPasswordValue.length < 8}
              onClick={() => void onResetPassword(resetPasswordValue)}
            >
              Update Password
            </button>
          </div>
        ) : null}

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
          {onDeactivateOrDelete ? (
            <button type="button" className="button-danger button-muted" onClick={() => void onDeactivateOrDelete()}>
              {deactivateLabel}
            </button>
          ) : null}
        </div>
      </form>
    </article>
  );
}
