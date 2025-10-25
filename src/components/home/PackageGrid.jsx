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
import { request } from '../../api/client'
import { Link } from 'react-router-dom'
import { formatINR } from '../../api/client'

export default function PackageGrid({ showHeader = false }) {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    request('/packages')
      .then(d => {
        const pkgs = Array.isArray(d) ? d : d?.packages || d?.data?.packages || d?.results || []
        setPackages(pkgs || [])
      })
      .catch(error => {
        console.error('Failed to load packages:', error)
        setError(error.message)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid gap-8 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col rounded-xl border-2 border-earthy/60 bg-forest/5 p-8 animate-pulse">
            <div className="h-6 bg-slate-700 rounded w-2/3 mb-4"></div>
            <div className="h-8 bg-slate-700 rounded w-1/2 mb-6"></div>
            <div className="space-y-3 flex-grow">
              <div className="h-4 bg-slate-700/50 rounded w-full"></div>
              <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
              <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
            </div>
            <div className="h-12 bg-slate-700 rounded-lg mt-8"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Failed to load packages: {error}</p>
      </div>
    )
  }

  if (!packages.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>No packages available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {packages.map((p)=> (
        <div
          key={p.id || p.name}
          className={`flex flex-col rounded-xl border-2 ${p.featured ? 'border-primary bg-forest/10' : 'border-earthy/60 bg-forest/5'} p-8`}
        >
          <h3 className="text-primary text-xl font-bold">{p.name}</h3>
          <p className="text-brandDark my-4 text-4xl font-black">{formatINR(p.price_inr || p.price || p.amount || 0)}</p>
          <ul className="flex-grow space-y-3 text-brandDark/80">
            {(p.items || (p.description ? [p.description] : [])).map((it, idx)=> (
              <li key={idx} className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-lg">check_circle</span>{it}</li>
            ))}
          </ul>
          <Link
            to="/register"
            className={`mt-8 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 ${p.featured ? 'bg-primary text-white hover:opacity-90' : 'bg-primary/15 text-primary hover:bg-primary hover:text-white'} text-base font-bold leading-normal tracking-[0.015em] transition-all`}
          >
            <span className="truncate">{p.featured ? 'Register Now' : 'Register'}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

