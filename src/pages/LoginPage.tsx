import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginApi, readErrorMessage } from "../lib/api";
import { setAccessToken } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await loginApi({ username, password });
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
    <div className="login-shell">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Admin Login</h1>
        <p>Use your admin credentials to manage pricing, products, and order statuses.</p>
        <label>
          Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign in"}
        </button>
        {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      </form>
    </div>
  );
}
