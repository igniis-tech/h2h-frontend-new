export default function Schedule(){
  const days = [
    {title:'Day 1: Arrival & Awakening', items:[['4:00 PM','Gates Open & Fun Game Activity'],['06:00 PM','Evening Snacks & Sunset Acoustic Set'],['07:00 PM','Panic India & The Missing Link Live'],['10:00 PM','Dinner & Chill'] ]},
    {title:'Day 2: Exploration & Sound', items:[['8:00 AM','Morning Brew & Vibes'],['10:00 AM','Trek Groups & Sightseeing Circuits'],['2:00 PM','Refuel & Reset (Meal Break)'], ['3:00 PM','Camp Mini-Olympics(Mini-games)'], ['7:00 PM','Musical & DJ Nights '],['10:00 PM','Gala Dinner']]},
    {title:'Day 3: Reflection & Departure', items:[['9:00 AM','Gratitude Circle & Sound Bath'],['11:00 AM','Farewell Brunch & Jam Session'],['2:00 PM','Event Concludes'] ]}
  ]

  return (
    <section className="bg-white py-20 sm:py-28" id="schedule">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-brandDark text-4xl font-black leading-tight tracking-[-0.033em]">Event Schedule</h2>
          <p className="text-brandDark/70 mt-2">Three days of unforgettable experiences.</p>
        </div>
        <div className="grid gap-12 md:grid-cols-3">
          {days.map((day) => (
            <div className="flex flex-col gap-6" key={day.title}>
              <h3 className="text-primary text-2xl font-bold">{day.title}</h3>
              <div className="relative flex flex-col gap-4 pl-12">
                {day.items.map(([time, label], idx, arr) => (
                  <div key={idx} className="relative pb-4">
                    <div className="absolute left-3.5 top-6 bottom-0 w-px bg-white" style={{ display: idx === arr.length - 1 ? 'none' : 'block' }} />
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="h-5 w-5 rounded-full bg-white border-2 border-primary shadow-sm" />
                      </div>
                      <div>
                        <p className="text-brandDark font-bold">{time}</p>
                        <p className="text-brandDark/70 text-sm">{label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
