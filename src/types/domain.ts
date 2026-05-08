export type OrderStatus =
  | "PENDING_REVIEW"
  | "QUOTED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItem = {
  id: number;
  productId: number | null;
  productName: string;
  productSlug: string;
  quantity: number;
  unit: string;
  moqSnapshot: string;
  unitPrice: number | null;
  lineSubtotal: number | null;
  taxRate: number | null;
  taxAmount: number | null;
  discountRate: number | null;
  discountAmount: number | null;
  lineTotal: number | null;
};

export type OrderHistory = {
  status: OrderStatus;
  note: string;
  changedAt: string;
};

export type Order = {
  id: number;
  customerId: number | null;
  orderNumber: string;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  state: string;
  postalCode: string;
  customerNotes: string;
  status: OrderStatus;
  currency: string;
  createdAt: string;
  quotedAt: string | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  adminNotes: string | null;
  quoteReference: string | null;
  subtotalAmount: number | null;
  shippingAmount: number | null;
  taxAmount: number | null;
  discountAmount: number | null;
  effectiveTaxRate: number | null;
  effectiveDiscountRate: number | null;
  totalAmount: number | null;
  items: OrderItem[];
  statusHistory: OrderHistory[];
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  role: string;
};

export type AdminRole = {
  id: number;
  code: string;
  name: string;
};

export type OwnerOption = {
  id: number;
  username: string;
  displayName: string;
};

export type AdminUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  roleCode: string;
  roleName: string;
};

export type AdminCustomer = {
  id: number;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  state: string;
  postalCode: string;
  active: boolean;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  totalOrders: number;
  lastOrderNumber: string | null;
  lastOrderAt: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number | null;
  priceUnit: string;
  defaultTaxRate: number | null;
  defaultDiscountRate: number | null;
  status: ProductStatus;
  imageUrl: string | null;
  imageOriginalFileName: string | null;
  imageContentType: string | null;
  imageSizeBytes: number | null;
  shortDescription: string;
  longDescription: string;
  moq: string;
  featured: boolean;
  categoryId: number;
  categoryName: string;
};

export type ProductStatus = "ACTIVE" | "INACTIVE";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "DISQUALIFIED"
  | "CONVERTED"
  | "CLOSED";

export type Lead = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  companyName: string | null;
  status: LeadStatus;
  source: string;
  notes: string | null;
  assignedTo: string | null;
  inquiryId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type InquiryStatus =
  | "NEW"
  | "IN_PROGRESS"
  | "CONTACTED"
  | "QUOTED"
  | "CONVERTED"
  | "CLOSED";

export type InquiryType = "GENERAL" | "INVESTOR" | "FARMER" | "COLLECTION_HUB";

export type VerificationStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export type PaymentStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "RECEIVED"
  | "VERIFIED"
  | "FAILED";

export type InvestorAccountStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "SUSPENDED"
  | "CLOSED";

export type InvestmentStatus = "ACTIVE" | "PAUSED" | "CLOSED";

export type InvestorMonthlyReturnStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "HOLD"
  | "PAID";

export type MonthlyReturnDistributionMode = "COMPANY_PROFIT" | "RATE_BASED" | "PROFIT_POOL";

export type InvestorPayoutStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PAID"
  | "REJECTED"
  | "FAILED";

export type InvestorAccount = {
  id: number;
  investorCode: string;
  fullName: string;
  email: string;
  phone: string;
  sourceInquiryId: number | null;
  status: InvestorAccountStatus;
  verificationStatus: VerificationStatus;
  notes: string | null;
  totalInvested: number;
  totalReturnsReceived: number;
  pendingPayout: number;
  createdAt: string;
  updatedAt: string;
};

export type Investment = {
  id: number;
  investorId: number;
  investorCode: string;
  investorName: string;
  investmentReference: string;
  principalAmount: number;
  monthlyReturnRate: number;
  startDate: string;
  endDate: string | null;
  status: InvestmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvestorMonthlyReturn = {
  id: number;
  investorId: number;
  investorCode: string;
  investorName: string;
  investmentId: number;
  investmentReference: string;
  periodYear: number;
  periodMonth: number;
  basePrincipal: number;
  returnRate: number;
  calculatedAmount: number;
  overrideAmount: number | null;
  finalAmount: number;
  overrideReason: string | null;
  status: InvestorMonthlyReturnStatus;
  payoutId: number | null;
  payoutReference: string | null;
  submittedBy: string | null;
  submittedAt: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InvestorPayout = {
  id: number;
  investorId: number;
  investorCode: string;
  investorName: string;
  payoutReference: string;
  totalAmount: number;
  status: InvestorPayoutStatus;
  paymentChannel: string | null;
  transactionReference: string | null;
  notes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  paidAt: string | null;
  receiptId: number | null;
  receiptNumber: string | null;
  createdAt: string;
  updatedAt: string;
  monthlyReturnIds: number[];
};

export type InvestorReceipt = {
  id: number;
  payoutId: number;
  payoutReference: string;
  investorId: number;
  investorCode: string;
  investorName: string;
  payoutAmount: number;
  receiptNumber: string;
  documentUrl: string | null;
  version: number;
  generatedBy: string | null;
  generatedAt: string;
};

export type InvestorOverview = {
  investors: InvestorAccount[];
  activeInvestors: InvestorAccount[];
  investments: Investment[];
};

export type InvestorProfileUpsertPayload = {
  investorCode?: string;
  fullName: string;
  email: string;
  phone: string;
  sourceInquiryId?: number | null;
  status: InvestorAccountStatus;
  verificationStatus: VerificationStatus;
  notes?: string | null;
  investmentId?: number | null;
  principalAmount?: number | null;
  monthlyReturnRate?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  investmentStatus?: InvestmentStatus | null;
  investmentNotes?: string | null;
};

export type InvestorProfileResponse = {
  investor: InvestorAccount;
  investment: Investment | null;
};

export type Inquiry = {
  id: number;
  inquiryType: InquiryType;
  referenceId: string | null;
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  alternatePhone: string | null;
  fatherName: string | null;
  aadhaarNumber: string | null;
  panNumber: string | null;
  fullAddress: string | null;
  productName: string;
  message: string;
  investmentAmount: number | null;
  investmentDate: string | null;
  preferredPaymentMode: string | null;
  transactionId: string | null;
  paymentDate: string | null;
  farmingType: string | null;
  landArea: string | null;
  mainCrops: string | null;
  irrigationType: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
  village: string | null;
  district: string | null;
  farmerState: string | null;
  pinCode: string | null;
  collectionHubName: string | null;
  hubStorageType: string | null;
  hubCapacityMt: number | null;
  hubPickupRadiusKm: number | null;
  hubOperatingDays: string | null;
  hubCode: string | null;
  idProofUrl: string | null;
  idProofMetadata: string | null;
  paymentScreenshotUrl: string | null;
  paymentScreenshotMetadata: string | null;
  aadhaarDocumentUrl: string | null;
  aadhaarDocumentMetadata: string | null;
  landProofDocumentUrl: string | null;
  landProofDocumentMetadata: string | null;
  bankPassbookDocumentUrl: string | null;
  bankPassbookDocumentMetadata: string | null;
  hubDocumentUrl: string | null;
  hubDocumentMetadata: string | null;
  termsAccepted: boolean;
  agreementId: string | null;
  committedReturnAmount: number | null;
  farmerActionNote: string | null;
  hubActionNote: string | null;
  verificationStatus: VerificationStatus;
  paymentStatus: PaymentStatus;
  source: string;
  adminNotes: string | null;
  assignedTo: string | null;
  convertedLeadId: number | null;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
};
