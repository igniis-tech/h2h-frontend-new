// import { Link } from 'react-router-dom'

// export default function Hero(){
//   return (
//     <section
//       className="relative flex h-screen min-h-[700px] w-full flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4"
//       style={{
//         backgroundImage:
//           "linear-gradient(rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.25) 100%), url('https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=2400&auto=format&fit=crop')"
//       }}
//     >
//       <div className="flex flex-col items-center gap-6 text-center">
//         <h1 className="font-display text-brandDark text-5xl font-black leading-tight tracking-[-0.033em] md:text-7xl">
//           Highway to Heal: Your Journey Awaits
//         </h1>
//         <h2 className="text-brandDark/70 text-lg font-normal leading-normal md:text-xl">
//           A Fusion of Music, Nature, and Soul
//         </h2>
//         <Link
//           to="/register"
//           className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] transition-transform hover:scale-105"
//         >
//           <span className="truncate">Book Your Journey</span>
//         </Link>
//       </div>
//     </section>
//   )
// }
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import eventImg from '../../assets/event.png'

const slides = [
  {
    img: eventImg,
    title: "HIGHWAY TO HEAL",
    blurb: "Unwind. Reconnect. Discover. Your Week-Long Mountain Escape Awaits.",
  }
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const startX = useRef(null);
  const containerRef = useRef(null);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const goTo = (i) => setIndex(clamp(i, 0, slides.length - 1));
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  // Arrow keys
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  // Pointer/drag handlers
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    startX.current = e.clientX;
    setDragX(0);
  };
  const onPointerMove = (e) => {
    if (startX.current == null) return;
    setDragX(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (startX.current == null) return;
    const w = containerRef.current?.clientWidth || 300;
    const threshold = w * 0.15; // 15% swipe
    if (dragX <= -threshold) next();
    else if (dragX >= threshold) prev();
    setDragX(0);
    startX.current = null;
  };

  return (
    <section id="about" className="relative h-[84vh] overflow-hidden">
      {/* Slides track */}
      <div
        ref={containerRef}
        className="absolute inset-0"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="h-full flex"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
            transition: startX.current ? "none" : "transform 400ms ease",
            willChange: "transform",
          }}
        >
          {slides.map((s, i) => (
            <div key={i} className="relative h-full w-full shrink-0 grid place-items-center">
              <img
                src={s.img}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />
              <div className="relative z-10 text-center text-white max-w-3xl px-4">
                <h1
                  className="text-5xl md:text-7xl mb-2 tracking-widest"
                  style={{ fontFamily: '"Permanent Marker", cursive' }}
                >
                  {s.title}
                </h1>
                <p className="text-base md:text-lg text-white/90">{s.blurb}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar: CTA + dots */}
      <div className="absolute inset-x-0 bottom-6 sm:bottom-8 z-20 flex flex-col items-center gap-3">
        <Link to="/booking" className="btn-dark">
          Book Your Hill Escape
        </Link>
      </div>
    </section>
  );
}
