import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BackLink } from "../components/BackLink";
import { CustomerForm, type CustomerFormValues } from "../components/CustomerForm";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState, SuccessBanner } from "../components/PageState";
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
  active: true,
  deferredPaymentEligible: false
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
          active: customer.active,
          deferredPaymentEligible: customer.deferredPaymentEligible
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
      active: nextValues.active,
      deferredPaymentEligible: nextValues.deferredPaymentEligible
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
      active: updated.active,
      deferredPaymentEligible: updated.deferredPaymentEligible
    });
    setSuccessMessage("Customer updated successfully.");
  }

  return (
    <section className="admin-page">
      <PageHeader
        title="Edit customer"
        subtitle="Maintain customer contact, account status, and default delivery information."
        actions={<BackLink to="/customers" label="Back to customers" />}
      />

      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      {successMessage ? <SuccessBanner message={successMessage} /> : null}

      {summary ? (
        <div className="record-summary-grid">
          <div>
            <span>Total Orders</span>
            <strong>{summary.totalOrders}</strong>
          </div>
          <div>
            <span>Last Order</span>
            <strong>{summary.lastOrderNumber ?? "-"}</strong>
          </div>
          <div>
            <span>Created At</span>
            <strong>{formatDate(summary.createdAt)}</strong>
          </div>
          <div>
            <span>Last Updated</span>
            <strong>{formatDate(summary.updatedAt)}</strong>
          </div>
        </div>
      ) : null}

      {loading ? <LoadingState label="Loading customer..." /> : (
        <CustomerForm
          title="Customer information"
          description="Changes are used for future orders and delivery coordination."
          initialValues={values}
          onSubmit={handleSubmit}
          onCancel={() => navigate("/customers")}
        />
      )}
    </section>
  );
}
