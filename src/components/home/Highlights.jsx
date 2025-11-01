import React from 'react'
import Concert from "../../assets/concert.JPG";
import CampFire from "../../assets/camp-fire.jpeg";
import celebs from "../../assets/celeb.jpeg";
import cul from "../../assets/cul.jpeg";

const FEATURES = [
  { title: 'Open Air Music Concerts', img: Concert , desc:'Festival Experience in the Lap of Nature.'},
  { title: 'Off Stage Moments', img: celebs, desc:'Engage, Gossip with celebrity artists & influencers.'},
  { title: 'Night Fun & Camp Fire', img: CampFire, desc:'Cozy bonfires & storytelling under starry sky.'},
  { title: 'Cultural Immersion', img: cul, desc:'Experience local traditions, crafts, and cuisine.'},
]

export default function Highlights(){
  return (
    <section id="journey" className="section bg-white">
      <div className="mx-auto max-w-5xl px-4">

        {/* container around the block */}
        <div className="rounded-2xl border border-earthy/60 bg-blueback p-4 sm:p-6 md:p-8 shadow-sm">
          <h2 className="text-3xl md:text-4xl font-bold text-forest mb-6 md:mb-8 text-center">
            Your Unforgettable Journey Begins
          </h2>

          <div className="grid gap-6 md:gap-8 md:grid-cols-2">
            {FEATURES.map((f,i)=>(
              <article
                key={i}
                className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={f.img}
                  alt={f.title}
                  className="w-full sm:w-40 h-36 object-cover flex-shrink-0"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-forest">{f.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
