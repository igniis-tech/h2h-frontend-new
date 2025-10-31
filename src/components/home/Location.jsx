// src/sections/Location.jsx
import React, { useEffect, useRef, useState } from "react";
import ps from '../../assets/venue/venue1.jpeg';
import ps2 from '../../assets/venue/venue2.jpeg';
import ps3 from '../../assets/venue/venue3.jpeg';
import ps4 from '../../assets/venue/venue4.jpeg';
import ps5 from '../../assets/venue/venue5.jpeg';
import ps6 from '../../assets/venue/venue6.jpeg';   

export default function Location() {
  // 👉 Replace with your own venue images
  const images = [
    { src: ps, alt: "Misty pines at dawn" },
    { src: ps2, alt: "River cutting through the woods" },
    { src: ps3, alt: "Sunlit clearing in the forest" },
    { src: ps4, alt: "Trail under the canopy" },
    { src: ps5, alt: "Campfire under the stars" },
    { src: ps6, alt: "Sunset over the treetops" },
  ];


return (
    <section className="bg-white py-20 sm:py-28" id="location">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-brandDark text-4xl font-black leading-tight tracking-[-0.033em]">
            The Venue
          </h2>
          <p className="text-brandDark/70 text-base leading-relaxed">
            Baghmundi is a sanctuary of natural splendor. The landscape is adorned with small hills and dense forests, creating a picturesque panorama that enchants visitors. The verdant forest cover is home to a diverse array of flora and fauna, offering a refreshing escape into nature’s lap. The soothing rustle of leaves and the melodious chirping of birds create a tranquil ambiance, perfect for those seeking peace and rejuvenation.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <p className="text-brandDark font-bold">Sonkupi Banjara camp , Bagmundi, Purulia , West Bengal</p>
            <a className="text-primary font-medium hover:underline" href="https://www.google.com/maps/dir//Sonkupi%20Banjara%20camp%20,%20Bagmundi%20Purulia">Get Directions</a>
          </div>
        </div>

        {/* CHANGE #2: rectangular aspect ratio (no more square) */}
        <div className="w-full overflow-hidden rounded-xl aspect-[4/3] md:aspect-[16/9]">
          <ImageSlider images={images} />
        </div>
      </div>
    </section>
  );
}

/* Slider (unchanged behavior) */
function ImageSlider({ images, interval = 4000, dragThreshold = 0.18 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deltaX, setDeltaX] = useState(0);
  const trackRef = useRef(null);
  const startXRef = useRef(0);

  const count = images.length;
  const clampIndex = (i) => (i % count + count) % count;

  useEffect(() => {
    if (paused || dragging || count <= 1) return;
    const t = setInterval(() => setIndex((i) => clampIndex(i + 1)), interval);
    return () => clearInterval(t);
  }, [paused, dragging, interval, count]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") setIndex((i) => clampIndex(i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => clampIndex(i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPointerDown = (e) => {
    setDragging(true);
    startXRef.current = e.clientX || e.touches?.[0]?.clientX || 0;
    setDeltaX(0);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const x = e.clientX || e.touches?.[0]?.clientX || 0;
    setDeltaX(x - startXRef.current);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    const width = trackRef.current?.clientWidth || 1;
    const moved = deltaX / width;
    if (moved > dragThreshold) setIndex((i) => clampIndex(i - 1));
    else if (moved < -dragThreshold) setIndex((i) => clampIndex(i + 1));
    setDragging(false);
    setDeltaX(0);
  };

  const goTo = (i) => setIndex(clampIndex(i));
  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const width = 100;
  const dragOffsetPct =
    (deltaX / Math.max(trackRef.current?.clientWidth || 1, 1)) * 100;

  return (
    <div
      className="group relative h-full w-full select-none"
      role="region"
      aria-label="Venue photos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchMove={onPointerMove}
      onTouchEnd={onPointerUp}
    >
      <div ref={trackRef} className="h-full w-full overflow-hidden">
        <ul
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(calc(${-index * width}% + ${dragging ? dragOffsetPct : 0}%))`,
          }}
        >
          {images.map((img, i) => (
            <li key={i} className="relative h-full w-full shrink-0 grow-0 basis-full">
              <img
                src={img.src}
                alt={img.alt || `Slide ${i + 1}`}
                className="h-full w-full object-cover"
                // CHANGE #1: removed grayscale/contrast filter → full color
                draggable={false}
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md bg-black/40 px-3 py-2 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-black/40 px-3 py-2 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
          >
            ›
          </button>

          {/* dots (still circular; shout if you want them rectangular too) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`pointer-events-auto h-2 w-2 rounded-full transition ${
                  i === index ? "scale-110 bg-white" : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}