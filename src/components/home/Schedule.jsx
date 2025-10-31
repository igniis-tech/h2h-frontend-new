export default function Schedule(){
  const days = [
    {title:'Day 1', items:[['8:30 AM','Gates Open & Registration'],['09:30 AM','Breakfast'],['11:00 AM','Hiking'],['4:00 PM','Photo Session'],['5:30 PM','Panic India Live'],['7:30 PM','Felicitation Influencer partner sponsors'],['8:00 PM','The Missing Link Live'],['10:00 PM','Dinner'],['11:00 PM','Camp Fire & Open Air Music'] ]},
    {title:'Day 2', items:[['8:00 AM','Breakfast'],['10:00 AM',' Sightseeing'], ['11:00 AM',' Workshop/ on ground activities'],['2:00 PM','Lunch'],['4:00 PM','Photo Session'],['5:30 PM','Raahi Live'], ['7:00 PM','Lakkhichhara Live'],['9:00 PM','Felicitation, Core team, Vendors'], ['9:30 PM','DJ Puja Live'],['10:00 PM','Dinner']]},
    {title:'Day 3', items:[['9:00 AM','Breakfast'],['10:00 AM','Basking & Photo Session'],['11:00 AM','Farewell & Drop to station'],['2:00 PM','Event Concludes']]}
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
            <div className="relative pl-8
          before:content-[''] before:absolute before:left-3 before:top-0 before:bottom-0
          before:w-px before:bg-brandDark/20
          flex flex-col gap-4" key={day.title}>
              <h3 className="pl-20 text-primary text-2xl font-bold">{day.title}</h3>
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
