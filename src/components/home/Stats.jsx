export default function Stats(){
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4">
        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          {[['music_note','Live Music'],['forest','Serene Nature'],['explore','Road Trip Vibe'],['self_improvement','Wellness & Healing']].map(([icon,label]) => (
            <div key={label} className="flex flex-col items-center gap-3 rounded-lg p-4">
              <span className="material-symbols-outlined text-primary text-4xl">{icon}</span>
              <p className="text-brandDark text-lg font-bold leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
