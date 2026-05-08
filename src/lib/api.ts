/// <reference types="vite/client" />
import axios from "axios";
import { clearAccessToken, getAccessToken } from "./auth";
import type {
  AdminCustomer,
  AdminProduct,
  AdminRole,
  AdminUser,
  Category,
  Inquiry,
  InquiryType,
  InquiryStatus,
  Lead,
  LeadStatus,
  LoginResponse,
  Investment,
  InvestorAccount,
  InvestorOverview,
  InvestorProfileResponse,
  InvestorProfileUpsertPayload,
  InvestorMonthlyReturn,
  InvestorPayout,
  InvestorReceipt,
  InvestorMonthlyReturnStatus,
  InvestorPayoutStatus,
  InvestorAccountStatus,
  InvestmentStatus,
  MonthlyReturnDistributionMode,
  OwnerOption,
  Order,
  OrderStatus,
  PaymentStatus,
  VerificationStatus
} from "../types/domain";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error("Missing VITE_API_BASE_URL. Set it in admin-frontend/.env");
}

export const API_BASE_URL = apiBaseUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAccessToken();
    }
    return Promise.reject(error);
  }
);

export async function loginApi(payload: { username: string; password: string }) {
  const response = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/login`, payload);
  return response.data;
}

export async function fetchOrdersApi() {
  const response = await apiClient.get<Order[]>("/orders");
  return response.data;
}

export async function fetchOrderApi(id: number) {
  const response = await apiClient.get<Order>(`/orders/${id}`);
  return response.data;
}

export async function quoteOrderApi(orderId: number, payload: {
  quoteReference: string;
  adminNotes: string;
  shippingAmount: number;
  taxAmount?: number | null;
  discountAmount?: number | null;
  items: Array<{ itemId: number; unitPrice: number; taxRate?: number | null; discountRate?: number | null }>;
}) {
  const response = await apiClient.post<Order>(`/orders/${orderId}/quote`, payload);
  return response.data;
}

export async function updateOrderStatusApi(orderId: number, payload: { status: OrderStatus; adminNotes: string }) {
  const response = await apiClient.patch<Order>(`/orders/${orderId}/status`, payload);
  return response.data;
}

export async function fetchAdminRolesApi() {
  const response = await apiClient.get<AdminRole[]>("/admin/roles");
  return response.data;
}

export async function fetchAssignableOwnersApi() {
  const response = await apiClient.get<OwnerOption[]>("/admin/owners");
  return response.data;
}

export async function fetchAdminUsersApi() {
  const response = await apiClient.get<AdminUser[]>("/admin/users");
  return response.data;
}

export async function fetchAdminUsersWithFiltersApi(filters: {
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "";
  roleCode?: string;
}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.roleCode?.trim()) params.set("roleCode", filters.roleCode.trim().toUpperCase());

  const response = await apiClient.get<AdminUser[]>("/admin/users", { params });
  return response.data;
}

export async function fetchAdminUserApi(userId: number) {
  const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
  return response.data;
}

export async function createAdminUserApi(payload: {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  roleCode: string;
  active: boolean;
}) {
  const response = await apiClient.post<AdminUser>("/admin/users", payload);
  return response.data;
}

export async function updateAdminUserApi(userId: number, payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleCode: string;
  active: boolean;
}) {
  const response = await apiClient.put<AdminUser>(`/admin/users/${userId}`, payload);
  return response.data;
}

export async function resetAdminUserPasswordApi(userId: number, payload: { newPassword: string }) {
  const response = await apiClient.post<AdminUser>(`/admin/users/${userId}/reset-password`, payload);
  return response.data;
}

export async function deleteAdminUserApi(userId: number) {
  await apiClient.delete(`/admin/users/${userId}`);
}

export async function fetchAdminCustomersWithFiltersApi(filters: {
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "";
}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);

  const response = await apiClient.get<AdminCustomer[]>("/admin/customers", { params });
  return response.data;
}

export async function fetchAdminCustomerApi(customerId: number) {
  const response = await apiClient.get<AdminCustomer>(`/admin/customers/${customerId}`);
  return response.data;
}

export async function updateAdminCustomerApi(customerId: number, payload: {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  state: string;
  postalCode: string;
  active: boolean;
}) {
  const response = await apiClient.put<AdminCustomer>(`/admin/customers/${customerId}`, payload);
  return response.data;
}

export async function fetchCategoriesApi() {
  const response = await apiClient.get<Category[]>("/categories");
  return response.data;
}

export async function fetchAdminProductsApi() {
  const response = await apiClient.get<AdminProduct[]>("/admin/products");
  return response.data;
}

export async function fetchAdminProductsWithFiltersApi(filters: {
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "";
  categoryId?: string;
}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.categoryId?.trim()) params.set("categoryId", filters.categoryId.trim());

  const response = await apiClient.get<AdminProduct[]>("/admin/products", { params });
  return response.data;
}

export async function fetchAdminProductApi(productId: number) {
  const response = await apiClient.get<AdminProduct>(`/admin/products/${productId}`);
  return response.data;
}

export async function createAdminProductApi(payload: {
  name: string;
  slug: string;
  sku: string;
  price: number;
  priceUnit: string;
  defaultTaxRate: number;
  defaultDiscountRate: number;
  status: "ACTIVE" | "INACTIVE";
  imageUrl: string | null;
  imageOriginalFileName: string | null;
  imageContentType: string | null;
  imageSizeBytes: number | null;
  shortDescription: string;
  longDescription: string;
  moq: string;
  featured: boolean;
  categoryId: number;
}) {
  const response = await apiClient.post<AdminProduct>("/admin/products", payload);
  return response.data;
}

export async function uploadProductImageApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<{
    imageUrl: string;
    fileName: string;
    originalFileName: string | null;
    contentType: string | null;
    sizeBytes: number | null;
  }>(
    "/admin/products/upload-image",
    formData
  );
  return response.data;
}

export async function updateAdminProductApi(productId: number, payload: {
  name: string;
  slug: string;
  sku: string;
  price: number;
  priceUnit: string;
  defaultTaxRate: number;
  defaultDiscountRate: number;
  status: "ACTIVE" | "INACTIVE";
  imageUrl: string | null;
  imageOriginalFileName: string | null;
  imageContentType: string | null;
  imageSizeBytes: number | null;
  shortDescription: string;
  longDescription: string;
  moq: string;
  featured: boolean;
  categoryId: number;
}) {
  const response = await apiClient.put<AdminProduct>(`/admin/products/${productId}`, payload);
  return response.data;
}

export async function deleteAdminProductApi(productId: number) {
  await apiClient.delete(`/admin/products/${productId}`);
}

export async function fetchLeadsApi(filters: {
  search?: string;
  status?: LeadStatus | "";
  source?: string;
  assignedTo?: string;
}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.source?.trim()) params.set("source", filters.source.trim());
  if (filters.assignedTo?.trim()) params.set("assignedTo", filters.assignedTo.trim());

  const response = await apiClient.get<Lead[]>("/admin/leads", { params });
  return response.data;
}

export async function fetchLeadApi(leadId: number) {
  const response = await apiClient.get<Lead>(`/admin/leads/${leadId}`);
  return response.data;
}

export async function createLeadApi(payload: {
  fullName: string;
  email: string;
  phone: string;
  companyName: string | null;
  source: string | null;
  notes: string | null;
  assignedTo: string | null;
  inquiryId: number | null;
}) {
  const response = await apiClient.post<Lead>("/admin/leads", payload);
  return response.data;
}

export async function updateLeadApi(leadId: number, payload: {
  fullName: string;
  email: string;
  phone: string;
  companyName: string | null;
  status: LeadStatus;
  source: string | null;
  notes: string | null;
  assignedTo: string | null;
  inquiryId: number | null;
}) {
  const response = await apiClient.put<Lead>(`/admin/leads/${leadId}`, payload);
  return response.data;
}

export async function deleteLeadApi(leadId: number) {
  await apiClient.delete(`/admin/leads/${leadId}`);
}

export async function fetchInquiriesApi(filters: {
  search?: string;
  status?: InquiryStatus | "";
  source?: string;
  assignedTo?: string;
  inquiryType?: InquiryType | "";
}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.source?.trim()) params.set("source", filters.source.trim());
  if (filters.assignedTo?.trim()) params.set("assignedTo", filters.assignedTo.trim());
  if (filters.inquiryType) params.set("inquiryType", filters.inquiryType);

  const response = await apiClient.get<Inquiry[]>("/admin/inquiries", { params });
  return response.data;
}

export async function fetchInquiryApi(inquiryId: number) {
  const response = await apiClient.get<Inquiry>(`/admin/inquiries/${inquiryId}`);
  return response.data;
}

export async function createInquiryApi(payload: {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  productName: string;
  message: string;
}) {
  const response = await apiClient.post<Inquiry>("/inquiries", payload);
  return response.data;
}

export async function updateInquiryApi(inquiryId: number, payload: {
  status: InquiryStatus;
  verificationStatus?: VerificationStatus | null;
  paymentStatus?: PaymentStatus | null;
  agreementId?: string | null;
  committedReturnAmount?: number | null;
  farmerActionNote?: string | null;
  hubActionNote?: string | null;
  adminNotes: string | null;
  assignedTo: string | null;
}) {
  const response = await apiClient.put<Inquiry>(`/admin/inquiries/${inquiryId}`, payload);
  return response.data;
}

export async function convertInquiryToLeadApi(inquiryId: number, payload: {
  leadNotes: string | null;
  assignedTo: string | null;
}) {
  const response = await apiClient.post<Inquiry>(`/admin/inquiries/${inquiryId}/convert-to-lead`, payload);
  return response.data;
}

export async function fetchInvestorsApi(filters: {
  search?: string;
  status?: InvestorAccountStatus | "";
  verificationStatus?: VerificationStatus | "";
}) {
  const params = new URLSearchParams();
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.verificationStatus) params.set("verificationStatus", filters.verificationStatus);
  const response = await apiClient.get<InvestorAccount[]>("/admin/investor-platform/investors", { params });
  return response.data;
}

export async function fetchInvestorOverviewApi(filters: {
  investorSearch?: string;
  investorStatus?: InvestorAccountStatus | "";
  verificationStatus?: VerificationStatus | "";
  investmentSearch?: string;
  investmentStatus?: InvestmentStatus | "";
}) {
  const params = new URLSearchParams();
  if (filters.investorSearch?.trim()) params.set("investorSearch", filters.investorSearch.trim());
  if (filters.investorStatus) params.set("investorStatus", filters.investorStatus);
  if (filters.verificationStatus) params.set("verificationStatus", filters.verificationStatus);
  if (filters.investmentSearch?.trim()) params.set("investmentSearch", filters.investmentSearch.trim());
  if (filters.investmentStatus) params.set("investmentStatus", filters.investmentStatus);
  const response = await apiClient.get<InvestorOverview>("/admin/investor-platform/overview", { params });
  return response.data;
}

export async function fetchInvestorApi(investorId: number) {
  const response = await apiClient.get<InvestorAccount>(`/admin/investor-platform/investors/${investorId}`);
  return response.data;
}

export async function createInvestorApi(payload: {
  investorCode?: string;
  fullName: string;
  email: string;
  phone: string;
  sourceInquiryId?: number | null;
  status: InvestorAccountStatus;
  verificationStatus: VerificationStatus;
  notes?: string | null;
}) {
  const response = await apiClient.post<InvestorAccount>("/admin/investor-platform/investors", payload);
  return response.data;
}

export async function createInvestorProfileApi(payload: InvestorProfileUpsertPayload) {
  const response = await apiClient.post<InvestorProfileResponse>("/admin/investor-platform/profiles", payload);
  return response.data;
}

export async function updateInvestorProfileApi(investorId: number, payload: InvestorProfileUpsertPayload) {
  const response = await apiClient.put<InvestorProfileResponse>(`/admin/investor-platform/profiles/${investorId}`, payload);
  return response.data;
}

export async function updateInvestorApi(investorId: number, payload: {
  fullName: string;
  email: string;
  phone: string;
  status: InvestorAccountStatus;
  verificationStatus: VerificationStatus;
  notes?: string | null;
}) {
  const response = await apiClient.put<InvestorAccount>(`/admin/investor-platform/investors/${investorId}`, payload);
  return response.data;
}

export async function fetchInvestmentsApi(filters: {
  investorId?: number | null;
  status?: InvestmentStatus | "";
  search?: string;
}) {
  const params = new URLSearchParams();
  if (filters.investorId) params.set("investorId", String(filters.investorId));
  if (filters.status) params.set("status", filters.status);
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  const response = await apiClient.get<Investment[]>("/admin/investor-platform/investments", { params });
  return response.data;
}

export async function createInvestmentApi(payload: {
  investorId: number;
  investmentReference?: string;
  principalAmount: number;
  monthlyReturnRate: number;
  startDate: string;
  endDate?: string | null;
  status: InvestmentStatus;
  notes?: string | null;
}) {
  const response = await apiClient.post<Investment>("/admin/investor-platform/investments", payload);
  return response.data;
}

export async function updateInvestmentApi(investmentId: number, payload: {
  principalAmount: number;
  monthlyReturnRate: number;
  startDate: string;
  endDate?: string | null;
  status: InvestmentStatus;
  notes?: string | null;
}) {
  const response = await apiClient.put<Investment>(`/admin/investor-platform/investments/${investmentId}`, payload);
  return response.data;
}

export async function generateMonthlyReturnsApi(payload: {
  investorId?: number | null;
  year: number;
  month: number;
  distributionMode?: MonthlyReturnDistributionMode;
  monthlyRate?: number | null;
  distributableProfit?: number | null;
  companyFund?: number | null;
  companyProfit?: number | null;
  returnPercentage?: number | null;
}) {
  const response = await apiClient.post<InvestorMonthlyReturn[]>("/admin/investor-platform/returns/generate", payload);
  return response.data;
}

export async function fetchMonthlyReturnsApi(filters: {
  investorId?: number | null;
  year?: number | null;
  month?: number | null;
  status?: InvestorMonthlyReturnStatus | "";
}) {
  const params = new URLSearchParams();
  if (filters.investorId) params.set("investorId", String(filters.investorId));
  if (filters.year) params.set("year", String(filters.year));
  if (filters.month) params.set("month", String(filters.month));
  if (filters.status) params.set("status", filters.status);
  const response = await apiClient.get<InvestorMonthlyReturn[]>("/admin/investor-platform/returns", { params });
  return response.data;
}

export async function updateMonthlyReturnApi(monthlyReturnId: number, payload: {
  overrideAmount?: number | null;
  overrideReason?: string | null;
  notes?: string | null;
}) {
  const response = await apiClient.put<InvestorMonthlyReturn>(
    `/admin/investor-platform/returns/${monthlyReturnId}`,
    payload
  );
  return response.data;
}

export async function submitMonthlyReturnApi(monthlyReturnId: number, payload: { notes?: string | null }) {
  const response = await apiClient.post<InvestorMonthlyReturn>(
    `/admin/investor-platform/returns/${monthlyReturnId}/submit`,
    payload
  );
  return response.data;
}

export async function approveMonthlyReturnApi(monthlyReturnId: number, payload: { notes?: string | null }) {
  const response = await apiClient.post<InvestorMonthlyReturn>(
    `/admin/investor-platform/returns/${monthlyReturnId}/approve`,
    payload
  );
  return response.data;
}

export async function rejectMonthlyReturnApi(monthlyReturnId: number, payload: { notes?: string | null }) {
  const response = await apiClient.post<InvestorMonthlyReturn>(
    `/admin/investor-platform/returns/${monthlyReturnId}/reject`,
    payload
  );
  return response.data;
}

export async function holdMonthlyReturnApi(monthlyReturnId: number, payload: { notes?: string | null }) {
  const response = await apiClient.post<InvestorMonthlyReturn>(
    `/admin/investor-platform/returns/${monthlyReturnId}/hold`,
    payload
  );
  return response.data;
}

export async function fetchInvestorPayoutsApi(filters: {
  investorId?: number | null;
  status?: InvestorPayoutStatus | "";
}) {
  const params = new URLSearchParams();
  if (filters.investorId) params.set("investorId", String(filters.investorId));
  if (filters.status) params.set("status", filters.status);
  const response = await apiClient.get<InvestorPayout[]>("/admin/investor-platform/payouts", { params });
  return response.data;
}

export async function createInvestorPayoutRequestApi(payload: {
  investorId: number;
  monthlyReturnIds: number[];
  notes?: string | null;
}) {
  const response = await apiClient.post<InvestorPayout>("/admin/investor-platform/payouts/request", payload);
  return response.data;
}

export async function approveInvestorPayoutApi(payoutId: number, payload: { notes?: string | null }) {
  const response = await apiClient.post<InvestorPayout>(
    `/admin/investor-platform/payouts/${payoutId}/approve`,
    payload
  );
  return response.data;
}

export async function rejectInvestorPayoutApi(payoutId: number, payload: { notes?: string | null }) {
  const response = await apiClient.post<InvestorPayout>(
    `/admin/investor-platform/payouts/${payoutId}/reject`,
    payload
  );
  return response.data;
}

export async function markInvestorPayoutPaidApi(payoutId: number, payload: {
  paymentChannel: string;
  transactionReference: string;
  paidAt?: string | null;
  notes?: string | null;
}) {
  const response = await apiClient.post<InvestorPayout>(
    `/admin/investor-platform/payouts/${payoutId}/mark-paid`,
    payload
  );
  return response.data;
}

export async function generateInvestorReceiptApi(payoutId: number) {
  const response = await apiClient.post<InvestorReceipt>(`/admin/investor-platform/payouts/${payoutId}/generate-receipt`);
  return response.data;
}

export async function fetchInvestorReceiptsApi(filters: { investorId?: number | null }) {
  const params = new URLSearchParams();
  if (filters.investorId) params.set("investorId", String(filters.investorId));
  const response = await apiClient.get<InvestorReceipt[]>("/admin/investor-platform/receipts", { params });
  return response.data;
}

export async function downloadInvestorReceiptFileApi(receiptNumber: string) {
  const response = await apiClient.get<Blob>(
    `/admin/investor-platform/receipts/number/${encodeURIComponent(receiptNumber)}/download`,
    { responseType: "blob" }
  );
  return response.data;
}

export function readErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    return (
      (typeof error.response?.data?.message === "string" && error.response.data.message) ||
      error.message ||
      fallback
    );
  }

  return fallback;
}
