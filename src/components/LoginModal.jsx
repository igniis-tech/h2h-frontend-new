import React, { useCallback, useEffect, useRef, useState } from "react";
import { startSSO } from "../api/client";

export default function LoginModal({ open, onClose }) {
  const [loggingIn, setLoggingIn] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const begin = useCallback(async () => {
    if (loggingIn) return;
    setLoggingIn(true);
    try { await startSSO(); }
    finally { if (mountedRef.current) setLoggingIn(false); }
  }, [loggingIn]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-forest">Login required</h2>
            <p className="mt-2 text-forest/80 text-sm">Please sign in to continue with your registration.</p>
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={begin}
                disabled={loggingIn}
                className={`rounded-full px-5 py-2 font-semibold ${loggingIn ? "bg-slate-700 text-slate-300 cursor-not-allowed" : "bg-bookingPrimary text-slate-950 hover:bg-bookingPrimary/90"}`}
              >
                {loggingIn ? "Redirecting…" : "Login"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-5 py-2 font-semibold border-2 border-forest text-forest bg-transparent hover:bg-forest/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
