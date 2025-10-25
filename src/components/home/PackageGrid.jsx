// import React, { useEffect, useState } from 'react'
// import { api, formatINR } from '../../api/client'
// import { Link } from 'react-router-dom'

// export default function PackageGrid(){
//   const [packages, setPackages] = useState([])
//   useEffect(()=>{
//     api.listPackages().then(d=>{
//       const pkgs = Array.isArray(d) ? d : d?.packages || d?.data?.packages || d?.results || []
//       setPackages(pkgs || [])
//     }).catch(()=>{})
//   },[])

//   const fallback = [
//     {name:'Wanderer Pass', price_inr:6499, items:['3-Day General Admission','Access to All Main Stages','Campsite Access'], featured:false},
//     {name:'Explorer VIP', price_inr:12999, items:['All Wanderer Pass Benefits','VIP Lounge Access','Priority Stage Viewing','Exclusive Workshops'], featured:true},
//     {name:'Camping Pass', price_inr:2500, items:['Per-Person Add-On','Designated Tent Spot','Access to Showers & Facilities'], featured:false},
//   ]

//   const list = packages.length ? packages : fallback

//   // Make the PAGE/SECTION background white (cards remain tinted)
//   return (
//     <section className="!bg-white min-h-screen">
//       <div className="grid gap-8 md:grid-cols-3">
//         {list.map((p)=> (
//           <div
//             key={p.id || p.name}
//             className={`flex flex-col rounded-xl border-2 ${p.featured ? 'border-primary bg-forest/10' : 'border-earthy/60 bg-forest/5'} p-8`}
//           >
//             <h3 className="text-primary text-xl font-bold">{p.name}</h3>
//             <p className="text-brandDark my-4 text-4xl font-black">{formatINR(p.price_inr || p.price || p.amount || 0)}</p>
//             <ul className="flex-grow space-y-3 text-brandDark/80">
//               {(p.items || (p.description ? [p.description] : [])).map((it, idx)=> (
//                 <li key={idx} className="flex items-center gap-2">
//                   <span className="material-symbols-outlined text-primary text-lg">check_circle</span>{it}
//                 </li>
//               ))}
//             </ul>
//             <Link
//               to="/register"
//               className={`mt-8 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 ${p.featured ? 'bg-primary text-white hover:opacity-90' : 'bg-primary/15 text-primary hover:bg-primary hover:text-white'} text-base font-bold leading-normal tracking-[0.015em] transition-all`}
//             >
//               <span className="truncate">{p.featured ? 'Register Now' : 'Register'}</span>
//             </Link>
//           </div>
//         ))}
//       </div>
//     </section>
//   )
// }
import React, { useEffect, useState } from 'react'
import { api, formatINR } from '../../api/client'
import { Link } from 'react-router-dom'

export default function PackageGrid({ showHeader = false }) {
  const [packages, setPackages] = useState([])

  useEffect(() => {
    api.listPackages()
      .then(d => {
        const pkgs = Array.isArray(d) ? d : d?.packages || d?.data?.packages || d?.results || []
        setPackages(pkgs || [])
      })
      .catch(() => {})
  }, [])

  const fallback = [
    { name: 'Wanderer Pass', price_inr: 6499,  items: ['3-Day General Admission','Access to All Main Stages','Campsite Access'] },
    { name: 'Explorer VIP',  price_inr: 12999, items: ['All Wanderer Pass Benefits','VIP Lounge Access','Priority Stage Viewing','Exclusive Workshops'] },
    { name: 'Camping Pass',  price_inr: 2500,  items: ['Per-Person Add-On','Designated Tent Spot','Access to Showers & Facilities'] },
  ]
  const list = (packages?.length ? packages : fallback).slice(0, 3)

  return (
    <section id="packages" className="bg-white">
      <div className="mx-auto max-w-6xl px-4">
        {showHeader && (
          <header className="text-center mb-12">
            <h2 className="font-display text-4xl font-black tracking-[-0.02em] text-[#0B1B2B]">
              Secure Your Spot
            </h2>
            <p className="mt-2 text-[#0B1B2B]/70">Choose your path on the highway to heal.</p>
          </header>
        )}

        {/* Three equal-sized navy cards */}
        <div className="grid gap-6 md:grid-cols-3 auto-rows-fr">
          {list.map(p => (
            <div
              key={p.id || p.name}
              className="h-full flex flex-col rounded-2xl border-2 border-[#D4A63A] bg-[#0B1B2B] p-8 shadow-sm"
            >
              <h3 className="text-[#D4A63A] text-xl font-semibold">{p.name}</h3>
              <p className="my-4 text-5xl font-black text-white">
                {formatINR(p.price_inr || p.price || p.amount || 0)}
              </p>

              <ul className="flex-grow space-y-3 text-white/90">
                {(p.items || (p.description ? [p.description] : [])).map((it, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="material-symbols-outlined text-[#D4A63A] text-lg">check_circle</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="mt-8 flex h-12 w-full items-center justify-center rounded-lg bg-[#D4A63A] text-[#0B1B2B] text-base font-bold tracking-[0.015em] transition-opacity hover:opacity-90"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

