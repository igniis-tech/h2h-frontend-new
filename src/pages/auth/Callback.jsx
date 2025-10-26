
// import React, { useEffect, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { API_BASE, exchangeCodeForToken } from "../../api/client";
// import { useAuth } from "../../context/AuthContext";

// export default function Callback() {
//   const { search } = useLocation();
//   const navigate = useNavigate();
//   const { setToken, setProfile } = useAuth();
//   const ranRef = useRef(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (ranRef.current) return;
//     ranRef.current = true;

//     const p = new URLSearchParams(search || "");
//     const code = p.get("code");
//     const returnedState = p.get("state");
//     const expectedState = sessionStorage.getItem("sso_state");

//     (async () => {
//       try {
//         if (!code) throw new Error("Missing authorization code");
//         if (expectedState && returnedState && expectedState !== returnedState) {
//           throw new Error("State mismatch");
//         }

//         // 1) Try XHR callback (keeps SPA on same page)
//         const { access_token, user_info } = await exchangeCodeForToken({
//           code,
//           state: returnedState || undefined,
//         });
//         if (access_token) setToken(access_token);
//         if (user_info) setProfile(user_info);

//         // 2) Probe /auth/me to confirm session cookie is usable for XHR
//         const probe = await fetch(`${API_BASE}/auth/me?_=${Date.now()}`, {
//           credentials: "include",
//           headers: { Accept: "application/json" },
//         });

//         if (!probe.ok) {
//           // 3) Fallback: do a full-page redirect to backend callback so
//           // the cookie is set in a top-level navigation (mobile/webviews)
//           const next = `${window.location.origin}/auth/sso/callback?stage=done`;
//           const url = `${API_BASE}/auth/sso/callback${search}&next=${encodeURIComponent(next)}`;
//           window.location.replace(url);
//           return; // stop here; we’ll re-enter with stage=done
//         }

//         // Normal happy path
//         sessionStorage.removeItem("sso_state");
//         const returnTo = sessionStorage.getItem("sso_return_to") || "/profile";
//         sessionStorage.removeItem("sso_return_to");
//         navigate(returnTo, { replace: true });
//       } catch (e) {
//         console.error("SSO exchange failed:", e);
//         setError(e?.message || "SSO exchange failed");
//         navigate("/login", { replace: true });
//       }
//     })();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return (
//     <div className="min-h-[60vh] flex items-center justify-center">
//       <div className="rounded-xl border border-white/10 bg-slate-900/60 px-6 py-10 text-center">
//         {!error ? (
//           <div className="animate-pulse text-white/80">Completing sign-in…</div>
//         ) : (
//           <>
//             <div className="text-red-400 font-semibold">Sign-in error</div>
//             <pre className="mt-3 text-left text-red-300/80 text-sm whitespace-pre-wrap">
//               {String(error)}
//             </pre>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }



// src/pages/auth/Callback.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE, exchangeCodeForToken } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Callback() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { setToken, setProfile } = useAuth();
  const ranRef = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const p = new URLSearchParams(search || "");
    const code = p.get("code");
    const returnedState = p.get("state");
    const expectedState = sessionStorage.getItem("sso_state");

    (async () => {
      try {
        if (!code) throw new Error("Missing authorization code");
        if (expectedState && returnedState && expectedState !== returnedState) {
          throw new Error("State mismatch");
        }

        const { access_token, user_info } = await exchangeCodeForToken({
          code,
          state: returnedState || undefined,
        });
        if (access_token) setToken(access_token);
        if (user_info) setProfile(user_info);

        // Probe that XHR sees the session
        const probe = await fetch(`${API_BASE}/auth/me?_=${Date.now()}`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        // Clear one-shot flags now that we're signed in
        sessionStorage.removeItem("sso_state");
        sessionStorage.removeItem("forceLoggedOut");

        if (!probe.ok) {
          const next = `${window.location.origin}/auth/sso/callback?stage=done`;
          const url = `${API_BASE}/auth/sso/callback${search}&next=${encodeURIComponent(next)}`;
          window.location.replace(url);
          return;
        }

        const returnTo = sessionStorage.getItem("sso_return_to") || "/profile";
        sessionStorage.removeItem("sso_return_to");
        navigate(returnTo, { replace: true });
      } catch (e) {
        console.error("SSO exchange failed:", e);
        setError(e?.message || "SSO exchange failed");
        navigate("/login", { replace: true });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-xl border border-white/10 bg-slate-900/60 px-6 py-10 text-center">
        {!error ? (
          <div className="animate-pulse text-white/80">Completing sign-in…</div>
        ) : (
          <>
            <div className="text-red-400 font-semibold">Sign-in error</div>
            <pre className="mt-3 text-left text-red-300/80 text-sm whitespace-pre-wrap">
              {String(error)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
