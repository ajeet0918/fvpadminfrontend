import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "./AuthSessionProvider";
import { LoadingState } from "./PageState";

export function ProtectedRoute() {
  const location = useLocation();
  const { status } = useAuthSession();

  if (status === "checking") {
    return (
      <div className="auth-check-screen">
        <LoadingState label="Checking your admin session..." />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
