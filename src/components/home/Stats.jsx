import stats from '../../assets/stats.png'

export default function Stats() {
  return (
    <section
      className="relative py-12 sm:py-16 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${stats})` }}
    >
      {/* dark overlay for readability */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          {[
            ['music_note','Live Music'],
            ['forest','Serene Nature'],
            ['explore','Road Trip Vibe'],
            ['self_improvement','Wellness & Healing'],
          ].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-3 rounded-lg p-4">
              {/* icons stay yellow */}
              <span className="material-symbols-outlined text-primary text-4xl">{icon}</span>
              {/* only the text is white */}
              <p className="text-white text-lg font-bold leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
