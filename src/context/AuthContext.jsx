
// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE, csrfHeaders, startSSO } from "../api/client";

const AuthCtx = createContext(null);

function readProfile() {
  try {
    return (
      JSON.parse(sessionStorage.getItem("user_info") || "null") ||
      JSON.parse(localStorage.getItem("user_info") || "null")
    );
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    sessionStorage.getItem("jwt") || localStorage.getItem("jwt") || null
  );
  const [profile, setProfile] = useState(readProfile());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Don’t auto-login; just detect current session
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    try {
      const res = await fetch(`${API_BASE}/auth/me?_=${Date.now()}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("not authed");
      const data = await res.json();
      setProfile(data || null);
      // Keep storages (optional)
      try {
        sessionStorage.setItem("user_info", JSON.stringify(data || null));
        localStorage.setItem("user_info", JSON.stringify(data || null));
      } catch {}
      return data || null;
    } catch {
      setProfile(null);
      return null;
    }
  }

  async function logout() {
    // Tell server to drop session
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: await csrfHeaders(),
      });
    } catch {}

    // Guard against auto SSO until user clicks Login again
    try { sessionStorage.setItem("forceLoggedOut", "1"); } catch {}

    // Clear all local hints
    const drop = (k) => { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch {} };
    ["sso_state", "sso_return_to", "jwt", "id_token", "user_info", "cookie_snapshot"].forEach(drop);

    setToken(null);
    setProfile(null);
  }

  const value = useMemo(
    () => ({
      token,
      setToken,
      profile,
      setProfile,
      login: startSSO,
      logout,
      refresh,
      loading,
      isAuthed: !!profile || !!token,
    }),
    [token, profile, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
