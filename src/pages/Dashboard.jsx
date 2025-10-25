import { useEffect, useState } from 'react'
import { api, formatINR } from '../api/client'
import { useAuth } from '../state/auth'
import TicketCard from '../components/TicketCard'

function BookingRow({ b, onViewTicket, onDownloadTicket }) {
  const paid = b?.order?.paid ?? b?.paid
  return (
    <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-slate-100 font-bold">Booking #{b.id} • {b?.event?.name || 'Highway to Heal'}</div>
          <div className="text-slate-400 text-sm">Tickets: {b?.guests ?? '—'} • Paid: {paid ? 'Yes' : 'No'}</div>
          {b?.pricing_total_inr && <div className="text-slate-400 text-sm mt-1">Total: {formatINR(b.pricing_total_inr)}</div>}
        </div>
        <div className="flex gap-2">
          <button onClick={()=>onViewTicket(b)} className="rounded-xl px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700">View Ticket</button>
          <button onClick={()=>onDownloadTicket(b)} className="rounded-xl px-4 py-2 bg-dashPrimary text-slate-950 hover:bg-emerald-400">Download Ticket</button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard(){
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr('')
        const data = await api.myBookings()
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.results)? data.results : [])
        setBookings(arr)
      } catch (e) {
        setErr(e.message || 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function viewTicket(b){
    const orderId = b?.order?.id
    const url = orderId ? `${api.API_BASE}/tickets/order/${orderId}.pdf` : `${api.API_BASE}/tickets/booking/${b.id}.pdf`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function downloadTicket(b){
    try {
      const res = b?.order?.id
        ? await api.ticketByOrderPdf(b.order.id)
        : await api.ticketByBookingPdf(b.id)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `H2H_Ticket_${b?.order?.id || b.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Could not download ticket: ' + (e.message || 'Unknown error'))
    }
  }

  return (
    <div className="py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold">Your Profile</h1>
          <p className="text-slate-400">View your profile and bookings.</p>
        </div>

        <UserProfile />

        {loading ? (
          <div className="rounded-2xl border border-slate-800 p-8 bg-slate-900/60 animate-pulse text-slate-400">Loading your bookings…</div>
        ) : err ? (
          <div className="rounded-2xl border border-rose-700 bg-rose-900/20 text-rose-200 px-4 py-3">{err}</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 p-8 bg-slate-900/60">
            <p className="text-slate-300">No bookings found yet. Go to Register and complete your payment.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {bookings.map(b => <BookingRow key={b.id} b={b} onViewTicket={viewTicket} onDownloadTicket={downloadTicket} />)}
            </div>
            <div className="space-y-4">
              <TicketCard booking={bookings[0]} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UserProfile(){
  const { user } = useAuth()
  if (!user) return null
  return (
    <div className="rounded-2xl border border-slate-800 p-5 bg-slate-900/60 mb-6">
      <h2 className="text-xl font-bold text-slate-100">Profile</h2>
      <div className="mt-3 text-slate-300">
        <div><span className="text-slate-400">Username:</span> {user.username || user.id || '—'}</div>
        {user.email && <div><span className="text-slate-400">Email:</span> {user.email}</div>}
        {user.first_name && <div><span className="text-slate-400">First name:</span> {user.first_name}</div>}
        {user.last_name && <div><span className="text-slate-400">Last name:</span> {user.last_name}</div>}
        {user.profile && user.profile.full_name && <div><span className="text-slate-400">Full name:</span> {user.profile.full_name}</div>}
      </div>
    </div>
  )
}
