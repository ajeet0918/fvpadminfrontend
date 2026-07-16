import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { clearAccessToken, hasUsableAccessToken, subscribeToAuthChanges } from "../lib/auth";
import { validateAdminSessionApi } from "../lib/api";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

type AuthSessionContextValue = {
  status: AuthStatus;
  refreshSession: () => Promise<void>;
};

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");

  async function refreshSession() {
    if (!hasUsableAccessToken()) {
      clearAccessToken();
      setStatus("unauthenticated");
      return;
    }

    setStatus("checking");

    try {
      await validateAdminSessionApi();
      setStatus("authenticated");
    } catch {
      clearAccessToken();
      setStatus("unauthenticated");
    }
  }

  useEffect(() => {
    void refreshSession();

    return subscribeToAuthChanges(() => {
      void refreshSession();
    });
  }, []);

  const contextValue = useMemo(
    () => ({ status, refreshSession }),
    [status]
  );

  return (
    <AuthSessionContext.Provider value={contextValue}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const contextValue = useContext(AuthSessionContext);
  if (!contextValue) {
    throw new Error("useAuthSession must be used inside AuthSessionProvider");
  }

  return contextValue;
}
