// src/pages/auth/Callback.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE, exchangeCodeForToken } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Callback() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { setToken, setProfile } = useAuth();

  const ran = useRef(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(search || "");
    const code = params.get("code");
    const returnedState = params.get("state");
    const authErr = params.get("error");
    const authErrDesc = params.get("error_description");
    const expectedState = sessionStorage.getItem("sso_state");

    (async () => {
      try {
        if (authErr) {
          throw new Error(decodeURIComponent(authErrDesc || authErr));
        }
        if (!code) throw new Error("Missing authorization code");

        // State check (if we stored one)
        if (expectedState && returnedState && expectedState !== returnedState) {
          throw new Error("State mismatch");
        }

        // Redeem exactly once; client guards repeated redeem with sessionStorage
        const data = await exchangeCodeForToken({ code, state: returnedState || undefined });

        // Persist into your auth context (optional; server session is the source of truth)
        const access =
          data?.tokens?.access_token ||
          data?.access_token ||
          null;
        const profile =
          data?.user ||
          data?.user_info ||
          data?.claims ||
          null;

        if (access) setToken(access);
        if (profile) setProfile(profile);

        // Probe server session (ignore failures; cookie may not be readable yet on some browsers)
        try {
          await fetch(`${API_BASE}/auth/me?_=${Date.now()}`, {
            credentials: "include",
            headers: { Accept: "application/json" },
            cache: "no-store",
          });
        } catch {}

        // Cleanup state & return
        sessionStorage.removeItem("sso_state");
        const returnTo = sessionStorage.getItem("sso_return_to") || "/";
        sessionStorage.removeItem("sso_return_to");

        // Optional: clean the current URL so stored 'code' can't be re-used on back/refresh
        try {
          const clean = `${window.location.origin}/auth/callback`;
          window.history.replaceState({}, "", clean);
        } catch {}

        navigate(returnTo, { replace: true });
      } catch (e) {
        console.error("SSO exchange failed:", e);
        setError(e?.message || "SSO exchange failed");
        // IMPORTANT: do NOT call startSSO() here — prevents redirect loops on 400s
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
