// import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
// import { API_BASE, startSSO } from "../api/client.js";

// const AuthCtx = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // If we explicitly logged out on the client, skip re-fetching /auth/me
//     const forced = sessionStorage.getItem("forceLoggedOut") === "1";
//     if (forced) {
//       setUser(null);
//       setLoading(false);
//       return;
//     }

//     fetch(`${API_BASE}/auth/me?_=${Date.now()}`, { credentials: "include" })
//       .then((res) => (res.ok ? res.json() : null))
//       .then((data) => setUser(data || null))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   const login = () => startSSO();

//   // FRONTEND-ONLY logout: do not call /auth/logout (your backend doesn’t have it)
//   const logout = () => {
//     sessionStorage.setItem("forceLoggedOut", "1");
//     try {
//       localStorage.removeItem("jwt");
//       localStorage.removeItem("user_info");
//       sessionStorage.removeItem("jwt");
//       sessionStorage.removeItem("user_info");
//     } catch {}
//     setUser(null);
//   };

//   const value = useMemo(
//     () => ({ user, loading, isAuthed: !!user, login, logout }),
//     [user, loading]
//   );

//   return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
// }

// export function useAuth() {
//   return useContext(AuthCtx);
// }
// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE, startSSO } from "../api/client.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch /auth/me once on mount (after SSO, cookie should be present)
  useEffect(() => {
    const forced = sessionStorage.getItem("forceLoggedOut") === "1";
    if (forced) {
      setUser(null);
      setLoading(false);
      return;
    }
    refresh().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Expose refresh() so Callback can poll /auth/me after SSO
  async function refresh() {
    try {
      const res = await fetch(`${API_BASE}/auth/me?_=${Date.now()}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUser(data || null);
      return data || null;
    } catch {
      setUser(null);
      return null;
    }
  }

  const login = () => startSSO();

  // Frontend-only logout: clear local storage and state
  const logout = () => {
    sessionStorage.setItem("forceLoggedOut", "1");
    try {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user_info");
      sessionStorage.removeItem("jwt");
      sessionStorage.removeItem("user_info");
      sessionStorage.removeItem("sso_state");
      sessionStorage.removeItem("sso_return_to");
    } catch {}
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, isAuthed: !!user, login, logout, refresh }),
    [user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
