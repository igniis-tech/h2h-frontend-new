import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

export default function TiltCard({
  children,
  className,
  maxTilt = 12,
  scale = 1.02,
  glare = true,
  disableOnTouch = true,
}) {
  const ref = useRef(null)
  const rafRef = useRef(null)
  const [enabled, setEnabled] = useState(true)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    setEnabled(!prefersReduced && (disableOnTouch ? finePointer : true))
  }, [disableOnTouch])

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

  const setTransform = (rx, ry, s) => {
    const el = ref.current
    if (!el) return
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`
  }

  const onMove = (e) => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const ry = (px - 0.5) * (maxTilt * 2)
    const rx = (0.5 - py) * (maxTilt * 2)
    if (glare) {
      el.style.setProperty('--mx', `${px * 100}%`)
      el.style.setProperty('--my', `${py * 100}%`)
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => setTransform(rx.toFixed(2), ry.toFixed(2), scale))
  }

  const onEnter = () => {
    if (!enabled) return
    setHover(true)
  }
  const onLeave = () => {
    setHover(false)
    if (!ref.current) return
    ref.current.style.transition = 'transform 180ms ease'
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => setTransform(0, 0, 1))
    setTimeout(() => {
      if (ref.current) ref.current.style.transition = ''
    }, 200)
  }

  return (
    <div
      ref={ref}
      className={clsx('tilt-card group', hover && 'tilt-hover', className)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
    >
      {children}
      {glare && <div className="tilt-glare" />}
    </div>
  )
}
