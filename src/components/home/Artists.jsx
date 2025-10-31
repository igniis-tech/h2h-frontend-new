import p1 from '../../assets/artist/lakkhichhara.webp'
import p2 from '../../assets/artist/missing.webp'
import p3 from '../../assets/artist/panic.webp'
import p4 from '../../assets/artist/raahi.webp'
import p5 from '../../assets/artist/djpuja.webp'


export default function Artists(){
  const names = ['Lakkhichhara','The Missing Link','Panic India','Raahi','DJ Puja']
  const tags = ['Legendary Bengali Rock band of Kolkata','Popular Bengali band from Kolkata','Upcoming Rock/Bollywood band from Kolkata','Upcoming English & Hindi rock band from Bardhhaman','Celebrity Bollywood DJ from Bangalore.']
  const photos = [p1,p2,p3,p4,p5];

  return (
    <section className="bg-white min-h-screen py-20 sm:py-28" id="artists">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-brandDark text-4xl font-black leading-tight tracking-[-0.033em]">The Lineup</h2>
          <p className="text-brandDark/70 mt-2">Sounds to guide your journey.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {names.map((name, i) => (
            <div key={name} className="group relative overflow-hidden rounded-xl">
              <div
                className="w-full bg-center bg-no-repeat aspect-square bg-cover transition-transform duration-500 group-hover:scale-110"
                // style={{ backgroundImage: `url('https://picsum.photos/seed/h2h${i}/800/800')` }}
                style={{ backgroundImage: `url(${photos[i % photos.length]})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 md:p-6">
                <p className="text-brandDark text-lg font-bold">{name}</p>
                <p className="text-black text-2xs font-medium">{tags[i]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
