import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, formatINR } from '../api/client'

const PRICE_PER_PERSON = 6499

export default function Register(){
  const [packages, setPackages] = useState([])
  const [eventId, setEventId] = useState(null)
  const [selectedPkg, setSelectedPkg] = useState(null)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [tickets, setTickets] = useState(1)
  const [companions, setCompanions] = useState([]) // [{name, age, blood_group}]
  const [bloodGroup, setBloodGroup] = useState('')
  const [emerName, setEmerName] = useState('')
  const [emerPhone, setEmerPhone] = useState('')
  const [promoCode, setPromoCode] = useState('')

  const [accept, setAccept] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [resp, setResp] = useState(null)
  const [promoPreview, setPromoPreview] = useState(null)

  const totalCostBase = useMemo(() => tickets * (selectedPkg?.price_inr || PRICE_PER_PERSON), [tickets, selectedPkg])
  const totalCost = useMemo(() => promoPreview?.final_inr ?? totalCostBase, [promoPreview, totalCostBase])

  useEffect(() => {
    api.listPackages().then(d=>{
      // Normalize multiple possible response shapes from backend:
      // - { packages: [...] }
      // - { data: { packages: [...] } }
      // - [...] (array directly)
      // - { results: [...] }
      const pkgs = Array.isArray(d)
        ? d
        : d?.packages || d?.data?.packages || d?.results || [];
      setPackages(pkgs || [])
      setEventId(d?.event?.id || d?.data?.event?.id || null)
      setSelectedPkg((pkgs||[])[0] || null)
    }).catch(()=>{})
  }, [])

  // Promo preview whenever code or base changes
  useEffect(() => {
    if(!promoCode) { setPromoPreview(null); return }
    const params = { code: promoCode }
    if (resp?.booking_id) params.booking_id = resp.booking_id
    else if (selectedPkg?.id) params.package_id = selectedPkg.id
    params.amount_inr = totalCostBase
    api.validatePromocode(params).then(setPromoPreview).catch(()=>setPromoPreview(null))
  }, [promoCode, selectedPkg?.id, totalCostBase, resp?.booking_id])

  function addCompanion(){
    setCompanions(prev => [...prev, { name:'', age:'', blood_group:'' }])
  }
  function updateCompanion(i, field, v){
    setCompanions(prev => prev.map((c,idx)=> idx===i? {...c, [field]: v } : c))
  }
  function removeCompanion(i){
    setCompanions(prev => prev.filter((_,idx)=> idx!==i))
  }

  async function onSubmit(e){
    e.preventDefault()
    setErr(''); setResp(null)

    if (!accept) { setErr('Please accept the terms & conditions.'); return }
    if (!fullName || !email || !phone) { setErr('Please fill in your name, email, and phone.'); return }
    if (!selectedPkg?.id) { setErr('Please select a package.'); return }

    try {
      setLoading(true)
      // Step 1: Create booking
      const booking = await api.createBooking({
        event_id: eventId || 1,
        package_id: selectedPkg.id,
        category: '', // property/unit_type chosen automatically later
        companions: companions.filter(c=>c.name),
        blood_group: bloodGroup,
        emergency_contact_name: emerName,
        emergency_contact_phone: emerPhone,
        promo_code: promoCode || undefined,
        guests: 1 + companions.filter(c=>c.name).length
      })
      setResp(booking)

      // Step 2: Create payment order (will return payment_link)
      const order = await api.createOrder({
        package_id: selectedPkg.id,
        booking_id: booking?.id
      })

      // If payment link present, hand off
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 overflow-hidden">
          <div className="p-6 sm:p-10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <h1 className="text-3xl sm:text-4xl font-extrabold">Register for Highway to Heal</h1>
            <p className="mt-3 text-slate-400">24–26 January • Purulia, Barabhum • {formatINR(selectedPkg?.price_inr || PRICE_PER_PERSON)} per person</p>

            <form onSubmit={onSubmit} className="mt-10 grid gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Full Name</label>
                  <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-bookingPrimary" placeholder="Your full name" required/>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Phone</label>
                  <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-bookingPrimary" placeholder="+91-XXXXXXXXXX" required/>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Email</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-bookingPrimary" placeholder="you@example.com" required/>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Package</label>
                  <select value={selectedPkg?.id||''} onChange={e=>setSelectedPkg(packages.find(p=>String(p.id)===e.target.value)||null)} className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 outline-none focus:ring-2 focus:ring-bookingPrimary">
                    {(packages.length?packages:[{id:'demo',name:'Standard',price_inr:6499}]).map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {formatINR(p.price_inr||6499)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-300 text-sm">Tickets (total people)</div>
                    <div className="flex items-center gap-2 mt-2">
                      <input type="number" min={1} value={tickets} onChange={e=>setTickets(Math.max(1, Number(e.target.value||1)))} className="w-28 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary"/>
                      <span className="text-slate-400 text-sm">(Primary + companions)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-300 text-sm">Total (before promo)</div>
                    <div className="text-2xl font-black">{formatINR(totalCostBase)}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <button type="button" onClick={addCompanion} className="rounded-xl px-3 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700">Add Companion</button>
                  <div className="mt-4 grid gap-3">
                    {companions.map((c,i)=>(
                      <div key={i} className="grid sm:grid-cols-6 gap-3 items-center">
                        <input value={c.name} onChange={e=>updateCompanion(i,'name',e.target.value)} placeholder="Name" className="sm:col-span-3 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary"/>
                        <input value={c.age} onChange={e=>updateCompanion(i,'age',e.target.value)} placeholder="Age" className="sm:col-span-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary"/>
                        <input value={c.blood_group} onChange={e=>updateCompanion(i,'blood_group',e.target.value)} placeholder="Blood Group" className="sm:col-span-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary"/>
                        <button type="button" onClick={()=>removeCompanion(i)} className="sm:col-span-1 rounded-xl px-3 py-2 bg-rose-600 text-white hover:bg-rose-500">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                  <div className="text-slate-300 text-sm mb-2">Medical / Emergency</div>
                  <input value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)} placeholder="Blood Group" className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary mb-2"/>
                  <input value={emerName} onChange={e=>setEmerName(e.target.value)} placeholder="Emergency Contact Name" className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary mb-2"/>
                  <input value={emerPhone} onChange={e=>setEmerPhone(e.target.value)} placeholder="Emergency Contact Phone" className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary"/>
                </div>
                <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/40">
                  <div className="text-slate-300 text-sm mb-2">Promo Code</div>
                  <input value={promoCode} onChange={e=>setPromoCode(e.target.value)} placeholder="e.g., H2H10" className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-bookingPrimary"/>
                  {promoPreview && promoPreview.valid && (
                    <div className="mt-2 text-sm text-bookingPrimary">
                      Discount: {formatINR(promoPreview.discount_inr)} • New total: <b>{formatINR(promoPreview.final_inr)}</b>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-slate-300 text-sm">Total</div>
                    <div className="text-2xl font-black">{formatINR(totalCost)}</div>
                  </div>
                  <div className="text-right text-slate-400 text-sm">Inclusive of accommodation, meals & performances</div>
                </div>
              </div>

              <label className="flex items-start gap-3 text-slate-300 text-sm">
                <input type="checkbox" checked={accept} onChange={e=>setAccept(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900"/>
                <span>I agree to the <a className="text-bookingPrimary underline" href="#!">terms & conditions</a>.</span>
              </label>

              {err && <div className="rounded-xl border border-rose-700 bg-rose-900/20 text-rose-200 px-4 py-3">{err}</div>}
              {resp && <div className="rounded-xl border border-bookingPrimary bg-emerald-900/20 text-emerald-200 px-4 py-3">
                Booking created! {resp?.id ? <><span className="ml-1">ID: <b>{resp.id}</b></span></> : null}
              </div>}

              <div className="flex items-center gap-4">
                <button type="submit" disabled={loading} className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold shadow-lg ${loading?'bg-slate-700 text-slate-300 cursor-not-allowed':'bg-bookingPrimary text-slate-950 hover:bg-bookingPrimary/90 shadow-emerald-800/30'}`}>
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
