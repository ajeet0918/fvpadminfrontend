import { useState } from "react";
import { PageHeader } from "../components/PageHeader";

export function SettingsPage() {
  const [compactMode, setCompactMode] = useState(true);
  const [showHints, setShowHints] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Settings"
        subtitle="UI and workflow preferences for your admin team."
      />

      <article className="admin-form-card">
        <h3>Interface Preferences</h3>
        <label className="inline-checkbox">
          <input
            type="checkbox"
            checked={compactMode}
            onChange={(event) => setCompactMode(event.target.checked)}
          />
          Compact spacing
        </label>
        <label className="inline-checkbox">
          <input
            type="checkbox"
            checked={showHints}
            onChange={(event) => setShowHints(event.target.checked)}
          />
          Show page hints
        </label>
        <div className="row">
          <button type="button" className="button-link" onClick={handleSave}>Save Settings</button>
        </div>
        {saved ? <p className="success-text">Settings saved.</p> : null}
      </article>

      <article className="admin-form-card">
        <h3>Current API</h3>
        <p className="table-muted">
          The admin panel reads backend URL from <code>VITE_API_BASE_URL</code>.
        </p>
      </article>
    </section>
  );
}
