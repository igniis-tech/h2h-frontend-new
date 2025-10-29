// src/pages/auth/Callback.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken, getAccessToken } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Callback() {
  const navigate = useNavigate();
  const { setToken, setProfile, refresh } = useAuth();
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (!code) throw new Error("Missing authorization code");

        // 1) Exchange code -> tokens + (maybe) profile
        const res = await exchangeCodeForToken({ code, state });

        // 2) Wake up React: make token visible to context immediately
        const access = res?.access || getAccessToken();
        if (access) setToken(access);

        // 3) If backend returned profile in callback, hydrate it now
        if (res?.profile) setProfile(res.profile);

        // 4) Always re-probe /auth/me using Bearer
        await refresh();

        // 5) Redirect where the user started
        const returnTo = sessionStorage.getItem("sso_return_to") || "/";
        try { sessionStorage.removeItem("sso_return_to"); } catch {}
        navigate(returnTo, { replace: true });
      } catch (e) {
        setErr(e?.message || "Login failed");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="py-24 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-semibold">Finishing sign-in…</div>
        {err ? <div className="mt-2 text-red-400">{err}</div> : <div className="mt-2 opacity-70">Please wait</div>}
      </div>
    </div>
  );
}
