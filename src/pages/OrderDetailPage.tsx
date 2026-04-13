import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import {
  fetchOrderApi,
  quoteOrderApi,
  readErrorMessage,
  updateOrderStatusApi
} from "../lib/api";
import type { Order, OrderStatus } from "../types/domain";

function formatCurrency(value: number | null, currency = "INR") {
  if (value === null || Number.isNaN(value)) return "Pending";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

function formatStatusLabel(status: Order["status"]) {
  return status.split("_").join(" ");
}

export function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [shippingAmount, setShippingAmount] = useState("0");
  const [taxAmountOverride, setTaxAmountOverride] = useState("");
  const [discountAmountOverride, setDiscountAmountOverride] = useState("");
  const [itemPrices, setItemPrices] = useState<Record<number, string>>({});
  const [itemTaxRates, setItemTaxRates] = useState<Record<number, string>>({});
  const [itemDiscountRates, setItemDiscountRates] = useState<Record<number, string>>({});

  const canSaveQuote = useMemo(() => {
    if (!order) return false;
    return order.items.every((item) => itemPrices[item.id] !== undefined);
  }, [order, itemPrices]);

  async function loadOrder() {
    if (!Number.isFinite(orderId)) {
      setErrorMessage("Invalid order id.");
      return;
    }

    try {
      setLoading(true);
      const nextOrder = await fetchOrderApi(orderId);
      setOrder(nextOrder);
      setStatusNote(nextOrder.adminNotes ?? "");
      setShippingAmount(String(nextOrder.shippingAmount ?? 0));
      setTaxAmountOverride(nextOrder.taxAmount !== null ? String(nextOrder.taxAmount) : "");
      setDiscountAmountOverride(nextOrder.discountAmount !== null ? String(nextOrder.discountAmount) : "");
      setItemPrices(
        Object.fromEntries(nextOrder.items.map((item) => [item.id, item.unitPrice !== null ? String(item.unitPrice) : "0"]))
      );
      setItemTaxRates(
        Object.fromEntries(nextOrder.items.map((item) => [item.id, item.taxRate !== null ? String(item.taxRate) : "0"]))
      );
      setItemDiscountRates(
        Object.fromEntries(nextOrder.items.map((item) => [item.id, item.discountRate !== null ? String(item.discountRate) : "0"]))
      );
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to load order."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function saveQuote() {
    if (!order) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      await quoteOrderApi(order.id, {
        quoteReference: order.quoteReference ?? `INV-${order.orderNumber}`,
        adminNotes: statusNote,
        shippingAmount: Number(shippingAmount || 0),
        taxAmount: taxAmountOverride.trim() ? Number(taxAmountOverride) : null,
        discountAmount: discountAmountOverride.trim() ? Number(discountAmountOverride) : null,
        items: order.items.map((item) => ({
          itemId: item.id,
          unitPrice: Number(itemPrices[item.id] || 0),
          taxRate: itemTaxRates[item.id] !== undefined ? Number(itemTaxRates[item.id]) : null,
          discountRate: itemDiscountRates[item.id] !== undefined ? Number(itemDiscountRates[item.id]) : null
        }))
      });
      await loadOrder();
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to save quote."));
    } finally {
      setActionLoading(false);
    }
  }

  async function updateStatus(status: OrderStatus) {
    if (!order) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      await updateOrderStatusApi(order.id, { status, adminNotes: statusNote });
      await loadOrder();
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to update status."));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <section className="admin-page">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle="Review product-based pricing and update fulfillment status without layout shifts."
      />
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      <div className="order-summary-grid">
        <div><span>Status</span><strong>{formatStatusLabel(order.status)}</strong></div>
        <div><span>Company</span><strong>{order.companyName}</strong></div>
        <div><span>Total</span><strong>{formatCurrency(order.totalAmount, order.currency)}</strong></div>
      </div>

      <div className="admin-form-card">
        <h3>Pricing</h3>
        <div className="row">
          <label>
            Shipping
            <input type="number" min="0" value={shippingAmount} onChange={(event) => setShippingAmount(event.target.value)} />
          </label>
          <label>
            Tax Override (optional)
            <input
              type="number"
              min="0"
              value={taxAmountOverride}
              onChange={(event) => setTaxAmountOverride(event.target.value)}
              placeholder="Auto if empty"
            />
          </label>
          <label>
            Discount Override (optional)
            <input
              type="number"
              min="0"
              value={discountAmountOverride}
              onChange={(event) => setDiscountAmountOverride(event.target.value)}
              placeholder="Auto if empty"
            />
          </label>
        </div>

        {order.items.map((item) => (
          <div key={item.id} className="row item-row item-pricing-grid">
            <span>{item.productName} ({item.quantity} {item.unit})</span>
            <input
              type="number"
              min="0"
              value={itemPrices[item.id] ?? "0"}
              placeholder="Unit Price"
              onChange={(event) =>
                setItemPrices((current) => ({ ...current, [item.id]: event.target.value }))
              }
            />
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={itemTaxRates[item.id] ?? "0"}
              onChange={(event) =>
                setItemTaxRates((current) => ({ ...current, [item.id]: event.target.value }))
              }
              placeholder="Tax %"
            />
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={itemDiscountRates[item.id] ?? "0"}
              onChange={(event) =>
                setItemDiscountRates((current) => ({ ...current, [item.id]: event.target.value }))
              }
              placeholder="Discount %"
            />
          </div>
        ))}

        <div className="order-summary-grid">
          <div><span>Subtotal</span><strong>{formatCurrency(order.subtotalAmount, order.currency)}</strong></div>
          <div><span>Discount</span><strong>{formatCurrency(order.discountAmount, order.currency)}</strong></div>
          <div>
            <span>Tax {order.effectiveTaxRate !== null ? `(${order.effectiveTaxRate}% eff.)` : ""}</span>
            <strong>{formatCurrency(order.taxAmount, order.currency)}</strong>
          </div>
          <div><span>Total</span><strong>{formatCurrency(order.totalAmount, order.currency)}</strong></div>
        </div>

        <button type="button" onClick={() => void saveQuote()} disabled={actionLoading || !canSaveQuote}>
          {actionLoading ? "Saving..." : "Save Pricing"}
        </button>
      </div>

      <div className="admin-form-card">
        <h3>Status</h3>
        <label>
          Admin Note
          <textarea rows={3} value={statusNote} onChange={(event) => setStatusNote(event.target.value)} />
        </label>
        <div className="status-actions">
          {(["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as OrderStatus[]).map((status) => (
            <button key={status} type="button" onClick={() => void updateStatus(status)} disabled={actionLoading}>
              {formatStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
