import { useEffect, useRef } from 'react'

function useFakeQR(text='', size=140) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current; if(!c) return
    c.width = size; c.height = size
    const ctx = c.getContext('2d'); ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,size,size)
    let h = 2166136261; for (let i=0;i<text.length;i++){ h ^= text.charCodeAt(i); h += (h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24) }
    const cols = 21, cell = Math.floor(size/cols)
    for (let y=0;y<cols;y++){ for(let x=0;x<cols;x++){ h = (h ^ (x+31*y)) >>> 0; const on = (h & (1<<((x+y)%31))) !== 0
      ctx.fillStyle = on ? '#eab308' : '#0b1220'; ctx.fillRect(x*cell,y*cell,cell-1,cell-1) } }
  }, [text, size])
  return ref
}

export default function TicketCard({ booking }){
  const qrRef = useFakeQR(`booking:${booking?.id||'demo'}`, 140)
  return (
    <div className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
      <h3 className="text-lg font-bold text-brandDark">E-Ticket / Pass</h3>
      <p className="text-slate-600 text-sm">Placeholder QR — final QR will come from backend.</p>
      <div className="mt-4 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
        <div className="text-slate-700">
          <div><span className="text-slate-500">Event:</span> Highway to Heal — Purulia</div>
          <div><span className="text-slate-500">Dates:</span> 24–26 January</div>
          <div><span className="text-slate-500">Booking ID:</span> {booking?.id ?? '—'}</div>
          <div><span className="text-slate-500">Tickets:</span> {booking?.guests ?? booking?.tickets ?? '—'}</div>
          <div><span className="text-slate-500">Name:</span> {booking?.user?.username ?? booking?.full_name ?? '—'}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3"><canvas ref={qrRef} className="block rounded-lg"/></div>
      </div>
    </div>
  )
}
