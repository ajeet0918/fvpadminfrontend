import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
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
  const desktop = useMediaQuery("(min-width: 1024px)");
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
    <div className="admin-shell">
      <a href="#admin-main" className="skip-navigation">Skip to content</a>
      <Drawer
        variant={desktop ? "permanent" : "temporary"}
        open={desktop || mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        sx={{ width: desktop ? (sidebarCollapsed ? 80 : 256) : 0, flexShrink: 0 }}
        slotProps={{
          paper: {
            id: "admin-navigation",
            "aria-label": "Admin navigation",
            className: "admin-sidebar",
            sx: {
              width: desktop && sidebarCollapsed ? 80 : 256,
              position: desktop ? "relative" : "fixed",
              height: "100%",
              backgroundColor: "#142c22",
              color: "#fff",
              borderRight: "1px solid #253d32"
            }
          }
        }}
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className={`admin-brand ${sidebarCollapsed ? "lg:px-2" : ""}`}>
            <div className="flex min-h-12 items-center justify-between">
              <div className={`flex min-w-0 items-center ${sidebarCollapsed ? "gap-3 lg:gap-0" : "gap-3"}`}>
                <img
                  src="/assets/logofvp.jpeg"
                  alt="FVP Purepick"
                  className={`shrink-0 rounded-md border border-white/20 object-cover ${sidebarCollapsed ? "h-10 w-10 lg:h-8 lg:w-8" : "h-10 w-10"}`}
                />
                <div
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    sidebarCollapsed ? "max-w-[180px] lg:max-w-0 lg:opacity-0" : "max-w-[180px] opacity-100"
                  }`}
                >
                  <p className="m-0 text-base font-semibold text-white">FVP Purepick</p>
                  <p className="m-0 text-xs text-white/60">Admin workspace</p>
                </div>
              </div>
              <button
                type="button"
                className="hidden shrink-0 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:inline-flex"
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                onClick={() => setSidebarCollapsed((prev) => !prev)}
              >
                {sidebarCollapsed ? <MenuRoundedIcon fontSize="small" /> : <MenuOpenRoundedIcon fontSize="small" />}
              </button>
              <button
                type="button"
                className="inline-flex shrink-0 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Close navigation"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <CloseRoundedIcon fontSize="small" />
              </button>
            </div>
          </div>

          <nav className="admin-navigation" aria-label="Admin navigation">
            {navSections.map((section) => (
              <div key={section.label} className="admin-nav-section">
                <p className={`admin-nav-section-label ${sidebarCollapsed ? "lg:sr-only" : ""}`}>
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

          <div className="admin-sidebar-footer">
            <button
              type="button"
              className={`admin-logout-button ${
                sidebarCollapsed ? "lg:justify-center lg:px-2" : ""
              }`}
              onClick={logout}
              title="Logout"
            >
              <span className={`inline-flex items-center ${sidebarCollapsed ? "gap-2 lg:gap-0" : "gap-2"} overflow-hidden`}>
                <LogoutRoundedIcon fontSize="small" />
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                    sidebarCollapsed ? "max-w-20 lg:max-w-0 lg:opacity-0" : "max-w-20 opacity-100"
                  }`}
                >
                  Logout
                </span>
              </span>
            </button>
          </div>
        </div>
      </Drawer>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-inner">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="button-link button-link-secondary button-small shrink-0 lg:hidden"
                aria-label="Open sidebar"
                aria-expanded={mobileSidebarOpen}
                aria-controls="admin-navigation"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <MenuRoundedIcon fontSize="small" />
              </button>
              <div className="admin-workspace-label">
                <span>Workspace</span>
                <span className="admin-breadcrumb-separator" aria-hidden="true">/</span>
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

        <main className="admin-main" id="admin-main" tabIndex={-1}>
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
