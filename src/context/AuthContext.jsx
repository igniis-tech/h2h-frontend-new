import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE, startSSO } from "../api/client.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we explicitly logged out on the client, skip re-fetching /auth/me
    const forced = sessionStorage.getItem("forceLoggedOut") === "1";
    if (forced) {
      setUser(null);
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/auth/me?_=${Date.now()}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = () => startSSO();

  // FRONTEND-ONLY logout: do not call /auth/logout (your backend doesn’t have it)
  const logout = () => {
    sessionStorage.setItem("forceLoggedOut", "1");
    try {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user_info");
      sessionStorage.removeItem("jwt");
      sessionStorage.removeItem("user_info");
    } catch {}
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, isAuthed: !!user, login, logout }),
    [user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
