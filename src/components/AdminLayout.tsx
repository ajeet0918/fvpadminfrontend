import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
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
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { clearAccessToken, getCurrentUsername } from "../lib/auth";

const navSections = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: DashboardRoundedIcon }
    ]
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", path: "/orders", icon: ShoppingCartRoundedIcon },
      { label: "Products", path: "/products", icon: Inventory2RoundedIcon },
      { label: "Customers", path: "/customers", icon: PeopleAltRoundedIcon }
    ]
  },
  {
    label: "Relationships",
    items: [
      { label: "Leads", path: "/leads", icon: CampaignRoundedIcon },
      { label: "Inquiries", path: "/inquiries", icon: ManageSearchRoundedIcon },
      { label: "Investors", path: "/investors", icon: AccountBalanceWalletRoundedIcon }
    ]
  },
  {
    label: "Finance",
    items: [
      { label: "Monthly Returns", path: "/monthly-returns", icon: TrendingUpRoundedIcon },
      { label: "Payouts & Receipts", path: "/payouts", icon: ReceiptLongRoundedIcon }
    ]
  },
  {
    label: "Administration",
    items: [
      { label: "Users", path: "/users", icon: AdminPanelSettingsRoundedIcon },
      { label: "Settings", path: "/settings", icon: SettingsRoundedIcon }
    ]
  }
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUsername = getCurrentUsername();
  const currentModule = getCurrentModule(location.pathname);
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
      <a className="admin-skip-link" href="#admin-main-content">Skip to workspace content</a>
      {mobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <aside
        id="admin-navigation"
        className={`admin-sidebar fixed inset-y-0 left-0 z-40 w-64 transition-[transform,width] duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-64"
        } ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className={`border-b border-white/10 py-3 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
            <div className="flex h-12 items-center justify-between">
              <div className={`flex min-w-0 items-center ${sidebarCollapsed ? "gap-0" : "gap-3"}`}>
                <img
                  src="/assets/logofvp.jpeg"
                  alt="FVP Purepick"
                  className={`shrink-0 rounded-md border border-white/20 object-cover ${sidebarCollapsed ? "h-8 w-8" : "h-10 w-10"}`}
                />
                <div
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-[180px] opacity-100"
                  }`}
                >
                  <p className="m-0 text-base font-semibold text-white">FVP Purepick</p>
                  <p className="m-0 text-xs text-white/60">Operations workspace</p>
                </div>
              </div>
              <button
                type="button"
                className="hidden shrink-0 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:inline-flex"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!sidebarCollapsed}
                onClick={() => setSidebarCollapsed((prev) => !prev)}
              >
                {sidebarCollapsed ? <MenuRoundedIcon fontSize="small" /> : <MenuOpenRoundedIcon fontSize="small" />}
              </button>
              <button
                type="button"
                className="inline-flex shrink-0 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Close navigation"
                aria-controls="admin-navigation"
                aria-expanded={mobileSidebarOpen}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-auto px-2 py-3" aria-label="Admin navigation">
            {navSections.map((section) => (
              <div key={section.label} className="mb-4">
                <p className={`admin-nav-section-label ${sidebarCollapsed ? "lg:hidden" : ""}`}>
                  {section.label}
                </p>
                {section.items.map((item) => {
                  const active = isActiveRoute(location.pathname, item.path);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      aria-current={active ? "page" : undefined}
                      className={`admin-nav-item ${active ? "active" : ""} ${
                        sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
                      }`}
                      title={item.label}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon fontSize="small" />
                      <span
                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                          sidebarCollapsed ? "lg:max-w-0 lg:opacity-0" : "max-w-[170px] opacity-100"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              className={`admin-logout-button ${
                sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
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
        <header className="admin-topbar">
          <div className="flex min-h-[60px] items-center justify-between gap-3 px-4 md:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="button-link button-link-secondary button-small lg:hidden"
                aria-label="Open sidebar"
                aria-controls="admin-navigation"
                aria-expanded={mobileSidebarOpen}
                onClick={() => setMobileSidebarOpen(true)}
              >
                <MenuRoundedIcon fontSize="small" />
              </button>
              <div className="admin-workspace-label">
                <span>FVP Purepick</span>
                <strong>{currentModule}</strong>
              </div>
            </div>
            <div className="admin-topbar-actions">
              {currentUsername ? (
                <div className="admin-user-chip" title={`Signed in as ${currentUsername}`}>
                  <AccountCircleOutlinedIcon fontSize="small" />
                  <span>{currentUsername}</span>
                </div>
              ) : null}
              <a
                className="button-link button-link-secondary button-small"
                href="https://www.fvppurepick.com/"
                target="_blank"
                rel="noreferrer"
              >
                View website
                <OpenInNewRoundedIcon fontSize="inherit" />
              </a>
            </div>
          </div>
        </header>

        <main id="admin-main-content" className="min-h-0 flex-1 overflow-auto" tabIndex={-1}>
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

function getCurrentModule(pathname: string) {
  const activeItem = navSections
    .flatMap((section) => section.items)
    .find((item) => isActiveRoute(pathname, item.path));
  return activeItem?.label ?? "Operations workspace";
}
