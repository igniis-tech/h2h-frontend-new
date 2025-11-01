import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, formatINR, API_BASE } from '../api/client'

const PRICE_PER_PERSON = 6499

// Meal choices used for both primary + companions
const MEAL_OPTS = [
  { v: 'VEG',  label: 'Veg' },
  { v: 'NON_VEG', label: 'Non-Veg' },
]

// ---- Convenience fee config (KEEP IN SYNC WITH BACKEND) ----
const PLATFORM_FEE_RATE = 0.02; // 2%
const GST_ON_FEE        = 0.18; // 18%

// ---------- unified, BLACK text field styles ----------
const labelCls = 'block text-sm text-slate-200 mb-1'
const inputCls =
  'w-full rounded-xl bg-white border border-slate-300 text-black ' +
  'placeholder:text-slate-600 px-4 py-3 outline-none focus:ring-2 focus:ring-bookingPrimary'
const smallInputCls =
  'rounded-xl bg-white border border-slate-300 text-black ' +
  'placeholder:text-slate-600 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary'
const selectCls =
  inputCls + ' appearance-none pr-10'

// ------------------------------------------------------

export default function Register(){
  const [packages, setPackages] = useState([])
  const [eventId, setEventId] = useState(null)
  const [selectedPkg, setSelectedPkg] = useState(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [primaryAge, setPrimaryAge] = useState('') // optional
  const [tickets, setTickets] = useState(1)

  // companions: {name, age, blood_group, gender, meal_preference}
  const [companions, setCompanions] = useState([])
  const [bloodGroup, setBloodGroup] = useState('')
  const [emerName, setEmerName] = useState('')
  const [emerPhone, setEmerPhone] = useState('')
  const [promoCode, setPromoCode] = useState('')

  // NEW: primary guest gender + meal
  const [primaryGender, setPrimaryGender] = useState('O')
  const [primaryMeal, setPrimaryMeal] = useState('NONE')

  // NEW: sightseeing opt-in (pay at venue)
  const [wantSightseeing, setWantSightseeing] = useState(false)

  // Optional: let user hint payment method for fee calc + backend
  const [assumeMethod, setAssumeMethod] = useState('card') // "card" | "upi" | "netbanking"

  const [accept, setAccept] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [resp, setResp] = useState(null)
  const [promoPreview, setPromoPreview] = useState(null)

  // Payment status banner (from callback redirect)
  const [payBanner, setPayBanner] = useState(null) // {status, bookingId, oid, reason}

  // ---------- fetch packages ----------
  useEffect(() => {
    api.listPackages().then(d=>{
      const pkgs = Array.isArray(d)
        ? d
        : d?.packages || d?.data?.packages || d?.results || [];
      setPackages(pkgs || [])
      setEventId(d?.event?.id || d?.data?.event?.id || null)
      setSelectedPkg((pkgs||[])[0] || null)
    }).catch(()=>{})
  }, [])

  // ---------- read payment result from URL (success/failure) ----------
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const status = sp.get('payment') // success | failed | null
    if (status === 'success' || status === 'failed') {
      const bookingId = sp.get('booking_id') || null
      const oid = sp.get('oid') || null
      const reason = sp.get('reason') || null
      setPayBanner({ status, bookingId, oid, reason })
      // Clean the query so refresh doesn’t repeat the banner
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

  // Convenience: whether promo is allowed for the current package
  const promoAllowed = selectedPkg?.promo_active !== false

  // If promo is not allowed for this package, clear any entered code/preview
  useEffect(() => {
    if (!promoAllowed) {
      if (promoCode) setPromoCode('')
      if (promoPreview) setPromoPreview(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoAllowed, selectedPkg?.id])

  // ---------- price rules helper ----------
  const packageRuleText = useMemo(()=>{
    const p = selectedPkg
    if(!p) return ''
    const base = p.base_includes ?? 1
    const ea   = p.extra_price_adult_inr ?? p.price_inr ?? PRICE_PER_PERSON
    const halfMax = p.child_half_max_age ?? 10
    const freeMax = p.child_free_max_age ?? 5
    const halfMult = p.child_half_multiplier ?? 0.5
    return `Includes: ${base} person • Extra adult: ${formatINR(ea)} • Half charge ≤ ${halfMax} yrs (${Math.round((halfMult||0.5)*100)}%) • Free ≤ ${freeMax} yrs`
  }, [selectedPkg])

  // ---------- compute totals from ages (primary + companions with names) ----------
  const cleanedCompanions = useMemo(
    () => companions.filter(c=>c.name && c.name.trim().length>0),
    [companions]
  )
  const guestsCount = 1 + cleanedCompanions.length

  function parseAge(x){
    const n = Number(x)
    return Number.isFinite(n) && n>0 ? n : null
  }

  const pricing = useMemo(()=>{
    const p = selectedPkg
    if(!p) return {
      baseInr: PRICE_PER_PERSON,
      subtotalInr: guestsCount * PRICE_PER_PERSON,
      extraAdults: 0, extraHalf: 0, extraFree: 0,
      rows: [{label:'Base (fallback)', amount: guestsCount*PRICE_PER_PERSON}]
    }

    const baseIncludes = p.base_includes ?? 1
    const basePrice = p.price_inr ?? PRICE_PER_PERSON
    const extraAdult = p.extra_price_adult_inr ?? basePrice
    const halfMax = p.child_half_max_age ?? 10
    const freeMax = p.child_free_max_age ?? 5
    const halfMult = p.child_half_multiplier ?? 0.5

    // everyone’s ages (primary first)
    const ages = [parseAge(primaryAge), ...cleanedCompanions.map(c=>parseAge(c.age))]
    let extraAdults = 0, extraHalf = 0, extraFree = 0

    for(const a of ages){
      if(a==null){ extraAdults++; continue } // unknown age => adult
      if(a <= freeMax) extraFree++
      else if(a <= halfMax) extraHalf++
      else extraAdults++
    }

    // 1 included (or package-defined base)
    let extrasPool = (guestsCount - Math.min(baseIncludes, guestsCount))
    let incAdults = Math.min(extraAdults, baseIncludes - 0)
    extraAdults -= incAdults
    extrasPool -= Math.max(0, incAdults)

    if(extrasPool>0){
      const takeHalf = Math.min(extraHalf, extrasPool); extraHalf -= takeHalf; extrasPool -= takeHalf
    }
    if(extrasPool>0){
      const takeFree = Math.min(extraFree, extrasPool); extraFree -= takeFree; extrasPool -= takeFree
    }

    const rows = []
    rows.push({label: `${p.name} — base for ${Math.min(baseIncludes, guestsCount)} guest${guestsCount>1?'s':''}`, amount: basePrice})
    if(extraAdults>0) rows.push({label: `Extra adult × ${extraAdults}`, amount: extraAdults * extraAdult})
    if(extraHalf>0) rows.push({label: `Child (half) × ${extraHalf}`, amount: Math.round(extraHalf * extraAdult * (halfMult||0.5))})
    if(extraFree>0) rows.push({label: `Child (free) × ${extraFree}`, amount: 0})

    const subtotal = rows.reduce((s,r)=>s + (r.amount||0), 0)

    return {
      baseInr: basePrice,
      subtotalInr: subtotal,
      extraAdults, extraHalf, extraFree,
      rows
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPkg, primaryAge, cleanedCompanions.length])

  // ---------- Promo preview ----------
  const totalCostBase = pricing.subtotalInr
  const totalCost = useMemo(() => promoPreview?.final_inr ?? totalCostBase, [promoPreview, totalCostBase])

  useEffect(() => {
    if(!promoAllowed) { setPromoPreview(null); return }
    if(!promoCode) { setPromoPreview(null); return }
    const params = { code: promoCode }
    if (resp?.booking_id) params.booking_id = resp.booking_id
    else if (selectedPkg?.id) params.package_id = selectedPkg.id
    params.amount_inr = totalCostBase
    api.validatePromocode(params).then(setPromoPreview).catch(()=>setPromoPreview(null))
  }, [promoAllowed, promoCode, selectedPkg?.id, totalCostBase, resp?.booking_id])

  // ---------- companions list handlers ----------
  function addCompanion(){
    setCompanions(prev => [...prev, { name:'', age:'', blood_group:'', gender:'O', meal_preference:'NONE' }])
  }
  function updateCompanion(i, field, v){
    setCompanions(prev => prev.map((c,idx)=> idx===i? {...c, [field]: v } : c))
  }
  function removeCompanion(i){
    setCompanions(prev => prev.filter((_,idx)=> idx!==i))
  }

  // ---- Convenience fee estimation (single rate; no method selection) ----
  const feeCalc = useMemo(() => {
    const base = Math.max(0, Number(totalCost || 0)); // after promo
    const r = PLATFORM_FEE_RATE;
    if (r <= 0) {
      return { r, fee: 0, gst: 0, feePlusGst: 0, gross: Math.round(base) };
    }
    const gross = base / (1 - r * (1 + GST_ON_FEE)); // gross-up
    const feePlusGstPrecise = gross - base
    const fee = Math.round(gross * r)
    const feePlusGst = Math.round(feePlusGstPrecise)
    const gst = Math.max(0, feePlusGst - fee)
    return { r, fee, gst, feePlusGst, gross: Math.round(gross) }
  }, [totalCost])

  // ---------- helpers ----------
  function buildReturnTo() {
    // Send the current page as absolute URL so backend can redirect user here
    const base = `${window.location.origin}/register`
    return base
  }

  function onDownloadTicket(bookingId) {
    if (!bookingId) return
    const url = `${API_BASE}/tickets/booking/${encodeURIComponent(bookingId)}.pdf`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  // ---------- submit ----------
  async function onSubmit(e){
    e.preventDefault()
    setErr(''); setResp(null)

    if (!accept) { setErr('Please accept the terms & conditions.'); return }
    if (!fullName || !email || !phone) { setErr('Please fill in your name, email, and phone.'); return }
    if (!selectedPkg?.id) { setErr('Please select a package.'); return }

    try {
      setLoading(true)
      const cleaned = cleanedCompanions

      // Step 1: Create booking
      const booking = await api.createBooking({
        event_id: eventId || 1,
        package_id: selectedPkg.id,
        category: '', // auto-chosen later
        companions: cleaned,                         // includes gender + meal_preference
        primary_gender: primaryGender,
        primary_meal_preference: primaryMeal,
        primary_age: primaryAge || undefined,
        blood_group: bloodGroup,
        emergency_contact_name: emerName,
        emergency_contact_phone: emerPhone,
        promo_code: (promoAllowed && promoCode) ? promoCode : undefined,
        guests: 1 + cleaned.length
      })
      setResp(booking)

      // Optional: Sightseeing opt-in (non-blocking)
      if (wantSightseeing && booking?.id) {
        try {
          if (typeof api.sightseeingOptIn === 'function') {
            await api.sightseeingOptIn({ booking_id: booking.id, opt_in: true, guests: 1 + cleaned.length })
          } else if (typeof api.post === 'function') {
            await api.post('/sightseeing/optin', { booking_id: booking.id, opt_in: true, guests: 1 + cleaned.length })
          }
        } catch (e) {
          console.warn('Sightseeing opt-in failed (non-blocking):', e)
        }
      }

      // Step 2: payment order; include return_to so callback comes back here
      const order = await api.createOrder({
      package_id: selectedPkg.id,
      booking_id: booking?.id,
      pass_platform_fee: true,
      assume_method: assumeMethod,                    // "card"|"upi"|"netbanking"
      return_to: `${window.location.origin}/profile` // where you want to land
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

  return (
    <div className="py-12">
      {/* makes option list + selected text black everywhere */}
      <style>{`
        select, input, textarea { color:#000; }
        select option { background:#ffffff; color:#000000; }
        input::placeholder { color: #f3f4f5ff; } /* slate-600 */
      `}</style>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-6 sm:px-10 sm:py-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <h1 className="text-3xl sm:text-4xl font-extrabold">Register for Highway to Heal</h1>
            <p className="mt-3 text-slate-400">
              24–26 January • Purulia, Barabhum • {formatINR(selectedPkg?.price_inr || PRICE_PER_PERSON)} base
            </p>

            {/* Payment status banner (from Razorpay callback redirect) */}
            {!!payBanner && (
              payBanner.status === 'success' ? (
                <div className="mt-6 rounded-xl border border-emerald-700 bg-emerald-900/20 text-emerald-200 px-4 py-3">
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
                    <Link to="/" className="text-slate-300 underline">Go to Home</Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-rose-700 bg-rose-900/20 text-rose-200 px-4 py-3">
                  <div className="font-semibold">Payment failed</div>
                  <div className="text-sm mt-1">
                    {payBanner.reason ? <>Reason: <b>{String(payBanner.reason)}</b></> : 'We could not verify the payment.'}
                  </div>
                </div>
              )
            )}

            <form onSubmit={onSubmit} className="mt-10 grid gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)}
                         className={inputCls} placeholder="Your full name" required/>
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)}
                         className={inputCls} placeholder="+91-XXXXXXXXXX" required/>
                </div>

                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                         className={inputCls} placeholder="you@example.com" required/>
                </div>

                <div>
                  <label className={labelCls}>Primary Gender</label>
                  <select value={primaryGender} onChange={e=>setPrimaryGender(e.target.value)} className={selectCls}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other / Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Primary Age (optional)</label>
                  <input value={primaryAge} onChange={e=>setPrimaryAge(e.target.value)}
                         className={inputCls} placeholder="e.g., 28"/>
                </div>

                <div>
                  <label className={labelCls}>Primary Meal Preference</label>
                  <select value={primaryMeal} onChange={e=>setPrimaryMeal(e.target.value)} className={selectCls}>
                    {MEAL_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Package</label>
                  <select
                    value={selectedPkg?.id||''}
                    onChange={e=>setSelectedPkg(packages.find(p=>String(p.id)===e.target.value)||null)}
                    className={selectCls}
                  >
                    {(packages.length?packages:[{id:'demo',name:'Standard',price_inr:6499}]).map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {formatINR(p.price_inr||6499)}</option>
                    ))}
                  </select>
                  {selectedPkg && (
                    <div className="mt-2 text-xs text-slate-400">{packageRuleText}</div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-300 text-sm">Tickets (total people)</div>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="number" min={1} value={tickets}
                             onChange={e=>setTickets(Math.max(1, Number(e.target.value||1)))}
                             className={smallInputCls + ' w-28'}/>
                      <span className="text-slate-400 text-sm">(Primary + companions with names)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-300 text-sm">Subtotal (before promo)</div>
                    <div className="text-2xl font-black">{formatINR(totalCostBase)}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <button type="button" onClick={addCompanion}
                          className="rounded-xl px-3 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700">
                    Add Companion
                  </button>

                  <div className="mt-4 grid gap-3">
                    {companions.map((c,i)=>(
                      <div key={i} className="grid sm:grid-cols-8 gap-3 items-center">
                        <input value={c.name} onChange={e=>updateCompanion(i,'name',e.target.value)}
                               placeholder="Name" className={smallInputCls + ' sm:col-span-3'}/>
                        <input value={c.age} onChange={e=>updateCompanion(i,'age',e.target.value)}
                               placeholder="Age" className={smallInputCls + ' sm:col-span-1'}/>
                        <input value={c.blood_group} onChange={e=>updateCompanion(i,'blood_group',e.target.value)}
                               placeholder="Blood Group" className={smallInputCls + ' sm:col-span-1'}/>
                        <select value={c.gender ?? 'O'} onChange={e=>updateCompanion(i,'gender',e.target.value)}
                                className={smallInputCls + ' sm:col-span-1 appearance-none'}>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                          <option value="O">Other</option>
                        </select>
                        <select value={c.meal_preference ?? 'NONE'} onChange={e=>updateCompanion(i,'meal_preference',e.target.value)}
                                className={smallInputCls + ' sm:col-span-1 appearance-none'}>
                          {MEAL_OPTS.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
                        </select>
                        <button type="button" onClick={()=>removeCompanion(i)}
                                className="sm:col-span-1 rounded-xl px-3 py-2 bg-rose-600 text-white hover:bg-rose-500">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                  <div className="text-slate-300 text-sm mb-2">Medical / Emergency</div>
                  <input value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)}
                         placeholder="Blood Group" className={inputCls + ' mb-2'}/>
                  <input value={emerName} onChange={e=>setEmerName(e.target.value)}
                         placeholder="Emergency Contact Name" className={inputCls + ' mb-2'}/>
                  <input value={emerPhone} onChange={e=>setEmerPhone(e.target.value)}
                         placeholder="Emergency Contact Phone" className={inputCls}/>
                </div>

                {/* Show Promo section ONLY when promo is allowed for the package */}
                {promoAllowed && (
                  <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                    <div className="text-slate-300 text-sm mb-2">Promo Code</div>
                    <input value={promoCode} onChange={e=>setPromoCode(e.target.value)}
                           placeholder="e.g., H2H10" className={inputCls}/>
                    {promoPreview && promoPreview.valid && (
                      <div className="mt-2 text-sm text-bookingPrimary">
                        Discount: {formatINR(promoPreview.discount_inr)} • New total: <b>{formatINR(promoPreview.final_inr)}</b>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SIGHTSEEING (pay at venue) */}
              <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                <label className="flex items-start gap-3 text-slate-300 text-sm">
                  <input
                    type="checkbox"
                    checked={wantSightseeing}
                    onChange={e=>setWantSightseeing(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-white"
                  />
                  <span>
                    I’d like to join the <b>Sightseeing</b> add-on.
                    <div className="text-slate-400 text-xs mt-1">
                      We’ll reserve your spot now, and <b>you’ll pay at the venue</b>. No online charge for sightseeing.
                    </div>
                  </span>
                </label>
              </div>

              {/* Optional: Payment method hint (affects backend fee rate selection) */}
              {/* <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                <label className={labelCls}>Preferred online payment method</label>
                <select
                  value={assumeMethod}
                  onChange={e=>setAssumeMethod(e.target.value)}
                  className={selectCls}
                >
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Netbanking</option>
                </select>
                <div className="mt-2 text-xs text-slate-400">
                  Convenience fee shown below is an estimate; final split is confirmed on the payment page.
                </div>
              </div> */}

              {/* pricing breakdown table */}
              {pricing?.rows?.length ? (
                <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                  <div className="text-slate-300 text-sm mb-2">Price Breakdown</div>
                  <div className="grid gap-1">
                    {pricing.rows.map((r, idx)=>(
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{r.label}</span>
                        <span className="text-slate-200 font-medium">{formatINR(r.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ):null}

              {/* Total with convenience fee & GST */}
              <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-slate-300 text-sm">Subtotal (after promo)</div>
                  <div className="text-slate-200 font-medium">{formatINR(totalCost)}</div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <div className="text-slate-300 text-sm">Convenience fee (online processing)</div>
                  <div className="text-slate-200 font-medium">{formatINR(feeCalc.fee)}</div>
                </div>

                <div className="mt-1 flex items-center justify-between gap-4">
                  <div className="text-slate-400 text-xs">GST {Math.round(GST_ON_FEE * 100)}% on processing fee</div>
                  <div className="text-slate-300 text-sm">{formatINR(feeCalc.gst)}</div>
                </div>

                <div className="mt-3 border-t border-slate-700 pt-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-300 text-sm">Payable now</div>
                    <div className="text-xs text-slate-500">Estimated</div>
                  </div>
                  <div className="text-2xl font-black">{formatINR(feeCalc.gross)}</div>
                </div>

                <div className="mt-3 text-right text-slate-400 text-sm">
                  Inclusive of accommodation, meals & performances
                </div>
              </div>

              <label className="flex items-start gap-3 text-slate-300 text-sm">
                <input type="checkbox" checked={accept} onChange={e=>setAccept(e.target.checked)}
                       className="mt-1 h-4 w-4 rounded border-slate-700 bg-white"/>
                <span>I agree to the <a className="text-bookingPrimary underline" href="#!">terms & conditions</a>.</span>
              </label>

              {err && <div className="rounded-xl border border-rose-700 bg-rose-900/20 text-rose-200 px-4 py-3">{err}</div>}
              {resp && <div className="rounded-xl border border-bookingPrimary bg-emerald-900/20 text-emerald-200 px-4 py-3">
                Booking created! {resp?.id ? <><span className="ml-1">ID: <b>{resp.id}</b></span></> : null}
              </div>}

              <div className="flex items-center gap-4">
                <button type="submit" disabled={loading}
                        className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-lg ${loading?'bg-slate-700 text-slate-300 cursor-not-allowed':'bg-bookingPrimary text-slate-950 hover:bg-bookingPrimary/90 shadow-emerald-800/30'}`}>
                  {loading ? 'Processing...' : 'Confirm & Pay'}
                </button>
                <Link to="/" className="text-slate-300 hover:text-slate-100 underline">Back to Home</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
