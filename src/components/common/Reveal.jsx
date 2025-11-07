import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'

export default function Reveal({
  as: Tag = 'div',
  children,
  className,
  variant = 'fade-up',
  delay = 0,
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
  ...rest
}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (once) io.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin, once])

  const variants = {
    'fade-up': 'motion-safe:animate-fade-up',
    'fade-in': 'motion-safe:animate-fade-in',
    'blur-in': 'motion-safe:animate-blur-in',
  }

  return (
    <Tag
      ref={ref}
      className={clsx(
        'will-change-transform',
        'motion-safe:opacity-0',
        inView && variants[variant],
        className
      )}
      style={{ animationDelay: delay ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
