import { type FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginApi, readErrorMessage } from "../lib/api";
import { setAccessToken } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      setErrorMessage("Enter your username and password.");
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await loginApi({ username: normalizedUsername, password });
      setAccessToken(response.accessToken);
      const nextPath = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(nextPath, { replace: true });
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to sign in."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="login-shell">
      <article className="login-card login-card-elevated" aria-labelledby="admin-login-title">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <span className="login-brand-mark">FVP</span>
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-brand">Admin Console</p>
              <h1 id="admin-login-title" className="m-0 text-2xl font-semibold text-text-primary">Sign in</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Manage products, orders, inquiries, and payouts.
              </p>
            </div>
          </div>

          <label htmlFor="admin-username">
            Username
            <input
              id="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="stageadmin"
              required
            />
          </label>

          <label htmlFor="admin-password">
            Password
            <div className="admin-password-wrap">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M3 4.27 4.28 3 21 19.72 19.73 21l-2.6-2.6A11.8 11.8 0 0 1 12 20C7 20 2.73 16.89 1 12c.73-2.06 2-3.88 3.62-5.32L3 4.27Zm6.5 6.5 4.23 4.23A3.95 3.95 0 0 1 12 15.5 4 4 0 0 1 8 11.5c0-.64.15-1.24.42-1.73L9.5 10.77ZM12 6c5 0 9.27 3.11 11 8a11.8 11.8 0 0 1-2.66 4.07l-2.2-2.2A8.54 8.54 0 0 0 20.86 12C19.22 8.23 15.83 6 12 6c-1.43 0-2.8.31-4.04.88L6.43 5.35A11.8 11.8 0 0 1 12 6Z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path d="M12 5c5 0 9.27 3.11 11 8-1.73 4.89-6 8-11 8S2.73 17.89 1 13c1.73-4.89 6-8 11-8Zm0 2C8.17 7 4.78 9.23 3.14 13 4.78 16.77 8.17 19 12 19s7.22-2.23 8.86-6C19.22 9.23 15.83 7 12 7Zm0 2.5A3.5 3.5 0 1 1 8.5 13 3.5 3.5 0 0 1 12 9.5Zm0 2A1.5 1.5 0 1 0 13.5 13 1.5 1.5 0 0 0 12 11.5Z" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <button type="submit" className="button-link w-full justify-center" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          {errorMessage ? <p className="error-text" role="alert">{errorMessage}</p> : null}

          <p className="login-footnote">Access is restricted to approved FVP operations users.</p>
        </form>
      </article>
    </section>
  );
}
