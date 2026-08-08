import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { PageHeader } from "../components/PageHeader";
import { ErrorBanner, LoadingState } from "../components/PageState";
import { RefundDialog } from "../components/RefundDialog";
import { StatusBadge } from "../components/StatusBadge";
import {
  completeManualRefundApi,
  createOrderRefundApi,
  decideOrderCancellationApi,
  fetchOrderApi,
  markOrderPaymentApi,
  quoteOrderApi,
  readErrorMessage,
  syncOrderRefundsApi,
  updateOrderStatusApi
} from "../lib/api";
import { formatEnumLabel } from "../lib/formatters";
import { getCurrentRole } from "../lib/auth";
import type { Order, OrderStatus } from "../types/domain";

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING_REVIEW",
  "QUOTED",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
];

const ORDER_STATUS_DESCRIPTIONS: Record<OrderStatus, string> = {
  PENDING_REVIEW: "Order details are awaiting review by the operations team.",
  QUOTED: "Pricing has been prepared and shared with the customer.",
  CONFIRMED: "The order is approved and ready for fulfilment planning.",
  PROCESSING: "The order is being prepared, packed, or coordinated for dispatch.",
  SHIPPED: "The order has left the fulfilment location and is in transit.",
  DELIVERED: "The order has reached the customer and fulfilment is complete.",
  CANCELLED: "Fulfilment will stop. Any paid amount must be refunded separately."
};

function getOrderStatusTone(status: OrderStatus) {
  if (status === "DELIVERED") return "success" as const;
  if (status === "CANCELLED") return "danger" as const;
  if (["PENDING_REVIEW", "QUOTED"].includes(status)) return "warning" as const;
  return "neutral" as const;
}

function formatCurrency(value: number | null, currency = "INR") {
  if (value === null || Number.isNaN(value)) return "Pending";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value);
}

