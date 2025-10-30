import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken, getAccessToken } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Callback() {
  const navigate = useNavigate();
  const { setToken, setProfile } = useAuth();
  const [err, setErr] = useState("");
  const startedRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const providerError = params.get("error") || params.get("error_description");

        if (providerError) throw new Error(decodeURIComponent(providerError));
        if (!code) throw new Error("Missing authorization code");

        // optional state check
        try {
          const expected = sessionStorage.getItem("sso_state");
          if (expected && state && expected !== state) {
            throw new Error("Invalid sign-in state. Please try again.");
          }
        } catch {}

        const res = await exchangeCodeForToken({ code, state });

        const id = res?.id || getAccessToken();
        if (id) setToken(id);
        if (res?.profile) setProfile(res.profile);

        const stored = sessionStorage.getItem("sso_return_to") || "/";
        try {
          sessionStorage.removeItem("sso_return_to");
          sessionStorage.removeItem("sso_state");
          sessionStorage.removeItem(`sso_redeemed_${code}`);
        } catch {}

        if (mountedRef.current) navigate(stored.startsWith("/") ? stored : "/", { replace: true });
      } catch (e) {
        if (!mountedRef.current) return;
        setErr(e?.message || "Login failed");
      }
    })();
  }, [navigate, setProfile, setToken]);

  return (
    <div className="py-24 flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-semibold" role="status" aria-busy={err ? "false" : "true"} aria-live="polite">
          Finishing sign-in…
        </div>
        {err ? (
          <div className="mt-2 text-red-400" role="alert" aria-live="assertive">
            {err}
          </div>
        ) : (
          <div className="mt-2 opacity-70">Please wait</div>
        )}
      </div>
    </div>
  );
}
