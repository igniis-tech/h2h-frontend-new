import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, formatINR } from "../api/client";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function PaymentStatus() {
  const q = useQuery();
  const oid = q.get("oid");
  const paymentQS = q.get("payment");           // "success" | "failed" | null
  const bookingIdQS = q.get("booking_id");      // may be present from backend callback

  const [status, setStatus] = useState({ loading: true });
  const [err, setErr] = useState("");

  // Seed immediate success view if callback carried booking_id
  const seededPaid = paymentQS === "success";
  const seededBookingId = bookingIdQS ? Number(bookingIdQS) : null;

  useEffect(() => {
    let alive = true;
    if (!oid) { setErr("Missing order id."); setStatus({ loading:false }); return; }

    // If we already have booking_id (from callback), show success instantly,
    // but still poll to keep things truthful if something changes.
    if (seededPaid && seededBookingId) {
      setStatus(s => ({
        ...s,
        loading: false,
        paid: true,
        booking_id: seededBookingId,
      }));
    }

    async function poll() {
      try {
        const s = await api.getOrderStatus(oid);
        if (!alive) return;
        setStatus({ loading: false, ...s });
        // Keep polling until paid or hard-failed
        if (!s.paid && !s.error) {
          setTimeout(poll, 2000);
        }
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Unable to fetch order status.");
        setTimeout(poll, 3000);
      }
    }
    poll();
    return () => { alive = false; };
  }, [oid, seededPaid, seededBookingId]);

  const paid = !!status.paid || (seededPaid && !!seededBookingId);
  const bookingId = status.booking_id || seededBookingId || null;
  const amount = typeof status.amount_inr === "number" ? status.amount_inr : null;

  return (
    <div className="py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-6 sm:px-10 sm:py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <h1 className="text-3xl sm:text-4xl font-extrabold">Payment Status</h1>
            <p className="mt-3 text-slate-400">
              Order <span className="font-mono">{oid}</span>
            </p>

            {err && (
              <div className="mt-6 rounded-xl border border-rose-700 bg-rose-900/20 text-rose-200 px-4 py-3">
                {err}
              </div>
            )}

            {!paid && !err && (
              <div className="mt-8 rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-3 w-3 rounded-full bg-amber-400 animate-pulse" />
                  <div className="text-slate-300">Waiting for confirmation from Razorpay…</div>
                </div>
                {amount != null && (
                  <div className="mt-2 text-slate-400 text-sm">
                    Amount: <b className="text-slate-200">{formatINR(amount)}</b>
                  </div>
                )}
                <div className="mt-3 text-slate-400 text-sm">
                  You can safely close this tab; we’ll keep trying and update when paid.
                </div>
              </div>
            )}

            {paid && (
              <div className="mt-8 rounded-2xl border border-emerald-700 bg-emerald-900/20 text-emerald-100 p-5">
                <div className="text-xl font-bold">Payment Received ✅</div>
                {amount != null && (
                  <div className="mt-1">Amount: <b>{formatINR(amount)}</b></div>
                )}

                {bookingId ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {/* Primary: download by booking id */}
                    <a
                      href={api.ticketUrlByBooking(bookingId)}
                      className="rounded-2xl px-5 py-2 bg-bookingPrimary text-slate-950 font-semibold hover:bg-bookingPrimary/90"
                      target="_blank" rel="noreferrer"
                    >
                      Download Ticket
                    </a>

                    {/* Fallback: also expose by order id if needed */}
                    {oid && (
                      <a
                        href={api.ticketUrlByOrder(Number(oid))}
                        className="rounded-2xl px-5 py-2 border border-emerald-600 hover:bg-emerald-800/30"
                        target="_blank" rel="noreferrer"
                      >
                        Download (by Order)
                      </a>
                    )}

                    <Link to="/" className="text-slate-300 hover:text-slate-100 underline">
                      Back to Home
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 text-slate-300 text-sm">
                    Booking is being finalized. Refresh in a few seconds if the ticket link isn’t visible yet.
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <Link to="/" className="text-slate-300 hover:text-slate-100 underline">Back to Home</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
