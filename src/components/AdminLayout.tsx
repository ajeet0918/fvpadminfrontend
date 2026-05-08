import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ManageSearchRoundedIcon from "@mui/icons-material/ManageSearchRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { clearAccessToken } from "../lib/auth";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: DashboardRoundedIcon },
  { label: "Orders", path: "/orders", icon: ShoppingCartRoundedIcon },
  { label: "Customers", path: "/customers", icon: PeopleAltRoundedIcon },
  { label: "Investors & Investments", path: "/investors", icon: AccountBalanceWalletRoundedIcon },
  { label: "Monthly Returns", path: "/monthly-returns", icon: TrendingUpRoundedIcon },
  { label: "Payouts & Receipts", path: "/payouts", icon: ReceiptLongRoundedIcon },
  { label: "Products", path: "/products", icon: Inventory2RoundedIcon },
  { label: "Leads", path: "/leads", icon: CampaignRoundedIcon },
  { label: "Inquiries", path: "/inquiries", icon: ManageSearchRoundedIcon },
  { label: "Users", path: "/users", icon: AdminPanelSettingsRoundedIcon },
  { label: "Settings", path: "/settings", icon: SettingsRoundedIcon }
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  function logout() {
    clearAccessToken();
    navigate("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-app text-text-primary">
      {mobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-[#14532d] bg-brand text-green-50 transition-[transform,width] duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className={`border-b border-white/20 py-3 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
            <div className="flex h-12 items-center justify-between">
              <div className={`flex min-w-0 items-center ${sidebarCollapsed ? "gap-0" : "gap-3"}`}>
                <img
                  src="/assets/logofvp.jpeg"
                  alt="FVP Purepick"
                  className={`shrink-0 rounded-lg border border-white/30 object-cover ${sidebarCollapsed ? "h-8 w-8" : "h-10 w-10"}`}
                />
                <div
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
                  }`}
                >
                  <p className="m-0 text-base font-semibold text-white">FVP Purepick</p>
                  <p className="m-0 text-xs text-green-100/90">Operations Console</p>
                </div>
              </div>
              <button
                type="button"
                className="hidden shrink-0 rounded-md p-1 text-green-100 hover:bg-white/10 lg:inline-flex"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setSidebarCollapsed((prev) => !prev)}
              >
                {sidebarCollapsed ? <MenuRoundedIcon fontSize="small" /> : <MenuOpenRoundedIcon fontSize="small" />}
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-auto p-2">
            {navItems.map((item) => {
              const active = isActiveRoute(location.pathname, item.path);
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  className={`mb-1 flex h-10 w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                    sidebarCollapsed ? "justify-center" : "justify-start gap-3"
                  } ${
                    active
                      ? "bg-white text-brand shadow-sm"
                      : "text-green-50 hover:bg-white/10"
                  }`}
                  title={item.label}
                  onClick={() => navigate(item.path)}
                >
                  <Icon fontSize="small" />
                  <span
                    className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                      sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[170px] opacity-100"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-white/20 p-3">
            <button
              type="button"
              className={`button-link bg-white text-brand hover:bg-green-50 ${
                sidebarCollapsed ? "w-full px-2" : "w-full justify-center"
              }`}
              onClick={logout}
              title="Logout"
            >
              <span className={`inline-flex items-center ${sidebarCollapsed ? "" : "gap-2"} overflow-hidden`}>
                <LogoutRoundedIcon fontSize="small" />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-20 opacity-100"
                  }`}
                >
                  Logout
                </span>
              </span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
          <div className="flex min-h-[56px] items-center justify-between gap-3 px-4 md:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="button-link button-link-secondary button-small lg:hidden"
                aria-label="Open sidebar"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <MenuRoundedIcon fontSize="small" />
              </button>
              <h1 className="m-0 text-lg font-semibold text-text-primary">{resolvePageTitle(location.pathname)}</h1>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">
          <div className="admin-main-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function isActiveRoute(current: string, navPath: string) {
  if (navPath === "/dashboard") {
    return current === "/dashboard" || current === "/";
  }
  return current === navPath || current.startsWith(`${navPath}/`);
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
