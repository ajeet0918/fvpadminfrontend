import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CustomerForm, type CustomerFormValues } from "../components/CustomerForm";
import { PageHeader } from "../components/PageHeader";
import {
  fetchAdminCustomerApi,
  readErrorMessage,
  updateAdminCustomerApi
} from "../lib/api";
import type { AdminCustomer } from "../types/domain";

const emptyValues: CustomerFormValues = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  deliveryAddress: "",
  city: "",
  state: "",
  postalCode: "",
  active: true
};

function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function CustomerEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const customerId = Number(params.id);

  const [values, setValues] = useState<CustomerFormValues>(emptyValues);
  const [summary, setSummary] = useState<AdminCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isValidId = useMemo(() => Number.isFinite(customerId), [customerId]);

  useEffect(() => {
    async function loadCustomer() {
      if (!isValidId) {
        setErrorMessage("Invalid customer id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const customer = await fetchAdminCustomerApi(customerId);
        setSummary(customer);
        setValues({
          fullName: customer.fullName ?? "",
          companyName: customer.companyName ?? "",
          email: customer.email ?? "",
          phone: customer.phone ?? "",
          deliveryAddress: customer.deliveryAddress ?? "",
          city: customer.city ?? "",
          state: customer.state ?? "",
          postalCode: customer.postalCode ?? "",
          active: customer.active
        });
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load customer."));
      } finally {
        setLoading(false);
      }
    }

    void loadCustomer();
  }, [customerId, isValidId]);

  async function handleSubmit(nextValues: CustomerFormValues) {
    const updated = await updateAdminCustomerApi(customerId, {
      fullName: nextValues.fullName.trim(),
      companyName: nextValues.companyName.trim(),
      email: nextValues.email.trim().toLowerCase(),
      phone: nextValues.phone.trim(),
      deliveryAddress: nextValues.deliveryAddress.trim(),
      city: nextValues.city.trim(),
      state: nextValues.state.trim(),
      postalCode: nextValues.postalCode.trim(),
      active: nextValues.active
    });
    setSummary(updated);
    setValues({
      fullName: updated.fullName,
      companyName: updated.companyName,
      email: updated.email,
      phone: updated.phone,
      deliveryAddress: updated.deliveryAddress,
      city: updated.city,
      state: updated.state,
      postalCode: updated.postalCode,
      active: updated.active
    });
    setSuccessMessage("Customer updated successfully.");
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Customer Edit"
        subtitle="Update customer profile details used for order communication and fulfillment."
      />

      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}

      {summary ? (
        <div className="kpi-grid quote-kpi-grid">
          <article className="kpi-card">
            <span>Total Orders</span>
            <strong>{summary.totalOrders}</strong>
          </article>
          <article className="kpi-card">
            <span>Last Order</span>
            <strong>{summary.lastOrderNumber ?? "-"}</strong>
          </article>
          <article className="kpi-card">
            <span>Created At</span>
            <strong>{formatDate(summary.createdAt)}</strong>
          </article>
          <article className="kpi-card">
            <span>Last Updated</span>
            <strong>{formatDate(summary.updatedAt)}</strong>
          </article>
        </div>
      ) : null}

      <CustomerForm
        title="Edit Customer"
        initialValues={values}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/customers")}
        submitLabel="Save Changes"
      />
    </section>
  );
}
