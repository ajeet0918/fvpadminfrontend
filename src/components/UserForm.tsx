import { type FormEvent, useEffect, useState } from "react";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import type { AdminRole } from "../types/domain";
import { FormActions } from "./FormActions";
import { FormSection } from "./FormSection";
import { ErrorBanner } from "./PageState";

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
  description?: string;
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
  description,
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
  const [resettingPassword, setResettingPassword] = useState(false);
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

  async function handleResetPassword() {
    if (!onResetPassword || resetPasswordValue.length < 8) return;

    setResettingPassword(true);
    setErrorMessage(null);
    try {
      await onResetPassword(resetPasswordValue);
      setResetPasswordValue("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <article className="admin-form-card form-page-card">
      <header className="form-card-header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </header>
      <form className="admin-edit-form" onSubmit={handleSubmit} aria-busy={submitting}>
        <FormSection title="Account profile" subtitle="Identity and contact details for the operations user.">
          <div className="form-grid-2">
            <label>
              Username
              <input
                required
                disabled={!showPassword}
                autoComplete="username"
                value={values.username}
                onChange={(event) => setValues((current) => ({ ...current, username: event.target.value }))}
              />
            </label>
            <label>
              First name
              <input
                required
                autoComplete="given-name"
                value={values.firstName}
                onChange={(event) => setValues((current) => ({ ...current, firstName: event.target.value }))}
              />
            </label>
            <label>
              Last name
              <input
                required
                autoComplete="family-name"
                value={values.lastName}
                onChange={(event) => setValues((current) => ({ ...current, lastName: event.target.value }))}
              />
            </label>
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
                type="tel"
                autoComplete="tel"
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
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="inline-checkbox mt-4">
            <input
              type="checkbox"
              checked={values.active}
              onChange={(event) => setValues((current) => ({ ...current, active: event.target.checked }))}
            />
            User can sign in
          </label>
        </FormSection>

        {showPassword ? (
          <FormSection title="Initial password" subtitle="The user should replace this password according to your account policy.">
            <label>
              Password
              <input
                required
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={values.password}
                onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
              />
            </label>
          </FormSection>
        ) : null}

        {showResetPassword && onResetPassword ? (
          <FormSection title="Reset password" subtitle="Set a temporary password without changing profile or role details.">
            <div className="reset-password-box">
              <label>
                Temporary password
                <input
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={resetPasswordValue}
                  onChange={(event) => setResetPasswordValue(event.target.value)}
                  placeholder="At least 8 characters"
                />
              </label>
              <button
                type="button"
                className="button-link button-link-secondary w-fit"
                disabled={resettingPassword || resetPasswordValue.length < 8}
                onClick={() => void handleResetPassword()}
              >
                <LockResetRoundedIcon fontSize="small" />
                {resettingPassword ? "Updating..." : "Update password"}
              </button>
            </div>
          </FormSection>
        ) : null}

        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

        <FormActions
          submitLabel={submitLabel}
          submitting={submitting}
          disabled={loading || resettingPassword}
          onCancel={onCancel}
          dangerAction={onDeactivateOrDelete
            ? { label: deactivateLabel, onClick: () => void onDeactivateOrDelete() }
            : undefined}
        />
      </form>
    </article>
  );
}
