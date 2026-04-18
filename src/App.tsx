import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomerEditPage } from "./pages/CustomerEditPage";
import { CustomerListPage } from "./pages/CustomerListPage";
import { InquiryCreatePage } from "./pages/InquiryCreatePage";
import { InquiryEditPage } from "./pages/InquiryEditPage";
import { InquiryListPage } from "./pages/InquiryListPage";
import { InvestorListPage } from "./pages/InvestorListPage";
import { LeadCreatePage } from "./pages/LeadCreatePage";
import { LeadEditPage } from "./pages/LeadEditPage";
import { LeadListPage } from "./pages/LeadListPage";
import { LoginPage } from "./pages/LoginPage";
import { MonthlyReturnsPage } from "./pages/MonthlyReturnsPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { OrdersPage } from "./pages/OrdersPage";
import { PayoutCenterPage } from "./pages/PayoutCenterPage";
import { ProductCreatePage } from "./pages/ProductCreatePage";
import { ProductEditPage } from "./pages/ProductEditPage";
import { ProductListPage } from "./pages/ProductListPage";
import { SettingsPage } from "./pages/SettingsPage";
import { UserCreatePage } from "./pages/UserCreatePage";
import { UserEditPage } from "./pages/UserEditPage";
import { UserListPage } from "./pages/UserListPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/customers" element={<CustomerListPage />} />
          <Route path="/customers/:id/edit" element={<CustomerEditPage />} />
          <Route path="/investors" element={<InvestorListPage />} />
          <Route path="/investments" element={<Navigate to="/investors" replace />} />
          <Route path="/monthly-returns" element={<MonthlyReturnsPage />} />
          <Route path="/payouts" element={<PayoutCenterPage />} />
          <Route path="/receipts" element={<Navigate to="/payouts" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/new" element={<ProductCreatePage />} />
          <Route path="/products/:id/edit" element={<ProductEditPage />} />
          <Route path="/leads" element={<LeadListPage />} />
          <Route path="/leads/new" element={<LeadCreatePage />} />
          <Route path="/leads/:id/edit" element={<LeadEditPage />} />
          <Route path="/inquiries" element={<InquiryListPage />} />
          <Route path="/inquiries/new" element={<InquiryCreatePage />} />
          <Route path="/inquiries/:id/edit" element={<InquiryEditPage />} />
          <Route path="/users" element={<UserListPage />} />
          <Route path="/users/new" element={<UserCreatePage />} />
          <Route path="/users/:id/edit" element={<UserEditPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
