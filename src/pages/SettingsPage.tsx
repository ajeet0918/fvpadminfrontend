import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PageHeader } from "../components/PageHeader";
import {
  fetchAdminSettingsApi,
  fetchSmtpConfigApi,
  readErrorMessage,
  saveAdminSettingsApi,
  saveSmtpConfigApi
} from "../lib/api";
import type { AdminSetting, AdminSettingValueType } from "../types/domain";

type SettingsSection = "general" | "payment" | "smtp";

type SettingsFormState = {
  supportEmail: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  cashfreeEnabled: boolean;
  cashfreeApiVersion: string;
  cashfreeClientId: string;
  cashfreeClientSecret: string;
  cashfreeWebhookEnforceSignature: boolean;
  smtpActive: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpAuthEnabled: boolean;
  smtpStartTlsEnabled: boolean;
  smtpFrontendBaseUrl: string;
};

const DEFAULT_FORM: SettingsFormState = {
  supportEmail: "",
  defaultCurrency: "INR",
  maintenanceMode: false,
  cashfreeEnabled: false,
  cashfreeApiVersion: "2023-08-01",
  cashfreeClientId: "",
  cashfreeClientSecret: "",
  cashfreeWebhookEnforceSignature: false,
  smtpActive: false,
  smtpHost: "",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",
  smtpFromEmail: "",
  smtpFromName: "FVP Purepick",
  smtpAuthEnabled: true,
  smtpStartTlsEnabled: true,
  smtpFrontendBaseUrl: ""
};

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  return value.trim().toLowerCase() === "true";
}

function findSettingValue(
  settingsByKey: Map<string, AdminSetting>,
  key: string,
  fallback: string
) {
  return settingsByKey.get(key)?.value ?? fallback;
}

function createSettingEntry(
  settingKey: string,
  category: string,
  value: string,
  valueType: AdminSettingValueType,
  secret = false,
  description = ""
) {
  return {
    settingKey,
    category,
    value,
    valueType,
    secret,
    active: true,
    description
  };
}

