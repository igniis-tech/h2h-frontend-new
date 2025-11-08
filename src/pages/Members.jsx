import React from 'react'

export default function Members() {
  const members = [
    { name: 'Abhirup Sengupta', email: 'abhirup@highwaytoheal.org' },
    { name: 'Arnab Adhikary', email: 'arnab@highwaytoheal.org' },
    { name: 'Kaushik Joardar', email: 'kaushik@highwaytoheal.org' },
    { name: 'Partha Sarathi Das', email: 'partha@highwaytoheal.org' },
    { name: 'Pritraj Sikdar', email: 'pritraj@highwaytoheal.org' },
    { name: 'Rohit Singh', email: 'rohit@highwaytoheal.org' },
    { name: 'Sagarika Mandal', email: 'sagarika@highwaytoheal.org' },
    { name: 'Saikat', email: 'saikat@highwaytoheal.org' },
    { name: 'Sayanta', email: 'sayanta@highwaytoheal.org' },
    { name: 'Subhadeep Bhattacharya', email: 'subhadeep@highwaytoheal.org' },
    { name: 'Sudip', email: 'sudip@highwaytoheal.org' },
    { name: 'Tanay Biswas', email: 'tanay@highwaytoheal.org' },
    { name: 'Tanmoy Biswas', email: 'tanmoy@highwaytoheal.org' },
  ]

  return (
    <section className="bg-white min-h-screen py-20 sm:py-28" id="members">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-10 text-center">
          <h1 className="font-display text-brandDark text-4xl font-black leading-tight tracking-[-0.033em]">Members</h1>
          <p className="text-brandDark/70 mt-2">Reach out to our team.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {members.map((m) => (
            <div key={m.email} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-brandDark font-semibold">{m.name}</div>
              <a href={`mailto:${m.email}`} className="text-sm text-primary hover:text-primary/90 underline break-words">
                {m.email}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
