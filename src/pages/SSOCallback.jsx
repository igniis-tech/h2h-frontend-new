import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { exchangeCodeForToken } from "../api/client";

export default function SSOCallback() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const qs = new URLSearchParams(search);
    const code = qs.get("code");
    const state = qs.get("state");
    if (!code) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      try {
        const { user_info } = await exchangeCodeForToken({ code, state });
        setUser(user_info || { username: "guest" });
  // optionally: go back to where user came from (state), else profile
  navigate("/profile", { replace: true });
      } catch (e) {
        console.error("SSO callback failed", e);
        navigate("/", { replace: true });
      }
    })();
  }, [search, navigate, setUser]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <p className="opacity-80">Signing you in…</p>
    </div>
  );
}
