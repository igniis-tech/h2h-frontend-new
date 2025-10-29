// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getAccessToken, setAuthTokens, startSSO } from "../api/client";

const AuthCtx = createContext(null);

// Read profile from storage for initial paint
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

export function AuthProvider({ children }) {
  // Initialize from storage so refreshes stay logged in
  const [token, setToken] = useState(
    sessionStorage.getItem("jwt") || localStorage.getItem("jwt") || null
  );
  const [profile, setProfile] = useState(readProfile());
  const [loading, setLoading] = useState(true);

  // First paint: probe /auth/me using Bearer from client.js
  useEffect(() => {
    refresh().finally(() => setLoading(false));

    // Listen for token writes from client.js (e.g., after /auth/callback)
    const onAuthUpdated = async () => {
      const t = getAccessToken();
      if (t && !token) setToken(t);
      await refresh();
    };
    window.addEventListener("auth:updated", onAuthUpdated);
    return () => window.removeEventListener("auth:updated", onAuthUpdated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    try {
      const me = await api.me(); // uses Bearer header (client.js)
      setProfile(me || null);
      try {
        sessionStorage.setItem("user_info", JSON.stringify(me || null));
        localStorage.setItem("user_info", JSON.stringify(me || null));
      } catch {}
      const t = getAccessToken();
      if (t && !token) setToken(t);
      return me || null;
    } catch {
      setProfile(null);
      return null;
    }
  }

  async function logout() {
    try { await api.logout(); } catch {}
    setAuthTokens({ access: null, refresh: null });
    try {
      ["sso_state","sso_return_to","jwt","id_token","user_info","refresh_token","cookie_snapshot"]
        .forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    } catch {}
    setToken(null);
    setProfile(null);
  }

  const value = useMemo(() => ({
  token,
  // let callback page “wake up” the navbar immediately
  setToken: (t) => { setToken(t); setAuthTokens({ access: t, refresh: null }); },

  // current shape
  profile,
  setProfile,

  // ✅ aliases for backward compatibility
  user: profile,
  setUser: setProfile,

  login: startSSO,
  logout,
  refresh,
  loading,
  isAuthed: !!(profile && (profile.email || profile.username || profile.name)) || !!token,
}), [token, profile, loading]);

return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ✅ Named hook export
export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
