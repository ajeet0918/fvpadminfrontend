import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { InquiryForm, type InquiryFormValues } from "../components/InquiryForm";
import { PageHeader } from "../components/PageHeader";
import {
  createPortalUserForInquiryApi,
  convertInquiryToLeadApi,
  downloadAdminDocumentContentApi,
  fetchAssignableOwnersApi,
  fetchInquiryApi,
  readErrorMessage,
  updateInquiryApi
} from "../lib/api";
import { getCurrentRole, getCurrentUsername } from "../lib/auth";
import type { Inquiry, OwnerOption } from "../types/domain";

const emptyValues: InquiryFormValues = {
  status: "NEW",
  verificationStatus: "PENDING",
  paymentStatus: "NOT_REQUIRED",
  agreementId: "",
  committedReturnAmount: "",
  farmerActionNote: "",
  hubActionNote: "",
  adminNotes: "",
  assignedTo: ""
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function InquiryEditPage() {
  const params = useParams<{ id: string }>();
  const inquiryId = Number(params.id);
  const currentRole = getCurrentRole();
  const currentUsername = getCurrentUsername();
  const isSales = currentRole === "SALES";
  const [owners, setOwners] = useState<OwnerOption[]>([]);
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [values, setValues] = useState<InquiryFormValues>(emptyValues);
  const [loading, setLoading] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isValidId = useMemo(() => Number.isFinite(inquiryId), [inquiryId]);

  useEffect(() => {
    async function loadInquiry() {
      if (!isValidId) {
        setErrorMessage("Invalid inquiry id.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [response, ownerList] = await Promise.all([
          fetchInquiryApi(inquiryId),
          fetchAssignableOwnersApi()
        ]);
        setOwners(ownerList);
        setInquiry(response);
        setValues({
          status: response.status,
          verificationStatus: response.verificationStatus,
          paymentStatus: response.paymentStatus,
          agreementId: response.agreementId ?? "",
          committedReturnAmount: response.committedReturnAmount?.toString() ?? "",
          farmerActionNote: response.farmerActionNote ?? "",
          hubActionNote: response.hubActionNote ?? "",
          adminNotes: response.adminNotes ?? "",
          assignedTo: isSales ? currentUsername : (response.assignedTo ?? "")
        });
      } catch (error) {
        setErrorMessage(readErrorMessage(error, "Unable to load inquiry."));
      } finally {
        setLoading(false);
      }
    }

    void loadInquiry();
  }, [isSales, currentUsername, isValidId, inquiryId]);

  async function handleSubmit(nextValues: InquiryFormValues) {
    try {
      const updated = await updateInquiryApi(inquiryId, {
        status: nextValues.status,
        verificationStatus: nextValues.verificationStatus,
        paymentStatus: nextValues.paymentStatus,
        agreementId: nextValues.agreementId.trim() || null,
        committedReturnAmount: nextValues.committedReturnAmount.trim()
          ? Number(nextValues.committedReturnAmount)
          : null,
        farmerActionNote: nextValues.farmerActionNote.trim() || null,
        hubActionNote: nextValues.hubActionNote.trim() || null,
        adminNotes: nextValues.adminNotes.trim() || null,
        assignedTo: nextValues.assignedTo.trim() || null
      });
      setInquiry(updated);
      setValues({
        status: updated.status,
        verificationStatus: updated.verificationStatus,
        paymentStatus: updated.paymentStatus,
        agreementId: updated.agreementId ?? "",
        committedReturnAmount: updated.committedReturnAmount?.toString() ?? "",
        farmerActionNote: updated.farmerActionNote ?? "",
        hubActionNote: updated.hubActionNote ?? "",
        adminNotes: updated.adminNotes ?? "",
        assignedTo: updated.assignedTo ?? ""
      });
      setSuccessMessage("Inquiry updated successfully.");
    } catch (error) {
      throw new Error(readErrorMessage(error, "Unable to update inquiry."));
    }
  }

  async function handleConvertToLead(nextValues: InquiryFormValues) {
    try {
      const updated = await convertInquiryToLeadApi(inquiryId, {
        leadNotes: nextValues.adminNotes.trim() || null,
        assignedTo: nextValues.assignedTo.trim() || null
      });
      setInquiry(updated);
      setValues({
        status: updated.status,
        verificationStatus: updated.verificationStatus,
        paymentStatus: updated.paymentStatus,
        agreementId: updated.agreementId ?? "",
        committedReturnAmount: updated.committedReturnAmount?.toString() ?? "",
        farmerActionNote: updated.farmerActionNote ?? "",
        hubActionNote: updated.hubActionNote ?? "",
        adminNotes: updated.adminNotes ?? "",
        assignedTo: updated.assignedTo ?? ""
      });
      setSuccessMessage("Inquiry converted to lead successfully.");
    } catch (error) {
      throw new Error(readErrorMessage(error, "Unable to convert inquiry."));
    }
  }

  async function handlePortalInvite() {
    try {
      setSendingInvite(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const response = await createPortalUserForInquiryApi(inquiryId);
      setSuccessMessage(`${response.message} Username: ${response.username}`);
    } catch (error) {
      setErrorMessage(readErrorMessage(error, "Unable to send portal invite."));
    } finally {
      setSendingInvite(false);
    }
  }

  const canCreatePortalUser = inquiry?.inquiryType === "FARMER"
    || inquiry?.inquiryType === "INVESTOR"
    || inquiry?.inquiryType === "COLLECTION_HUB";

  return (
    <section className="admin-page">
      <PageHeader
        title="Inquiry Detail"
        subtitle="Review inquiry context and progress it through pipeline states."
        actions={(
          <div className="form-actions">
            {canCreatePortalUser ? (
              <button
                type="button"
                className="button-link button-small"
                onClick={() => void handlePortalInvite()}
                disabled={sendingInvite}
              >
                {sendingInvite ? "Sending..." : "Send Portal Invite"}
              </button>
            ) : null}
            <Link className="button-link button-small button-link-secondary" to="/inquiries">Back To Search</Link>
          </div>
        )}
      />
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
      {successMessage ? <p className="success-text">{successMessage}</p> : null}

      {inquiry ? (
        <article className="admin-form-card">
          <h3>Inquiry Detail</h3>
          <div className="form-grid-2">
            <div>
              <strong>{inquiry.fullName}</strong>
              <p className="table-muted">{inquiry.referenceId ?? "Reference pending"}</p>
            </div>
            <div>
              <strong>{inquiry.inquiryType}</strong>
              <p className="table-muted">Source: {inquiry.source}</p>
            </div>
            <div>
              <strong>Email</strong>
              <p className="table-muted">{inquiry.email}</p>
            </div>
            <div>
              <strong>Phone</strong>
              <p className="table-muted">{inquiry.phone}</p>
            </div>
            <div>
              <strong>Verification</strong>
              <p className="table-muted">{inquiry.verificationStatus}</p>
            </div>
            <div>
              <strong>Payment</strong>
              <p className="table-muted">{inquiry.paymentStatus}</p>
            </div>
            <div>
              <strong>Created</strong>
              <p className="table-muted">{formatDate(inquiry.createdAt)}</p>
            </div>
            <div>
              <strong>Updated</strong>
              <p className="table-muted">{formatDate(inquiry.updatedAt)}</p>
            </div>
          </div>
          {inquiry.inquiryType === "GENERAL" ? (
            <>
              <div className="form-grid-2">
                <div>
                  <strong>Company</strong>
                  <p className="table-muted">{inquiry.companyName}</p>
                </div>
                <div>
                  <strong>Product</strong>
                  <p className="table-muted">{inquiry.productName}</p>
                </div>
              </div>
              <label>
                Customer Message
                <textarea rows={5} value={inquiry.message} readOnly />
              </label>
            </>
          ) : null}

          {inquiry.inquiryType === "INVESTOR" ? (
            <div className="form-grid-2">
              <InfoItem label="Father Name" value={inquiry.fatherName} />
              <InfoItem label="Aadhaar" value={inquiry.aadhaarNumber} />
              <InfoItem label="PAN" value={inquiry.panNumber} />
              <InfoItem label="Investment Amount" value={inquiry.investmentAmount ? `INR ${inquiry.investmentAmount}` : null} />
              <InfoItem label="Investment Date" value={inquiry.investmentDate} />
              <InfoItem label="Preferred Payment" value={inquiry.preferredPaymentMode} />
              <InfoItem label="Transaction ID" value={inquiry.transactionId} />
              <InfoItem label="Payment Date" value={inquiry.paymentDate} />
              <InfoItem label="Agreement ID" value={inquiry.agreementId} />
              <InfoItem label="Committed Return" value={inquiry.committedReturnAmount ? `INR ${inquiry.committedReturnAmount}` : null} />
              <InfoItem label="Terms Accepted" value={inquiry.termsAccepted ? "Yes" : "No"} />
              <InfoItem label="Address" value={inquiry.fullAddress} />
              <InfoItem label="Notes" value={inquiry.message} />
            </div>
          ) : null}

          {inquiry.inquiryType === "FARMER" ? (
            <div className="form-grid-2">
              <InfoItem label="Father Name" value={inquiry.fatherName} />
              <InfoItem label="Aadhaar" value={inquiry.aadhaarNumber} />
              <InfoItem label="Alternate Number" value={inquiry.alternatePhone} />
              <InfoItem label="Village" value={inquiry.village} />
              <InfoItem label="District" value={inquiry.district} />
              <InfoItem label="State" value={inquiry.farmerState} />
              <InfoItem label="PIN Code" value={inquiry.pinCode} />
              <InfoItem label="Farming Type" value={inquiry.farmingType} />
              <InfoItem label="Land Area" value={inquiry.landArea} />
              <InfoItem label="Main Crops" value={inquiry.mainCrops} />
              <InfoItem label="Irrigation Type" value={inquiry.irrigationType} />
              <InfoItem label="Bank Account" value={inquiry.bankAccountNumber} />
              <InfoItem label="IFSC" value={inquiry.ifscCode} />
              <InfoItem label="Farmer Action" value={inquiry.farmerActionNote} />
              <InfoItem label="Address" value={inquiry.fullAddress} />
              <InfoItem label="Terms Accepted" value={inquiry.termsAccepted ? "Yes" : "No"} />
              <InfoItem label="Notes" value={inquiry.message} />
            </div>
          ) : null}

          {inquiry.inquiryType === "COLLECTION_HUB" ? (
            <div className="form-grid-2">
              <InfoItem label="Father Name" value={inquiry.fatherName} />
              <InfoItem label="Aadhaar" value={inquiry.aadhaarNumber} />
              <InfoItem label="Alternate Number" value={inquiry.alternatePhone} />
              <InfoItem label="Hub Name" value={inquiry.collectionHubName} />
              <InfoItem label="Hub Code" value={inquiry.hubCode} />
              <InfoItem label="Storage Type" value={inquiry.hubStorageType} />
              <InfoItem label="Capacity (MT)" value={inquiry.hubCapacityMt} />
              <InfoItem label="Pickup Radius (KM)" value={inquiry.hubPickupRadiusKm} />
              <InfoItem label="Operating Days" value={inquiry.hubOperatingDays} />
              <InfoItem label="Village" value={inquiry.village} />
              <InfoItem label="District" value={inquiry.district} />
              <InfoItem label="State" value={inquiry.farmerState} />
              <InfoItem label="PIN Code" value={inquiry.pinCode} />
              <InfoItem label="Hub Action" value={inquiry.hubActionNote} />
              <InfoItem label="Address" value={inquiry.fullAddress} />
              <InfoItem label="Terms Accepted" value={inquiry.termsAccepted ? "Yes" : "No"} />
              <InfoItem label="Notes" value={inquiry.message} />
            </div>
          ) : null}

          <div className="inquiry-doc-links">
            <DocumentLink label="ID Proof" documentId={inquiry.idProofDocumentId} path={inquiry.idProofUrl} />
            <DocumentLink label="Payment Screenshot" documentId={inquiry.paymentScreenshotDocumentId} path={inquiry.paymentScreenshotUrl} />
            <DocumentLink label="Aadhaar Document" documentId={inquiry.aadhaarDocumentId} path={inquiry.aadhaarDocumentUrl} />
            <DocumentLink label="Land Proof" documentId={inquiry.landProofDocumentId} path={inquiry.landProofDocumentUrl} />
            <DocumentLink label="Bank Passbook" documentId={inquiry.bankPassbookDocumentId} path={inquiry.bankPassbookDocumentUrl} />
            <DocumentLink label="Hub Document" documentId={inquiry.hubDocumentId} path={inquiry.hubDocumentUrl} />
          </div>
        </article>
      ) : null}

      <InquiryForm
        title="Update Inquiry"
        initialValues={values}
        owners={owners}
        lockAssignedTo={isSales}
        loading={loading}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        onConvertToLead={handleConvertToLead}
        disableConvert={inquiry?.status === "CONVERTED"}
      />
    </section>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <strong>{label}</strong>
      <p className="table-muted">{value ?? "-"}</p>
    </div>
  );
}

function DocumentLink({ label, documentId, path }: { label: string; documentId: string | null; path: string | null }) {
  const [opening, setOpening] = useState(false);
  const documentReference = documentId ?? path;

  if (!documentReference) {
    return null;
  }

  async function handleOpen() {
    if (!documentReference) {
      return;
    }

    try {
      setOpening(true);
      if (/^https?:\/\//i.test(documentReference)) {
        window.open(documentReference, "_blank", "noopener,noreferrer");
        return;
      }

      const previewWindow = window.open("about:blank", "_blank");
      if (!previewWindow) {
        throw new Error("Browser blocked document preview.");
      }
      previewWindow.opener = null;
      previewWindow.document.write("Loading document preview...");

      const blob = await downloadAdminDocumentContentApi(documentReference);
      const objectUrl = URL.createObjectURL(blob);
      previewWindow.location.href = objectUrl;
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      alert(readErrorMessage(error, `Unable to open ${label}.`));
    } finally {
      setOpening(false);
    }
  }

  return (
    <button
      type="button"
      className="button-link button-small button-link-secondary"
      onClick={handleOpen}
      disabled={opening}
    >
      {opening ? "Opening..." : `View ${label}`}
    </button>
  );
}
