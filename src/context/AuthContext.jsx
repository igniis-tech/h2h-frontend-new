import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { api, getAccessToken, setAuthTokens } from "../api/client";

/** Load profile from storage (kept in client.api) */
function readStoredProfile() {
  try {
    if (typeof window === "undefined") return null;
    const s = sessionStorage.getItem("user_info");
    if (s) return JSON.parse(s);
    const l = localStorage.getItem("user_info");
    if (l) return JSON.parse(l);
  } catch {}
  return null;
}

/** Read ID token from storage (w/ legacy fallback) */
function readIdToken() {
  try {
    if (typeof window === "undefined") return null;
    return (
      sessionStorage.getItem("id_jwt") ||
      localStorage.getItem("id_jwt") ||
      sessionStorage.getItem("jwt") ||   // legacy (access)
      localStorage.getItem("jwt")  ||    // legacy
      null
    );
  } catch { return null; }
}

/** Derive minimal profile from ID token if nothing stored */
function deriveProfileFromIdToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return {
      id: payload?.sub,
      email: payload?.email || "",
      username: payload?.["cognito:username"] || payload?.username || "",
      name: payload?.name || payload?.given_name || "",
      profile: {
        full_name: payload?.name || "",
        email_verified: !!payload?.email_verified,
        phone_number: payload?.phone_number || "",
      },
      _claims: payload, // optional: handy for debugging (don’t render directly)
    };
  } catch {
    return null;
  }
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // token === ID token (primary bearer we attach to APIs)
  const [token, setTokenState] = useState(readIdToken());
  const [profile, setProfile]  = useState(readStoredProfile());
  const [loading, setLoading]  = useState(true);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  /** Write-through setter: update state + persist via client */
  const setToken = useCallback((t) => {
    const next = t || null;
    setTokenState(next);
    setAuthTokens({ id: next }); // keep refresh/access untouched
  }, []);

  /**
   * Rehydrate from storage/claims only (NO network).
   * If no stored user_info, try to decode ID token to build a lightweight profile.
   */
  const refresh = useCallback(async () => {
    const current = getAccessToken() || readIdToken();
    if (!current) {
      if (mountedRef.current) setProfile(null);
      return null;
    }

    const stored = readStoredProfile();
    if (mountedRef.current) {
      if (stored) setProfile(stored);
      else setProfile(deriveProfileFromIdToken(current));
    }
    return stored || deriveProfileFromIdToken(current) || null;
  }, []);

  // Initial boot: if we have a token, hydrate once (no /auth/me)
  useEffect(() => {
    (async () => {
      if (token) await refresh();
      if (mountedRef.current) setLoading(false);
    })();

    // Keep context in sync with token/profile changes broadcast by client
    const onAuthUpdated = async () => {
      const t = readIdToken();
      setTokenState((prev) => (prev !== t ? t : prev));
      await refresh();
    };

    const onStorage = () => { onAuthUpdated(); };

    window.addEventListener("auth:updated", onAuthUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("auth:updated", onAuthUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh, token]);

  const logout = useCallback(async () => {
    try { await api.logout(); } catch {}
    try {
      [
        "sso_state","sso_return_to","jwt","id_jwt","id_token",
        "user_info","refresh_token","cookie_snapshot",
      ].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    } catch {}
    if (mountedRef.current) {
      setTokenState(null);
      setProfile(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      token,                // ID token (preferred)
      idToken: token,       // alias
      setToken,             // allow callback page to set immediately
      profile, setProfile,  // stored or derived
      user: profile, setUser: setProfile,

      // actions
      login: null,          // use startSSO directly where needed (Navbar already does)
      logout,
      refresh,              // rehydrate only (no network)

      // status
      loading,
      isAuthed: !!token || !!(profile && (profile.email || profile.username || profile.name)),
    }),
    [token, profile, loading, logout, refresh, setToken]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