export function SettingsPage() {
  const [openSections, setOpenSections] = useState<Record<SettingsSection, boolean>>({
    general: true,
    payment: false,
    smtp: false
  });
  const [form, setForm] = useState<SettingsFormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<SettingsSection | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setErrorMessage(null);
        const [settings, smtpConfig] = await Promise.all([
          fetchAdminSettingsApi(),
          fetchSmtpConfigApi()
        ]);
        const settingsByKey = new Map(settings.map((item) => [item.settingKey, item]));

        setForm({
          supportEmail: findSettingValue(settingsByKey, "general.support-email", DEFAULT_FORM.supportEmail),
          defaultCurrency: findSettingValue(settingsByKey, "general.default-currency", DEFAULT_FORM.defaultCurrency),
          maintenanceMode: parseBoolean(
            findSettingValue(settingsByKey, "general.maintenance-mode", String(DEFAULT_FORM.maintenanceMode)),
            DEFAULT_FORM.maintenanceMode
          ),
          cashfreeEnabled: parseBoolean(
            findSettingValue(settingsByKey, "payment.cashfree.enabled", String(DEFAULT_FORM.cashfreeEnabled)),
            DEFAULT_FORM.cashfreeEnabled
          ),
          cashfreeApiVersion: findSettingValue(settingsByKey, "payment.cashfree.api-version", DEFAULT_FORM.cashfreeApiVersion),
          cashfreeClientId: findSettingValue(settingsByKey, "payment.cashfree.client-id", DEFAULT_FORM.cashfreeClientId),
          cashfreeClientSecret: findSettingValue(settingsByKey, "payment.cashfree.client-secret", DEFAULT_FORM.cashfreeClientSecret),
          cashfreeWebhookEnforceSignature: parseBoolean(
            findSettingValue(
              settingsByKey,
              "payment.cashfree.webhook-enforce-signature",
              String(DEFAULT_FORM.cashfreeWebhookEnforceSignature)
            ),
            DEFAULT_FORM.cashfreeWebhookEnforceSignature
          ),
          smtpActive: smtpConfig.active,
          smtpHost: smtpConfig.host ?? "",
          smtpPort: smtpConfig.port?.toString() ?? DEFAULT_FORM.smtpPort,
          smtpUsername: smtpConfig.username ?? "",
          smtpPassword: smtpConfig.password ?? "",
          smtpFromEmail: smtpConfig.fromEmail ?? "",
          smtpFromName: smtpConfig.fromName ?? DEFAULT_FORM.smtpFromName,
          smtpAuthEnabled: smtpConfig.authEnabled,
          smtpStartTlsEnabled: smtpConfig.startTlsEnabled,
          smtpFrontendBaseUrl: smtpConfig.frontendBaseUrl ?? ""
        });
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load settings."));
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  const generalSettingsPayload = useMemo(
    () => [
      createSettingEntry("general.support-email", "GENERAL", form.supportEmail.trim(), "STRING", false, "Primary support email"),
      createSettingEntry("general.default-currency", "GENERAL", form.defaultCurrency.trim(), "STRING", false, "Default system currency"),
      createSettingEntry("general.maintenance-mode", "GENERAL", String(form.maintenanceMode), "BOOLEAN", false, "Global maintenance toggle")
    ],
    [form.defaultCurrency, form.maintenanceMode, form.supportEmail]
  );

  const paymentSettingsPayload = useMemo(
    () => [
      createSettingEntry("payment.cashfree.enabled", "PAYMENT", String(form.cashfreeEnabled), "BOOLEAN", false, "Enable Cashfree gateway"),
      createSettingEntry("payment.cashfree.api-version", "PAYMENT", form.cashfreeApiVersion.trim(), "STRING", false, "Cashfree API version"),
      createSettingEntry("payment.cashfree.client-id", "PAYMENT", form.cashfreeClientId.trim(), "STRING", false, "Cashfree client ID"),
      createSettingEntry("payment.cashfree.client-secret", "PAYMENT", form.cashfreeClientSecret, "STRING", true, "Cashfree client secret"),
      createSettingEntry(
        "payment.cashfree.webhook-enforce-signature",
        "PAYMENT",
        String(form.cashfreeWebhookEnforceSignature),
        "BOOLEAN",
        false,
        "Validate webhook signature"
      )
    ],
    [
      form.cashfreeApiVersion,
      form.cashfreeClientId,
      form.cashfreeClientSecret,
      form.cashfreeEnabled,
      form.cashfreeWebhookEnforceSignature
    ]
  );

  async function saveSection(
    section: SettingsSection,
    successText: string,
    saveAction: () => Promise<unknown>
  ) {
    try {
      setSavingSection(section);
      setErrorMessage(null);
      setSuccessMessage(null);
      await saveAction();
      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to save settings."));
    } finally {
      setSavingSection(null);
    }
  }

  function handleSaveGeneralSettings() {
    void saveSection("general", "General settings saved.", () => saveAdminSettingsApi(generalSettingsPayload));
  }

  function handleSavePaymentSettings() {
    void saveSection("payment", "Payment gateway settings saved.", () => saveAdminSettingsApi(paymentSettingsPayload));
  }

  function handleSaveSmtpSettings() {
    void saveSection("smtp", "SMTP settings saved.", () =>
      saveSmtpConfigApi({
        active: form.smtpActive,
        host: form.smtpHost.trim(),
        port: form.smtpPort.trim() ? Number(form.smtpPort) : null,
        username: form.smtpUsername.trim(),
        password: form.smtpPassword,
        fromEmail: form.smtpFromEmail.trim(),
        fromName: form.smtpFromName.trim(),
        authEnabled: form.smtpAuthEnabled,
        startTlsEnabled: form.smtpStartTlsEnabled,
        frontendBaseUrl: form.smtpFrontendBaseUrl.trim()
      })
    );
  }

  function toggleSection(section: SettingsSection) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section]
    }));
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Settings"
        subtitle="Central configuration for platform defaults, payment gateway, and SMTP email delivery."
      />

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}

      <div className="settings-accordion-stack">
        <SettingsAccordion
          title="General Settings"
          description="Platform defaults used across the admin panel and customer portal."
          status={form.maintenanceMode ? "Maintenance on" : "Active"}
          tone={form.maintenanceMode ? "warning" : "success"}
          open={openSections.general}
          onToggle={() => toggleSection("general")}
        >
          <div className="form-grid-2">
            <label>
              Support Email
              <input
                type="email"
                value={form.supportEmail}
                onChange={(event) => setForm((prev) => ({ ...prev, supportEmail: event.target.value }))}
                placeholder="support@yourcompany.com"
              />
            </label>
            <label>
              Default Currency
              <input
                type="text"
                value={form.defaultCurrency}
                onChange={(event) => setForm((prev) => ({ ...prev, defaultCurrency: event.target.value }))}
                placeholder="INR"
              />
            </label>
          </div>
          <label className="inline-checkbox">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(event) => setForm((prev) => ({ ...prev, maintenanceMode: event.target.checked }))}
            />
            Maintenance mode
          </label>
          <div className="settings-section-actions">
            <button
              type="button"
              className="button-link"
              onClick={handleSaveGeneralSettings}
              disabled={loading || savingSection !== null}
            >
              {savingSection === "general" ? "Saving..." : "Save General Settings"}
            </button>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="Payment Gateway"
          description="Cashfree credentials and gateway controls for customer checkout."
          status={form.cashfreeEnabled ? "Enabled" : "Disabled"}
          tone={form.cashfreeEnabled ? "success" : "muted"}
          open={openSections.payment}
          onToggle={() => toggleSection("payment")}
        >
          <div className="form-actions">
            <label className="inline-checkbox">
              <input
                type="checkbox"
                checked={form.cashfreeEnabled}
                onChange={(event) => setForm((prev) => ({ ...prev, cashfreeEnabled: event.target.checked }))}
              />
              Enable gateway
            </label>
            <label className="inline-checkbox">
              <input
                type="checkbox"
                checked={form.cashfreeWebhookEnforceSignature}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, cashfreeWebhookEnforceSignature: event.target.checked }))
                }
              />
              Enforce webhook signature
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              API Version
              <input
                type="text"
                value={form.cashfreeApiVersion}
                onChange={(event) => setForm((prev) => ({ ...prev, cashfreeApiVersion: event.target.value }))}
                placeholder="2023-08-01"
              />
            </label>
            <label>
              Client ID
              <input
                type="text"
                value={form.cashfreeClientId}
                onChange={(event) => setForm((prev) => ({ ...prev, cashfreeClientId: event.target.value }))}
                placeholder="Cashfree app/client id"
              />
            </label>
            <label>
              Client Secret
              <input
                type="password"
                value={form.cashfreeClientSecret}
                onChange={(event) => setForm((prev) => ({ ...prev, cashfreeClientSecret: event.target.value }))}
                placeholder="Leave as ******** to keep existing secret"
              />
            </label>
          </div>
          <div className="settings-section-actions">
            <button
              type="button"
              className="button-link"
              onClick={handleSavePaymentSettings}
              disabled={loading || savingSection !== null}
            >
              {savingSection === "payment" ? "Saving..." : "Save Payment Gateway"}
            </button>
          </div>
        </SettingsAccordion>

        <SettingsAccordion
          title="SMTP Config"
          description="Email delivery setup for portal activation and password reset links."
          status={form.smtpActive ? "Enabled" : "Disabled"}
          tone={form.smtpActive ? "success" : "muted"}
          open={openSections.smtp}
          onToggle={() => toggleSection("smtp")}
        >
          <p className="table-muted">
            Used for portal activation and password reset emails. Passwords are masked after save.
          </p>
          <div className="form-actions">
            <label className="inline-checkbox">
              <input
                type="checkbox"
                checked={form.smtpActive}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpActive: event.target.checked }))}
              />
              Enable SMTP
            </label>
            <label className="inline-checkbox">
              <input
                type="checkbox"
                checked={form.smtpAuthEnabled}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpAuthEnabled: event.target.checked }))}
              />
              SMTP auth
            </label>
            <label className="inline-checkbox">
              <input
                type="checkbox"
                checked={form.smtpStartTlsEnabled}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpStartTlsEnabled: event.target.checked }))}
              />
              STARTTLS
            </label>
          </div>
          <div className="form-grid-2">
            <label>
              Host
              <input
                value={form.smtpHost}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpHost: event.target.value }))}
                placeholder="smtp.example.com"
              />
            </label>
            <label>
              Port
              <input
                type="number"
                min={1}
                max={65535}
                value={form.smtpPort}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpPort: event.target.value }))}
                placeholder="587"
              />
            </label>
            <label>
              Username
              <input
                value={form.smtpUsername}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpUsername: event.target.value }))}
                placeholder="SMTP username"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={form.smtpPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpPassword: event.target.value }))}
                placeholder="Leave as ******** to keep existing password"
              />
            </label>
            <label>
              From Email
              <input
                type="email"
                value={form.smtpFromEmail}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpFromEmail: event.target.value }))}
                placeholder="no-reply@fvppurepick.com"
              />
            </label>
            <label>
              From Name
              <input
                value={form.smtpFromName}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpFromName: event.target.value }))}
                placeholder="FVP Purepick"
              />
            </label>
            <label>
              Public Frontend URL
              <input
                value={form.smtpFrontendBaseUrl}
                onChange={(event) => setForm((prev) => ({ ...prev, smtpFrontendBaseUrl: event.target.value }))}
                placeholder="https://staging.fvppurepick.com"
              />
            </label>
          </div>
          <div className="settings-section-actions">
            <button
              type="button"
              className="button-link"
              onClick={handleSaveSmtpSettings}
              disabled={loading || savingSection !== null}
            >
              {savingSection === "smtp" ? "Saving..." : "Save SMTP Config"}
            </button>
          </div>
        </SettingsAccordion>
      </div>
    </section>
  );
}

function SettingsAccordion({
  title,
  description,
  status,
  tone,
  open,
  children,
  onToggle
}: {
  title: string;
  description: string;
  status: string;
  tone: "success" | "warning" | "muted";
  open: boolean;
  children: ReactNode;
  onToggle: () => void;
}) {
  return (
    <article className="admin-form-card settings-accordion">
      <button
        type="button"
        className="settings-accordion-header"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="settings-accordion-title-row">
          <span className="settings-accordion-icon" aria-hidden="true">
            {title.charAt(0)}
          </span>
          <span className="settings-accordion-copy">
            <span className="settings-accordion-heading">{title}</span>
            <span className="settings-accordion-description">{description}</span>
          </span>
        </span>
        <span className="settings-accordion-meta">
          <span className={`settings-status-pill settings-status-${tone}`}>{status}</span>
          <span className={open ? "settings-accordion-chevron open" : "settings-accordion-chevron"} aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </button>
      {open ? <div className="settings-accordion-body">{children}</div> : null}
    </article>
  );
}
