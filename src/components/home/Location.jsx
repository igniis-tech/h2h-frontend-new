export default function Location(){
  return (
    <section className="bg-white py-20 sm:py-28" id="location">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-brandDark text-4xl font-black leading-tight tracking-[-0.033em]">The Venue</h2>
          <p className="text-brandDark/70 text-base leading-relaxed">
            Nestled in the heart of the serene Blackwood National Forest, our venue offers a breathtaking backdrop for an unforgettable experience.
            Lose yourself in the ancient woods, wander by the crystal-clear rivers, and find your rhythm in the heart of nature's cathedral.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-brandDark font-bold">Blackwood National Forest, Aspen Valley</p>
            <a className="text-primary font-medium hover:underline" href="#location">Get Directions</a>
          </div>
        </div>
        <div className="h-96 w-full overflow-hidden rounded-xl md:h-[480px]">
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://picsum.photos/seed/map/1200/800')", filter: 'grayscale(100%) contrast(1.1) brightness(0.95)' }}
          />
        </div>
      </div>
    </section>
  )
}
