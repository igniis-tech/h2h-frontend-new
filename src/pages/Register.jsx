import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api, formatINR, API_BASE } from '../api/client'
import { useAuth } from '../context/AuthContext'
import LoginModal from '../components/LoginModal'

// ---- Allowed meal enums (must match backend) ----
const MEAL_VALUES = ['VEG', 'NON_VEG']
const MEAL_OPTS = [
  { v: 'VEG', label: 'Veg' },
  { v: 'NON_VEG', label: 'Non-Veg' },
]

// ---- Convenience fee config (KEEP IN SYNC WITH BACKEND) ----
const PLATFORM_FEE_RATE = 0.02; // 2%
const GST_ON_FEE = 0.18; // 18%

// ---------- unified, BLACK text field styles ----------
const labelCls = 'block text-sm text-forest mb-1'
const inputCls =
  'w-full rounded-xl bg-white border border-slate-300 text-black ' +
  'placeholder:text-slate-600 px-4 py-3 outline-none focus:ring-2 focus:ring-bookingPrimary'
const smallInputCls =
  'rounded-xl bg-white border border-slate-300 text-black ' +
  'placeholder:text-slate-600 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary'
const selectCls =
  inputCls + ' appearance-none pr-10'

// Helpers
const fmt = (n) => (n == null ? '—' : formatINR(n))
function normalizeMeal(val) {
  const v = String(val || '').toUpperCase().trim()
  if (v === 'VEG') return 'VEG'
  if (v === 'NON_VEG' || v === 'NON-VEG' || v === 'NONVEG' || v === 'NV') return 'NON_VEG'
  return '' // invalid/blank -> require user to pick
}

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthed, loading: authLoading } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const [packages, setPackages] = useState([])
  const [eventId, setEventId] = useState(null)
  const [selectedPkgId, setSelectedPkgId] = useState(null)

  // Primary guest details
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [primaryGender, setPrimaryGender] = useState('O')
  const [primaryMeal, setPrimaryMeal] = useState('') // "" until user selects; was "NONE"
  const [primaryAge, setPrimaryAge] = useState('') // optional
  const [bloodGroup, setBloodGroup] = useState('')
  const [emerName, setEmerName] = useState('')
  const [emerPhone, setEmerPhone] = useState('')

  // companions: {name, age, blood_group, gender, meal_preference}
  const [companions, setCompanions] = useState([])

  // Promo states
  const [promoInput, setPromoInput] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [promoPreview, setPromoPreview] = useState(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')

  // sightseeing (pay at venue)
  const [wantSightseeing, setWantSightseeing] = useState(false)

  const [assumeMethod] = useState('card') // "card" | "upi" | "netbanking"
  const [accept, setAccept] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [resp, setResp] = useState(null)

  // Payment status banner
  const [payBanner, setPayBanner] = useState(null) // {status, bookingId, oid, reason}

  // initial pkg from URL or state
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const fromQuery = sp.get('pkg');
    const fromState = location.state?.pkgId;
    const initial = fromState ?? fromQuery;
    if (initial) setSelectedPkgId(String(initial));
  }, [location.search, location.state]);

  // fetch packages
  useEffect(() => {
    let alive = true;
    api.listPackages()
      .then(d => {
        if (!alive) return;
        const pkgs = Array.isArray(d)
          ? d
          : d?.packages || d?.data?.packages || d?.results || [];
        setPackages(pkgs || []);
        setEventId(d?.event?.id || d?.data?.event?.id || null);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // auth gate: show login modal if user is not authenticated
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthed) setLoginOpen(true);
  }, [authLoading, isAuthed]);

  // preserve selection or default to first package
  useEffect(() => {
    if (!packages.length) return;
    setSelectedPkgId(prev => {
      if (prev && packages.some(p => String(p.id) === String(prev))) return prev;
      return String(packages[0].id);
    });
  }, [packages]);

  // selected package object
  const selectedPkg = useMemo(
    () => packages.find(p => String(p.id) === String(selectedPkgId)) || null,
    [packages, selectedPkgId]
  );

  // read payment result banner
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const status = sp.get('payment')
    if (status === 'success' || status === 'failed') {
      const bookingId = sp.get('booking_id') || null
      const oid = sp.get('oid') || null
      const reason = sp.get('reason') || null
      setPayBanner({ status, bookingId, oid, reason })
      try {
        const url = new URL(window.location.href)
        url.searchParams.delete('payment')
        url.searchParams.delete('booking_id')
        url.searchParams.delete('oid')
        url.searchParams.delete('reason')
        window.history.replaceState({}, '', url.toString())
      } catch {}
    }
  }, [])

  // promo allowed?
  const promoAllowed = selectedPkg?.promo_active !== false

  // clear promo if not allowed or package changed
  useEffect(() => {
    if (!promoAllowed) {
      setPromoInput('');
      setPromoCode('');
      setPromoPreview(null);
      setPromoError('');
    } else {
      setPromoCode('');
      setPromoPreview(null);
      setPromoError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoAllowed, selectedPkgId])

  // companions with names
  const cleanedCompanions = useMemo(
    () => companions.filter(c => c.name && c.name.trim().length > 0),
    [companions]
  )
  const guestsCount = 1 + cleanedCompanions.length

  // Robust age parser
  function parseAge(x) {
    const m = String(x ?? '').match(/\d+/);
    if (!m) return null;
    const n = parseInt(m[0], 10);
    return Number.isFinite(n) && n >= 0 ? n : null;
  }

  // --------- PRICING ----------
  const pricing = useMemo(() => {
    const p = selectedPkg
    if (!p || p.price_inr == null) {
      return { baseInr: 0, subtotalInr: 0, extraAdults: 0, extraHalf: 0, extraFree: 0, rows: [] }
    }

    const baseIncludes = Number(p.base_includes ?? 1)
    const basePrice    = Number(p.price_inr)                       // per included chargeable seat
    const extraAdult   = Number(p.extra_price_adult_inr ?? p.price_inr)
    const halfMax      = Number(p.child_half_max_age ?? 10)
    const freeMax      = Number(p.child_free_max_age ?? 5)
    const halfMult     = Number(p.child_half_multiplier ?? 0.5)

    // classify everyone (primary first)
    const ages = [parseAge(primaryAge), ...cleanedCompanions.map(c => parseAge(c.age))]
    let adults = 0, halfKids = 0, freeKids = 0

    for (const a of ages) {
      if (a == null) { adults++; continue } // unknown => adult
      if (a <= freeMax) freeKids++
      else if (a <= halfMax) halfKids++
      else adults++
    }

    // Only chargeable guests can consume included seats
    const chargeable = adults + halfKids

    // Seats included apply to chargeable only: adults → half
    let seatsLeft = Math.max(0, Math.min(baseIncludes, chargeable))
    const incAdults = Math.min(adults, seatsLeft); seatsLeft -= incAdults
    const incHalf   = Math.min(halfKids, seatsLeft); seatsLeft -= incHalf

    // Remaining to be charged
    const remAdults = adults   - incAdults
    const remHalf   = halfKids - incHalf
    const remFree   = freeKids

    const rows = []
    const coveredChargeable = incAdults + incHalf
    if (coveredChargeable > 0) {
      rows.push({
        label: `${p.name} — base for ${coveredChargeable} chargeable guest${coveredChargeable > 1 ? 's' : ''}`,
        amount: basePrice * coveredChargeable
      })
    }
    if (remAdults > 0) {
      rows.push({ label: `Extra adult × ${remAdults}`, amount: remAdults * extraAdult })
    }
    if (remHalf > 0) {
      rows.push({ label: `Child (half) × ${remHalf}`, amount: Math.round(remHalf * extraAdult * (halfMult || 0.5)) })
    }
    if (remFree > 0) {
      rows.push({ label: `Child (free) × ${remFree}`, amount: 0 })
    }

    const subtotal = rows.reduce((s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0), 0)

    return {
      baseInr: basePrice,
      subtotalInr: subtotal,
      extraAdults: remAdults,
      extraHalf: remHalf,
      extraFree: remFree,
      rows
    }
  }, [selectedPkg, primaryAge, cleanedCompanions])

  // totals & fee calc
  const totalCostBase = pricing.subtotalInr
  const totalCost = useMemo(
    () => (promoPreview?.valid ? promoPreview.final_inr : totalCostBase),
    [promoPreview, totalCostBase]
  )

  const feeCalc = useMemo(() => {
    const base = Math.max(0, Number(totalCost || 0))
    const r = PLATFORM_FEE_RATE;
    if (r <= 0) {
      return { r, fee: 0, gst: 0, feePlusGst: 0, gross: Math.round(base) };
    }
    const gross = base / (1 - r * (1 + GST_ON_FEE));
    const feePlusGstPrecise = gross - base
    const fee = Math.round(gross * r)
    const feePlusGst = Math.round(feePlusGstPrecise)
    const gst = Math.max(0, feePlusGst - fee)
    return { r, fee, gst, feePlusGst, gross: Math.round(gross) }
  }, [totalCost])

  // PROMO: apply & clear
  async function onApplyPromo() {
    setPromoError('');
    setPromoPreview(null);
    if (!promoAllowed) { setPromoError('Promo not allowed for this package.'); return; }
    if (!promoInput?.trim()) { setPromoError('Enter a promo code.'); return; }

    try {
      setPromoLoading(true);
      const params = {
        code: promoInput.trim(),
        amount_inr: totalCostBase,
        package_id: selectedPkg?.id || undefined,
        booking_id: resp?.booking_id || undefined,
      };
      const res = await api.validatePromocode(params);
      if (!res?.valid) {
        setPromoError(res?.reason || 'Invalid promo code.');
        setPromoCode('');
        setPromoPreview(null);
      } else {
        setPromoCode(promoInput.trim());
        setPromoPreview(res);
      }
    } catch (e) {
      setPromoError(e?.message || 'Failed to validate promo.');
      setPromoCode('');
      setPromoPreview(null);
    } finally {
      setPromoLoading(false);
    }
  }

  function onClearPromo() {
    setPromoInput('');
    setPromoCode('');
    setPromoPreview(null);
    setPromoError('');
  }

  function onDownloadTicket(bookingId) {
    if (!bookingId) return
    const url = `${API_BASE}/tickets/booking/${encodeURIComponent(bookingId)}.pdf`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setErr(''); setResp(null)

    if (authLoading || !isAuthed) {
      setLoginOpen(true);
      return;
    }

    if (!accept) { setErr('Please accept the terms & conditions.'); return }
    if (!fullName || !email || !phone) { setErr('Please fill in your name, email, and phone.'); return }
    if (!selectedPkg?.id || selectedPkg.price_inr == null) { setErr('Please select a valid package.'); return }

    // 🔒 Meal must be explicitly chosen
    const primaryMealNorm = normalizeMeal(primaryMeal)
    if (!primaryMealNorm) {
      setErr('Please select your meal preference (Veg/Non-Veg).')
      return
    }

    // Normalize companion meals too
    const normalizedCompanions = cleanedCompanions.map(c => ({
      ...c,
      meal_preference: normalizeMeal(c.meal_preference) || 'VEG', // default to VEG if blank
    }))

    try {
      setLoading(true)

      // Create booking
      const bookingPayload = {
        event_id: eventId || 1,
        package_id: selectedPkg.id,
        category: '',
        companions: normalizedCompanions,
        primary_gender: primaryGender,
        // send BOTH keys for compatibility with backend variations
        primary_meal_preference: primaryMealNorm,
        primary_meal: primaryMealNorm,
        primary_age: primaryAge || undefined,
        blood_group: bloodGroup,
        emergency_contact_name: emerName,
        emergency_contact_phone: emerPhone,
        promo_code: (promoAllowed && promoCode) ? promoCode : undefined,
        guests: 1 + normalizedCompanions.length
      }

      // Helpful debug if needed:
      // console.log('BOOKING PAYLOAD', bookingPayload)

      const booking = await api.createBooking(bookingPayload)
      setResp(booking)

      // Optional: Sightseeing opt-in (non-blocking)
      if (wantSightseeing && booking?.id) {
        try {
          if (typeof api.sightseeingOptIn === 'function') {
            await api.sightseeingOptIn({ booking_id: booking.id, opt_in: true, guests: 1 + normalizedCompanions.length })
          } else if (typeof api.post === 'function') {
            await api.post('/sightseeing/optin', { booking_id: booking.id, opt_in: true, guests: 1 + normalizedCompanions.length })
          }
        } catch (e) {
          console.warn('Sightseeing opt-in failed (non-blocking):', e)
        }
      }

      // Create payment order; include return_to so callback comes back to profile
      const order = await api.createOrder({
        package_id: selectedPkg.id,
        booking_id: booking?.id,
        pass_platform_fee: true,
        assume_method: assumeMethod,
        return_to: `${window.location.origin}/profile`
      })

      if (order?.payment_link) {
        window.location.href = order.payment_link
      } else if (order?.order?.id && order?.key_id) {
        alert('Order created. Integrate Razorpay Checkout using key/order id.')
      } else {
        alert('Booking created but no payment link. Check backend response.')
      }
    } catch (e) {
      setErr(e.message || 'Failed to create booking.')
    } finally {
      setLoading(false)
    }
  }

  const submitDisabled = loading || !accept || !selectedPkg || selectedPkg.price_inr == null

  return (
    <div className="pt-28 md:pt-32 pb-12">
      <style>{`
        select, input, textarea { color:#000; }
        select option { background:#ffffff; color:#000000; }
        input::placeholder { color: #6b7280; }
      `}</style>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-forest/20 overflow-hidden">
          <div className="p-6 sm:px-10 sm:py-10 bg-white text-forest">
            <h1 className="text-3xl sm:text-4xl font-extrabold">Register for Highway to Heal</h1>
            <p className="mt-3 text-forest/70">
              24–26 January • Purulia, Barabhum • {selectedPkg ? fmt(selectedPkg.price_inr) : '—'} base
            </p>

            {/* Payment status banner */}
            {!!payBanner && (
              payBanner.status === 'success' ? (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3">
                  <div className="font-semibold">Payment successful!</div>
                  <div className="text-sm mt-1">
                    {payBanner.bookingId ? <>Booking ID: <b>{payBanner.bookingId}</b></> : 'Your booking is confirmed.'}
                  </div>
                  <div className="mt-2 flex gap-3">
                    {payBanner.bookingId && (
                      <button
                        type="button"
                        onClick={() => onDownloadTicket(payBanner.bookingId)}
                        className="rounded-lg px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        Download Ticket (PDF)
                      </button>
                    )}
                    <Link to="/" className="text-forest underline">Go to Home</Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">
                  <div className="font-semibold">Payment failed</div>
                  <div className="text-sm mt-1">
                    {payBanner.reason ? <>Reason: <b>{String(payBanner.reason)}</b></> : 'We could not verify the payment.'}
                  </div>
                </div>
              )
            )}

            <form onSubmit={onSubmit} className="mt-10 grid gap-6">
              {/* Primary info */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                         className={inputCls} placeholder="Your full name" required />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                         className={inputCls} placeholder="+91-XXXXXXXXXX" required />
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                         className={inputCls} placeholder="you@example.com" required />
                </div>

                <div>
                  <label className={labelCls}>Primary Gender</label>
                  <select value={primaryGender} onChange={e => setPrimaryGender(e.target.value)} className={selectCls}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Primary Meal Preference</label>
                  <select
                    value={primaryMeal}
                    onChange={e => setPrimaryMeal(e.target.value)}
                    className={selectCls}
                    required
                  >
                    <option value="">Select meal…</option>
                    {MEAL_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Primary Age (optional)</label>
                  <input value={primaryAge} onChange={e => setPrimaryAge(e.target.value)}
                         className={inputCls} placeholder="e.g., 28 yrs" />
                </div>

                <div>
                  <label className={labelCls}>Primary Blood Group</label>
                  <input value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                         className={inputCls} placeholder="e.g., O+, A-, B+" />
                </div>

                <div>
                  <label className={labelCls}>Emergency Contact Name</label>
                  <input value={emerName} onChange={e => setEmerName(e.target.value)}
                         className={inputCls} placeholder="Guardian / Friend name" />
                </div>

                <div>
                  <label className={labelCls}>Emergency Contact Phone</label>
                  <input value={emerPhone} onChange={e => setEmerPhone(e.target.value)}
                         className={inputCls} placeholder="+91-XXXXXXXXXX" />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Package</label>
                  <select
                    value={selectedPkgId ?? ''}
                    onChange={e => setSelectedPkgId(e.target.value)}
                    className={selectCls}
                  >
                    {packages.map(p => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name} — {p.price_inr != null ? formatINR(p.price_inr) : '—'}
                      </option>
                    ))}
                  </select>

                  {selectedPkg && (
                    <div className="mt-2 text-xs text-forest/70">
                      {(() => {
                        const base = selectedPkg.base_includes ?? 1;
                        const ea   = selectedPkg.extra_price_adult_inr ?? selectedPkg.price_inr;
                        const halfMax = selectedPkg.child_half_max_age ?? 10;
                        const freeMax = selectedPkg.child_free_max_age ?? 5;
                        const halfMult = selectedPkg.child_half_multiplier ?? 0.5;
                        return `Includes: ${base} person • Extra adult: ${fmt(ea)} • Half charge ≤ ${halfMax} yrs (${Math.round((halfMult || 0.5) * 100)}%) • Free ≤ ${freeMax} yrs`;
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Guests & companions */}
              <div className="rounded-2xl border border-forest/20 p-5 bg-offwhite">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-forest/80 text-sm">Guests (Primary + named companions)</div>
                    <div className="text-forest/70 text-sm mt-2">Total: <b>{guestsCount}</b></div>
                  </div>
                  <div className="text-right">
                    <div className="text-forest/80 text-sm">Subtotal (before promo)</div>
                    <div className="text-2xl font-black">{fmt(totalCostBase)}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setCompanions(prev => [...prev, { name: '', age: '', blood_group: '', gender: 'O', meal_preference: '' }])} // meal blank
                    className="rounded-xl px-3 py-2 border-2 border-forest text-forest bg-transparent hover:bg-forest/5"
                  >
                    Add Companion
                  </button>

                  <div className="mt-4 grid gap-3">
                    {companions.map((c, i) => (
                      <div key={i} className="grid sm:grid-cols-8 gap-3 items-center">
                        <input value={c.name} onChange={e => setCompanions(prev => prev.map((x,idx)=>idx===i?{...x,name:e.target.value}:x))}
                               placeholder="Name" className={smallInputCls + ' sm:col-span-3'} />
                        <input value={c.age} onChange={e => setCompanions(prev => prev.map((x,idx)=>idx===i?{...x,age:e.target.value}:x))}
                               placeholder="Age (e.g., 4 yrs)" className={smallInputCls + ' sm:col-span-1'} />
                        <input value={c.blood_group} onChange={e => setCompanions(prev => prev.map((x,idx)=>idx===i?{...x,blood_group:e.target.value}:x))}
                               placeholder="Blood Group" className={smallInputCls + ' sm:col-span-1'} />
                        <select value={c.gender ?? 'O'} onChange={e => setCompanions(prev => prev.map((x,idx)=>idx===i?{...x,gender:e.target.value}:x))}
                                className={smallInputCls + ' sm:col-span-1 appearance-none'}>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                        <select
                          value={c.meal_preference || ''}
                          onChange={e => setCompanions(prev => prev.map((x,idx)=>idx===i?{...x,meal_preference:e.target.value}:x))}
                          className={smallInputCls + ' sm:col-span-1 appearance-none'}
                        >
                          <option value="">Meal…</option>
                          {MEAL_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                        </select>
                        <button type="button" onClick={() => setCompanions(prev => prev.filter((_,idx)=>idx!==i))}
                                className="sm:col-span-1 rounded-xl px-3 py-2 bg-rose-600 text-white hover:bg-rose-500">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* PROMO */}
              {promoAllowed && (
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-forest/20 p-5 bg-offwhite">
                    <div className="text-forest/80 text-sm mb-2">Promo Code</div>
                    <div className="flex gap-3">
                      <input
                        value={promoInput}
                        onChange={e => setPromoInput(e.target.value)}
                        placeholder="e.g., H2H10"
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={onApplyPromo}
                        disabled={promoLoading}
                        className={`rounded-xl px-4 py-2 font-semibold ${promoLoading ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-bookingPrimary text-slate-950 hover:bg-bookingPrimary/90'}`}
                      >
                        {promoLoading ? 'Applying…' : 'Apply'}
                      </button>
                      {promoCode && (
                        <button
                          type="button"
                          onClick={onClearPromo}
                          className="rounded-xl px-4 py-2 border-2 border-forest text-forest hover:bg-forest/5"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {promoError && <div className="mt-2 text-sm text-rose-600">{promoError}</div>}
                    {promoPreview && promoPreview.valid && (
                      <div className="mt-2 text-sm text-bookingPrimary">
                        Discount: {formatINR(promoPreview.discount_inr)} • New total: <b>{formatINR(promoPreview.final_inr)}</b>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Total with convenience fee & GST */}
              <div className="rounded-2xl bg-offwhite border border-forest/20 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-forest/80 text-sm">Subtotal (after promo)</div>
                  <div className="text-forest font-medium">{fmt(totalCost)}</div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <div className="text-forest/80 text-sm">Convenience fee (online processing)</div>
                  <div className="text-forest font-medium">{formatINR(feeCalc.fee)}</div>
                </div>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <div className="text-forest/70 text-xs">GST {Math.round(GST_ON_FEE * 100)}% on processing fee</div>
                  <div className="text-forest/80 text-sm">{formatINR(feeCalc.gst)}</div>
                </div>

                <div className="mt-3 border-t border-forest/20 pt-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-forest/80 text-sm">Payable now</div>
                    <div className="text-xs text-forest/70">Estimated</div>
                  </div>
                  <div className="text-2xl font-black">{formatINR(feeCalc.gross)}</div>
                </div>

                <div className="mt-3 text-right text-forest/70 text-sm">
                  Inclusive of accommodation, meals & performances
                </div>
              </div>

              {/* Sightseeing */}
              <label className="flex items-start gap-3 text-forest text-sm">
                <input
                  type="checkbox"
                  checked={wantSightseeing}
                  onChange={e => setWantSightseeing(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-white"
                />
                <span>
                  I’d like to join the <b>Sightseeing</b> add-on.
                  <div className="text-forest/70 text-xs mt-1">
                    We’ll reserve your spot now, and <b>you’ll pay at the venue</b>. No online charge for sightseeing.
                  </div>
                </span>
              </label>

              <label className="flex items-start gap-3 text-forest text-sm">
                <input type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)}
                       className="mt-1 h-4 w-4 rounded border-slate-700 bg-white" />
                <span>I agree to the <a className="text-bookingPrimary underline" href="#!">terms & conditions</a>.</span>
              </label>

              {/* breakdown */}
              {pricing?.rows?.length ? (
                <div className="rounded-2xl border border-forest/20 p-5 bg-offwhite">
                  <div className="text-forest/80 text-sm mb-2">Price Breakdown</div>
                  <div className="grid gap-1">
                    {pricing.rows.map((r, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-forest/80">{r.label}</span>
                        <span className="text-forest font-medium">{formatINR(r.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {err && <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">{err}</div>}
              {resp && <div className="rounded-xl border border-bookingPrimary bg-bookingPrimary/10 text-forest px-4 py-3">
                Booking created! {resp?.id ? <><span className="ml-1">ID: <b>{resp.id}</b></span></> : null}
              </div>}

              <div className="flex items-center gap-4">
                <button type="submit" disabled={submitDisabled}
                        className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-lg ${submitDisabled ? 'bg-slate-700 text-slate-300 cursor-not-allowed' : 'bg-bookingPrimary text-slate-950 hover:bg-bookingPrimary/90 shadow-emerald-800/30'}`}>
                  {loading ? 'Processing...' : 'Confirm & Pay'}
                </button>
                <Link to="/" className="text-forest hover:opacity-80 underline">Back to Home</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <LoginModal
        open={loginOpen}
        onClose={() => { setLoginOpen(false); navigate('/login', { replace: true, state: { from: location } }); }}
      />
    </div>
  )
}
