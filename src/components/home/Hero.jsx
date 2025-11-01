import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import eventImg from '../../assets/Event.webp';

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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

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
    const threshold = w * 0.15;
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-black/60" />

              <div className="relative z-10 text-center text-white max-w-4xl px-4">
                <h1 className="font-display uppercase font-black tracking-[-0.01em] leading-[0.95] text-5xl md:text-7xl mb-3">
                  {s.title}
                </h1>
                <p className="font-body text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                  {s.blurb}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar: CTA */}
      <div className="absolute inset-x-0 bottom-6 sm:bottom-8 z-20 flex flex-col items-center gap-3">
        <Link
          to="/register"
          className="inline-flex items-center justify-center rounded-xl px-6 py-3
               bg-forest text-offwhite font-semibold shadow-sm transition
               hover:opacity-90 active:translate-y-px
               focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-30"
        >
          Book Your Hill Escape
        </Link>
      </div>

    </section>
  );
}
