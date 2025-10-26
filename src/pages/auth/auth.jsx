import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE, csrfHeaders, startSSO } from "../../api/client";

// Small helpers to read profile/token from storage
function readProfile() {
  try {
    return (
      JSON.parse(sessionStorage.getItem("user_info") || "null") ||
      JSON.parse(localStorage.getItem("user_info") || "null")
    );
  } catch {
    return null;
  }
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    sessionStorage.getItem("jwt") || localStorage.getItem("jwt") || null
  );
  const [profile, setProfile] = useState(readProfile());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      return data || null;
    } catch {
      setProfile(null);
      return null;
    }
  }

  async function logout() {
    // Clear Django session on the server
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: await csrfHeaders(),
      });
    } catch {}

    // Prevent auto-SSO loops after logout
    try { sessionStorage.setItem("forceLoggedOut", "1"); } catch {}

    // Clear everything client side
    const clear = (k) => { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch {} };
    ["sso_state", "sso_return_to", "jwt", "id_token", "user_info", "cookie_snapshot"].forEach(clear);

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
      isAuthed: !!profile,
    }),
    [token, profile, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
