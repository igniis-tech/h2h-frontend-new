import { useEffect, useState } from 'react'
import { api, formatINR } from '../api/client'
import { useAuth } from "../context/AuthContext";
import TicketCard from '../components/TicketCard'

function BookingRow({ b, onViewTicket, onDownloadTicket }) {
  const [paying, setPaying] = useState(false)

  // Handle serializer variations (list vs single)
  const orders = b.orders || (b.order ? [b.order] : [])
  // Attempt to find package from any associated order order
  const pkgId = orders.find(o => o.package && o.package.id)?.package?.id

  const total = b.pricing_total_inr || 0
  const paidAmt = b.amount_paid || 0
  const due = Math.max(0, total - paidAmt)

  // "Paid" if status is completed OR amount covers total
  const isPaid = b.payment_status === 'COMPLETED' || (total > 0 && paidAmt >= total)

  const canPayDue = due > 0 && b.status !== 'CANCELLED'

  async function handlePayDue() {
    if (paying) return

    // If we can't find a package ID (e.g. legacy/broken booking), we can't init payment easily
    if (!pkgId) {
      alert("Cannot identify package configuration for this booking. Please contact support.")
      return
    }

    try {
      setPaying(true)
      const res = await api.createOrder({
        package_id: pkgId,
        booking_id: b.id,
        payment_type: 'BALANCE',
        return_to: `${window.location.origin}/dashboard`
      })

      if (res?.payment_link) {
        window.location.href = res.payment_link
      } else {
        alert("Payment link generation failed. please try again.")
      }
    } catch (e) {
      alert("Error initiating payment: " + (e.message || "Unknown error"))
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="rounded-2xl border border-forest/20 p-5 bg-offwhite">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-forest font-bold">Booking #{b.id} • {b?.event?.name || 'Highway to Heal'}</div>
          <div className="text-forest/70 text-sm">Tickets: {b?.guests ?? '—'} • Paid: {isPaid ? 'Yes' : 'No'}</div>
          <div className="text-forest/70 text-sm mt-1">
            Total: {formatINR(total)}
            {paidAmt > 0 && <span className="ml-2 text-emerald-700">Paid: {formatINR(paidAmt)}</span>}
            {due > 0 ? <span className="ml-2 text-rose-600 font-bold">Due: {formatINR(due)}</span> : <span className="ml-2 text-emerald-700 font-bold">Fully Paid</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {canPayDue && (
            <button
              onClick={handlePayDue}
              disabled={paying}
              className="rounded-xl px-4 py-2 bg-bookingPrimary text-slate-950 hover:bg-bookingPrimary/90 font-bold disabled:opacity-50"
            >
              {paying ? 'Processing…' : 'Pay Balance'}
            </button>
          )}
          <button onClick={() => onDownloadTicket(b)} className="rounded-xl px-4 py-2 border-2 border-forest/20 text-forest/70 hover:bg-forest/5">Download PDF</button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr('')
        const data = await api.myBookings()
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : [])
        setBookings(arr)
      } catch (e) {
        setErr(e.message || 'Failed to load bookings')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function viewTicket(b) {
    const orderId = b?.order?.id
    const url = orderId ? `${api.API_BASE}/tickets/order/${orderId}.pdf` : `${api.API_BASE}/tickets/booking/${b.id}.pdf`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function downloadTicket(b) {
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
    <div className="pt-28 md:pt-32 pb-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-forest">Your Profile</h1>
          <p className="text-forest/70">View your profile and bookings.</p>
        </div>

        <UserProfile />

        {loading ? (
          <div className="rounded-2xl border border-forest/20 p-8 bg-offwhite animate-pulse text-forest/70">Loading your bookings…</div>
        ) : err ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3">{err}</div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-forest/20 p-8 bg-offwhite">
            <p className="text-forest/80">No bookings found yet. Go to Register and complete your payment.</p>
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

function UserProfile() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <div className="rounded-2xl border border-forest/20 p-5 bg-offwhite mb-6">
      <h2 className="text-xl font-bold text-forest">Profile</h2>
      <div className="mt-3 text-forest">
        <div><span className="text-forest/70">Username:</span> {user.username || user.id || '—'}</div>
        {user.email && <div><span className="text-forest/70">Email:</span> {user.email}</div>}
        {user.first_name && <div><span className="text-forest/70">First name:</span> {user.first_name}</div>}
        {user.last_name && <div><span className="text-forest/70">Last name:</span> {user.last_name}</div>}
        {user.profile && user.profile.full_name && <div><span className="text-forest/70">Full name:</span> {user.profile.full_name}</div>}
      </div>
    </div>
  )
}
