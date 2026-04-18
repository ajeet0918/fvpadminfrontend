import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAccessToken } from "../lib/auth";

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  function logout() {
    clearAccessToken();
    navigate("/login");
  }

  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <div className="admin-brand">
          <img src="/assets/logofvp.jpeg" alt="FVP Purepick" />
          <h1>FVP Purepick</h1>
          <p>Operations Console</p>
        </div>
        <nav>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/customers">Customers</NavLink>
          <NavLink to="/investors">Investors & Investments</NavLink>
          <NavLink to="/monthly-returns">Monthly Returns</NavLink>
          <NavLink to="/payouts">Payouts & Receipts</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/leads">Leads</NavLink>
          <NavLink to="/inquiries">Inquiries</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <button type="button" onClick={logout}>Logout</button>
      </aside>
      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <div className="admin-topbar-title">{resolvePageTitle(location.pathname)}</div>
        </header>
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function resolvePageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/orders") return "Order Search";
  if (pathname.startsWith("/orders/")) return "Edit Order";
  if (pathname === "/customers") return "Customer Search";
  if (pathname.startsWith("/customers/")) return "Edit Customer";
  if (pathname === "/investors") return "Investor Search";
  if (pathname === "/monthly-returns") return "Monthly Return Search";
  if (pathname === "/payouts") return "Payout Search";
  if (pathname === "/products") return "Product Search";
  if (pathname === "/products/new") return "Create Product";
  if (pathname.startsWith("/products/")) return "Edit Product";
  if (pathname === "/leads") return "Lead Search";
  if (pathname === "/leads/new") return "Create Lead";
  if (pathname.startsWith("/leads/")) return "Edit Lead";
  if (pathname === "/inquiries") return "Inquiry Search";
  if (pathname === "/inquiries/new") return "Create Inquiry";
  if (pathname.startsWith("/inquiries/")) return "Edit Inquiry";
  if (pathname === "/users") return "User Search";
  if (pathname === "/users/new") return "Create User";
  if (pathname.startsWith("/users/")) return "Edit User";
  if (pathname === "/settings") return "Settings";
  return "Admin";
}
