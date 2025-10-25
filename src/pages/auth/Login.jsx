import { useEffect } from "react";
import { startSSO } from "../../api/client.js";

export default function Login() {
  useEffect(() => {
    startSSO();
  }, []);
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <p className="opacity-80">Redirecting to secure login…</p>
    </div>
  );
}
