import { type FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
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
            <img className="login-brand-mark" src="/assets/logofvp.jpeg" alt="FVP Purepick" />
            <div>
              <p className="m-0 text-xs font-semibold uppercase text-brand">FVP Purepick</p>
              <h1 id="admin-login-title" className="m-0 text-2xl font-semibold text-text-primary">Sign in to operations</h1>
              <p className="mt-1 text-sm text-text-secondary">
                Manage orders, catalog, customers, and finance workflows.
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
                {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
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