export function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [syncingRefunds, setSyncingRefunds] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING_REVIEW");
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [shippingAmount, setShippingAmount] = useState("0");
  const [taxAmountOverride, setTaxAmountOverride] = useState("");
  const [discountAmountOverride, setDiscountAmountOverride] = useState("");
  const [itemPrices, setItemPrices] = useState<Record<number, string>>({});
  const [itemTaxRates, setItemTaxRates] = useState<Record<number, string>>({});
  const [itemDiscountRates, setItemDiscountRates] = useState<Record<number, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER">("CASH");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [cancellationNote, setCancellationNote] = useState("");

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
      setSelectedStatus(nextOrder.status);
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
      setCancelConfirmationOpen(false);
      await loadOrder();
    } catch (error) {
      setCancelConfirmationOpen(false);
      setErrorMessage(readErrorMessage(error, "Unable to update status."));
    } finally {
      setActionLoading(false);
    }
  }

  function submitStatusUpdate() {
    if (!order || selectedStatus === order.status) return;
    if (selectedStatus === "CANCELLED") {
      setCancelConfirmationOpen(true);
      return;
    }
    void updateStatus(selectedStatus);
  }

  async function createRefund(amount: number, note: string) {
    if (!order) return;
    setActionLoading(true);
    setRefundError(null);
    try {
      await createOrderRefundApi(order.id, {
        amount,
        note,
        refundMethod: order.paymentProvider === "CASHFREE" ? "CASHFREE" : "BANK_TRANSFER"
      });
      setRefundDialogOpen(false);
      await loadOrder();
    } catch (error) {
      setRefundError(readErrorMessage(error, "Unable to issue refund."));
    } finally {
      setActionLoading(false);
    }
  }

  async function syncRefunds() {
    if (!order) return;
    setSyncingRefunds(true);
    setErrorMessage(null);
    try {
      await syncOrderRefundsApi(order.id);
      await loadOrder();
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to sync refunds from Cashfree."));
    } finally {
      setSyncingRefunds(false);
    }
  }

  async function markOfflinePayment() {
    if (!order || !paymentReference.trim()) {
      setErrorMessage("Enter a receipt, UTR, or collection reference before recording payment.");
      return;
    }
    setActionLoading(true);
    setErrorMessage(null);
    try {
      await markOrderPaymentApi(order.id, {
        paymentMethod,
        reference: paymentReference.trim(),
        note: paymentNote.trim() || undefined
      });
      setPaymentReference("");
      setPaymentNote("");
      await loadOrder();
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to record payment."));
    } finally {
      setActionLoading(false);
    }
  }

  async function decideCancellation(approved: boolean) {
    if (!order) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      await decideOrderCancellationApi(order.id, { approved, note: cancellationNote.trim() || undefined });
      setCancellationNote("");
      await loadOrder();
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to decide cancellation request."));
    } finally {
      setActionLoading(false);
    }
  }

  async function completeManualRefund(refundId: number) {
    const reference = window.prompt("Enter the bank transfer reference/UTR:");
    if (!reference?.trim()) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      await completeManualRefundApi(orderId, refundId, { reference: reference.trim() });
      await loadOrder();
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to complete manual refund."));
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <LoadingState label="Loading order..." />;
  if (!order) return <ErrorBanner message="Order not found." />;

  const paymentStatus = order.paymentStatus ?? "NOT_INITIATED";
  const refundSummary = order.refundSummary ?? {
    status: "NOT_REQUESTED" as const,
    refundedAmount: 0,
    pendingAmount: 0,
    refundableAmount: paymentStatus === "PAID" ? (order.paymentDueAmount ?? order.totalAmount ?? 0) : 0
  };
  const refunds = order.refunds ?? [];
  const canManageRefunds = ["ADMIN", "SYSADMIN"].includes(getCurrentRole());
  const canRefund = paymentStatus === "PAID"
    && (order.paymentProvider === "CASHFREE" || order.paymentProvider === "CASH" || order.paymentProvider === "BANK_TRANSFER")
    && refundSummary.refundableAmount > 0
    && canManageRefunds;
  const canManagePayments = ["ADMIN", "SYSADMIN", "SALES"].includes(getCurrentRole());

  return (
    <section className="admin-page">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle="Review pricing, customer details, and fulfilment progress for this order."
        actions={<Link className="button-link button-link-secondary button-small" to="/orders">Back To Orders</Link>}
      />
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

      <div className="order-summary-grid">
        <div><span>Status</span><strong>{formatEnumLabel(order.status)}</strong></div>
        <div><span>Payment</span><strong>{formatEnumLabel(paymentStatus)}</strong></div>
        <div><span>Company</span><strong>{order.companyName}</strong></div>
        <div><span>Total</span><strong>{formatCurrency(order.totalAmount, order.currency)}</strong></div>
      </div>

      <div className="admin-form-card payment-management-card">
        <div className="section-heading-row">
          <div>
            <h3>Payment and refunds</h3>
            <p>Payment confirmation and refund progress are tracked separately from fulfilment.</p>
          </div>
          <div className="payment-badge-group">
            <StatusBadge label={`Payment ${formatEnumLabel(paymentStatus)}`} tone={paymentStatus === "PAID" ? "success" : paymentStatus === "FAILED" ? "danger" : "warning"} />
            {refundSummary.status !== "NOT_REQUESTED" ? (
              <StatusBadge
                label={formatEnumLabel(refundSummary.status)}
                tone={refundSummary.status === "REFUNDED" ? "success" : refundSummary.status === "FAILED" ? "danger" : "warning"}
              />
            ) : null}
          </div>
        </div>

        <div className="order-summary-grid payment-summary-grid">
          <div><span>Paid amount</span><strong>{formatCurrency(paymentStatus === "PAID" ? order.paymentDueAmount ?? order.totalAmount : null, order.currency)}</strong></div>
          <div><span>Refunded</span><strong>{formatCurrency(refundSummary.refundedAmount, order.currency)}</strong></div>
          <div><span>Refund pending</span><strong>{formatCurrency(refundSummary.pendingAmount, order.currency)}</strong></div>
          <div><span>Available to refund</span><strong>{formatCurrency(refundSummary.refundableAmount, order.currency)}</strong></div>
        </div>

        <dl className="payment-reference-list">
          <div><dt>Provider</dt><dd>{order.paymentProvider ?? "Not initiated"}</dd></div>
          <div><dt>Paid on</dt><dd>{order.paidAt ? new Date(order.paidAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not paid"}</dd></div>
          <div><dt>Payment reference</dt><dd>{order.paymentProviderReference ?? "Not available"}</dd></div>
          <div><dt>Payment method</dt><dd>{formatEnumLabel(order.paymentMethod)}</dd></div>
          {order.paymentCollectionReference ? <div><dt>Collection reference</dt><dd>{order.paymentCollectionReference}</dd></div> : null}
        </dl>

        {paymentStatus !== "PAID" && order.paymentMethod !== "ONLINE" && canManagePayments ? (
          <div className="payment-collection-panel">
            <h4>Record payment collected</h4>
            <p>Use this only after the delivery receipt or bank settlement has been verified.</p>
            <div className="row">
              <label>Method<select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as "CASH" | "BANK_TRANSFER")}><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option></select></label>
              <label>Receipt / UTR reference<input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="Required" /></label>
              <label>Internal note<input value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} placeholder="Optional" /></label>
            </div>
            <button type="button" className="button-link" disabled={actionLoading || !paymentReference.trim()} onClick={() => void markOfflinePayment()}>
              {actionLoading ? "Saving..." : "Mark payment received"}
            </button>
          </div>
        ) : null}

        <div className="payment-actions">
          {paymentStatus === "PAID" && order.paymentProvider === "CASHFREE" && canManageRefunds ? (
            <button type="button" className="button-link button-link-secondary" disabled={syncingRefunds || actionLoading} onClick={() => void syncRefunds()}>
              {syncingRefunds ? "Syncing..." : "Sync with Cashfree"}
            </button>
          ) : null}
          {canRefund ? (
            <button type="button" className="button-link button-danger" onClick={() => { setRefundError(null); setRefundDialogOpen(true); }}>
              Issue refund
            </button>
          ) : null}
        </div>
        {paymentStatus === "PAID" && order.status === "CANCELLED" && canRefund ? (
          <p className="payment-guidance">This order is cancelled, but its payment remains paid until a refund is issued.</p>
        ) : null}

        {refunds.length > 0 ? (
          <div className="refund-history">
            <h4>Refund history</h4>
            {refunds.map((refund) => (
              <div className="refund-history-row" key={refund.refundId}>
                <div>
                  <strong>{formatCurrency(refund.amount, refund.currency)}</strong>
                  <span>{formatEnumLabel(refund.refundMethod)} · {refund.note}</span>
                </div>
                <div>
                  <StatusBadge label={formatEnumLabel(refund.status)} tone={refund.status === "SUCCESS" ? "success" : refund.status === "FAILED" || refund.status === "CANCELLED" ? "danger" : "warning"} />
                  <small>{new Date(refund.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</small>
                  {refund.refundMethod === "BANK_TRANSFER" && ["PENDING", "ONHOLD"].includes(refund.status) && canManageRefunds ? (
                    <button type="button" className="button-link button-small" disabled={actionLoading} onClick={() => void completeManualRefund(refund.id)}>Complete refund</button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
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

        <button type="button" className="button-link" onClick={() => void saveQuote()} disabled={actionLoading || !canSaveQuote}>
          {actionLoading ? "Saving..." : "Save Pricing"}
        </button>
      </div>

      <div className="admin-form-card order-status-card">
        <div className="section-heading-row">
          <div>
            <h3>Order status</h3>
            <p>Update fulfilment progress and leave an internal note for the operations team.</p>
          </div>
          <StatusBadge label={formatEnumLabel(order.status)} tone={getOrderStatusTone(order.status)} />
        </div>

        {order.cancellationStatus === "REQUESTED" ? (
          <div className="cancellation-request-panel">
            <h4>Customer cancellation request</h4>
            <p><strong>Reason:</strong> {order.cancellationReason}</p>
            <label>
              Decision note
              <textarea rows={2} value={cancellationNote} onChange={(event) => setCancellationNote(event.target.value)} placeholder="Explain the approval or rejection." />
            </label>
            <div className="status-update-actions">
              <button type="button" className="button-link button-danger" disabled={actionLoading} onClick={() => void decideCancellation(true)}>Approve cancellation</button>
              <button type="button" className="button-link button-link-secondary" disabled={actionLoading} onClick={() => void decideCancellation(false)}>Reject request</button>
            </div>
          </div>
        ) : null}

        <div className="order-status-layout">
          <div className="order-status-editor">
            <label>
              Change order status
              <select
                value={selectedStatus}
                disabled={actionLoading}
                onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
              >
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {formatEnumLabel(status)}{status === order.status ? " (Current)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <p className={`order-status-guidance${selectedStatus === "CANCELLED" ? " order-status-guidance-danger" : ""}`}>
              {ORDER_STATUS_DESCRIPTIONS[selectedStatus]}
            </p>

            <label>
              Internal note
              <textarea
                rows={3}
                value={statusNote}
                disabled={actionLoading}
                onChange={(event) => setStatusNote(event.target.value)}
                placeholder="Add delivery, fulfilment, or customer communication details"
              />
            </label>

            <div className="status-update-actions">
              <button
                type="button"
                className={selectedStatus === "CANCELLED" ? "button-link button-danger" : "button-link"}
                disabled={actionLoading || selectedStatus === order.status}
                onClick={submitStatusUpdate}
              >
                <UpdateRoundedIcon fontSize="small" />
                {actionLoading ? "Updating..." : "Update status"}
              </button>
            </div>
          </div>

          <div className="order-status-history" aria-label="Recent status activity">
            <div className="order-status-history-heading">
              <h4>Recent activity</h4>
              <span>{order.statusHistory.length} updates</span>
            </div>
            {order.statusHistory.length > 0 ? (
              <ol className="order-status-timeline">
                {order.statusHistory.slice(0, 5).map((history, index) => (
                  <li key={`${history.status}-${history.changedAt}-${index}`}>
                    <span className="order-status-timeline-marker" aria-hidden="true" />
                    <div>
                      <strong>{formatEnumLabel(history.status)}</strong>
                      <time dateTime={history.changedAt}>
                        {new Date(history.changedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </time>
                      {history.note ? <p>{history.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="order-status-empty">No status updates have been recorded.</p>
            )}
          </div>
        </div>
      </div>

      <RefundDialog
        open={refundDialogOpen}
        orderNumber={order.orderNumber}
        currency={order.currency}
        refundableAmount={refundSummary.refundableAmount}
        busy={actionLoading}
        errorMessage={refundError}
        onConfirm={(amount, note) => void createRefund(amount, note)}
        onCancel={() => { if (!actionLoading) setRefundDialogOpen(false); }}
      />
      <ConfirmationDialog
        open={cancelConfirmationOpen}
        title="Cancel this order?"
        message="This stops fulfilment but does not refund a paid order. Payment refunds must be issued separately."
        confirmLabel="Cancel order"
        busy={actionLoading}
        onConfirm={() => void updateStatus("CANCELLED")}
        onCancel={() => setCancelConfirmationOpen(false)}
      />
    </section>
  );
}
