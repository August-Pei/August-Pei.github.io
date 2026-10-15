import { useEffect, useState } from 'react'

export default function useFirstViewportEntry(targetRef) {
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false)

  useEffect(() => {
    const target = targetRef.current
    if (!target || hasEnteredViewport) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.1) return
      setHasEnteredViewport(true)
      observer.disconnect()
    }, { threshold: 0.1 })

    observer.observe(target)
    return () => observer.disconnect()
  }, [targetRef, hasEnteredViewport])

  return hasEnteredViewport
}
