// import React, { useEffect } from 'react'
// import { useLocation, useNavigate } from 'react-router-dom'
// import { api } from '../../api/client'
// import { useAuth } from '../../context/AuthContext'

// export default function Callback() {
//   const loc = useLocation()
//   const nav = useNavigate()
//   const { refresh } = useAuth()

//   useEffect(() => {
//     (async () => {
//       try {
//         await api.ssoCallback(loc.search || '')
//         await refresh()              // pull /api/auth/me and normalize it
//         nav('/profile', { replace: true })
//       } catch (e) {
//         console.error('SSO callback failed:', e)
//         nav('/login', { replace: true })
//       }
//     })()
//   }, [loc.search, nav, refresh])

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center">
//       <div className="rounded-xl border border-white/10 bg-slate-900/60 px-6 py-10 text-center">
//         <div className="animate-pulse text-white/80">Completing sign-in…</div>
//       </div>
//     </div>
//   )
// }
// src/pages/auth/Callback.jsx
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Callback() {
  const loc = useLocation();
  const nav = useNavigate();
  const { refresh } = useAuth();

  const ranRef = useRef(false); // prevent double-run in React 18 StrictMode
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        // Optional state check (only if we initiated)
        const p = new URLSearchParams(loc.search || "");
        const returnedState = p.get("state") || "";
        const expectedState = sessionStorage.getItem("sso_state");
        if (expectedState && returnedState && expectedState !== returnedState) {
          throw new Error("State mismatch");
        }

        // Call backend callback; it sets the session cookie
        await api.ssoCallback(loc.search || "");

        // Poll /auth/me briefly to ensure cookie is visible to XHR
        const deadline = Date.now() + 5000; // up to 5 seconds
        let authed = null;
        while (Date.now() < deadline) {
          authed = await refresh();
          if (authed) break;
          await new Promise((r) => setTimeout(r, 250));
        }

        // Clear one-shot state
        sessionStorage.removeItem("sso_state");

        if (!authed) throw new Error("Signed in, but session not visible yet.");

        const returnTo = sessionStorage.getItem("sso_return_to") || "/profile";
        sessionStorage.removeItem("sso_return_to");
        nav(returnTo, { replace: true });
      } catch (e) {
        console.error("SSO callback failed:", e);
        setErr(e?.message || "SSO callback failed");
        nav("/login", { replace: true });
      }
    })();
    
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-xl border border-white/10 bg-slate-900/60 px-6 py-10 text-center">
        {!err ? (
          <div className="animate-pulse text-white/80">Completing sign-in…</div>
        ) : (
          <>
            <div className="text-red-400 font-semibold">Sign-in error</div>
            <pre className="mt-3 text-left text-red-300/80 text-sm">{String(err)}</pre>
          </>
        )}
      </div>
    </div>
  );
}
