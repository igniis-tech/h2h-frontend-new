import { useEffect, useState } from 'react'
import clsx from 'clsx'

export default function FlipWords({
  words = [],
  interval = 2600,
  className,
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!words?.length) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % words.length)
    }, interval)
    return () => clearInterval(id)
  }, [words, interval])

  const current = words[index] || ''

  return (
    <span
      className={clsx(
        'inline-block align-middle [transform-style:preserve-3d]',
        className
      )}
      style={{ perspective: '800px' }}
    >
      <span key={index} className="inline-block motion-safe:animate-flip-in">
        {current}
      </span>
    </span>
  )
}
