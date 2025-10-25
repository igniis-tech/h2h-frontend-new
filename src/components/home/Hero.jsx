import { Link } from 'react-router-dom'

export default function Hero(){
  return (
    <section
      className="relative flex h-screen min-h-[700px] w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.25) 100%), url('https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=2400&auto=format&fit=crop')"
      }}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-display text-brandDark text-5xl font-black leading-tight tracking-[-0.033em] md:text-7xl">
          Highway to Heal: Your Journey Awaits
        </h1>
        <h2 className="text-brandDark/70 text-lg font-normal leading-normal md:text-xl">
          A Fusion of Music, Nature, and Soul
        </h2>
        <Link
          to="/register"
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105"
        >
          <span className="truncate">Book Your Journey</span>
        </Link>
      </div>
    </section>
  )
}
