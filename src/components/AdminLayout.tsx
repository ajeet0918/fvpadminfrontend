import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearAccessToken } from "../lib/auth";

export function AdminLayout() {
  const navigate = useNavigate();

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
          <div className="admin-topbar-title">Admin Dashboard</div>
        </header>
        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
