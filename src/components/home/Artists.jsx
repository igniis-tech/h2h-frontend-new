export default function Artists(){
  const names = ['The Wandering Souls','Echoes of Eden','Rivertown Revival','Luna Bloom','The Grove Trio','Sol Resonance']
  const tags = ['Indie Folk','Ambient Electronic','Roots Rock','Soulful Acoustic','Chillwave Jazz','Meditative Soundscapes']

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
                style={{ backgroundImage: `url('https://picsum.photos/seed/h2h${i}/800/800')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 md:p-6">
                <p className="text-brandDark text-lg font-bold">{name}</p>
                <p className="text-primary text-sm font-medium">{tags[i]}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
