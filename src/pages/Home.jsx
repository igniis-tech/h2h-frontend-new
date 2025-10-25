
import Hero from '../components/home/Hero'
import Stats from '../components/home/Stats'
import About from '../components/home/About'
import Highlights from '../components/home/Highlights'
import Schedule from '../components/home/Schedule'
import Artists from '../components/home/Artists'
import Location from '../components/home/Location'
import Pricing from '../components/home/Pricing'

export default function Home(){
  return (
    <div className="font-body">
      <Hero />
      <Stats />
      <About />
      <Highlights />
      <Schedule />
      <Artists />
      <Location />
      <Pricing />
    </div>
  )
}

function PackageGrid(){
  const [packages, setPackages] = useState([])
  useEffect(()=>{
    api.listPackages().then(d=>{
      const pkgs = Array.isArray(d) ? d : d?.packages || d?.data?.packages || d?.results || []
      setPackages(pkgs || [])
    }).catch(()=>{})
  },[])

  const fallback = [
    {name:'Wanderer Pass', price_inr:6499, items:['3-Day General Admission','Access to All Main Stages','Campsite Access'], featured:false},
    {name:'Explorer VIP', price_inr:12999, items:['All Wanderer Pass Benefits','VIP Lounge Access','Priority Stage Viewing','Exclusive Workshops'], featured:true},
    {name:'Camping Pass', price_inr:2500, items:['Per-Person Add-On','Designated Tent Spot','Access to Showers & Facilities'], featured:false},
  ]

  const list = packages.length ? packages : fallback

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {list.map((p)=> (
        <div
          key={p.id || p.name}
          className={`flex flex-col rounded-xl border-2 ${
            p.featured ? 'border-primary bg-forest/10' : 'border-earthy/60 bg-forest/5'
          } p-8`}
        >
          <h3 className="text-primary text-xl font-bold">{p.name}</h3>
          <p className="text-brandDark my-4 text-4xl font-black">
            {formatINR(p.price_inr || p.price || p.amount || 0)}
          </p>
          <ul className="flex-grow space-y-3 text-brandDark/80">
            {(p.items || (p.description ? [p.description] : [])).map((it, idx)=> (
              <li key={idx} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">check_circle</span>{it}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className={`mt-8 flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 ${
              p.featured
                ? 'bg-primary text-white hover:opacity-90'
                : 'bg-primary/15 text-primary hover:bg-primary hover:text-white'
            } text-base font-bold leading-normal tracking-[0.015em] transition-all`}
          >
            <span className="truncate">{p.featured ? 'Register Now' : 'Register'}</span>
          </Link>
        </div>
      ))}
    </div>
  )
}
