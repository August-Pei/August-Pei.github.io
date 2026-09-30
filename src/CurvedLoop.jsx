import { useEffect, useId, useMemo, useRef, useState } from 'react'
import './CurvedLoop.css'

export default function CurvedLoop({
  marqueeText = '',
  speed = 2,
  className,
  curveAmount = 400,
  direction = 'left',
  interactive = true,
}) {
  const text = useMemo(() => marqueeText.replace(/\s+$/, '') + '\u00a0', [marqueeText])
  const measureRef = useRef(null)
  const textPathRef = useRef(null)
  const dragRef = useRef(false)
  const lastXRef = useRef(0)
  const directionRef = useRef(direction)
  const velocityRef = useRef(0)
  const jacketRef = useRef(null)
  const [spacing, setSpacing] = useState(0)
  const [width, setWidth] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const pathId = `curve-${useId()}`
  const height = Math.min(180, Math.max(115, width * 0.12))
  const curveBottom = Math.min(height - 20, 25 + curveAmount / 2)
  const pathD = `M-100,25 Q${width / 2},${2 * curveBottom - 25} ${width + 100},25`
  const totalText = spacing ? text.repeat(Math.ceil((width + 200) / spacing) + 2) : text

  useEffect(() => {
    if (!jacketRef.current) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(jacketRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const measure = () => {
      if (measureRef.current) setSpacing(measureRef.current.getComputedTextLength())
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [text, className])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!spacing || !textPathRef.current) return
    textPathRef.current.setAttribute('startOffset', `-${spacing}px`)
    if (reducedMotion) return

    let frame
    const step = () => {
      if (!dragRef.current && textPathRef.current) {
        const current = parseFloat(textPathRef.current.getAttribute('startOffset') || '0')
        let next = current + (directionRef.current === 'right' ? speed : -speed)
        if (next <= -spacing) next += spacing
        if (next > 0) next -= spacing
        textPathRef.current.setAttribute('startOffset', `${next}px`)
      }
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [spacing, speed, reducedMotion])

  const onPointerDown = event => {
    if (!interactive || reducedMotion) return
    dragRef.current = true
    lastXRef.current = event.clientX
    velocityRef.current = 0
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = event => {
    if (!dragRef.current || !textPathRef.current) return
    const dx = event.clientX - lastXRef.current
    lastXRef.current = event.clientX
    velocityRef.current = dx
    const current = parseFloat(textPathRef.current.getAttribute('startOffset') || '0')
    let next = current + dx
    if (next <= -spacing) next += spacing
    if (next > 0) next -= spacing
    textPathRef.current.setAttribute('startOffset', `${next}px`)
  }

  const endDrag = () => {
    if (!dragRef.current) return
    dragRef.current = false
    if (velocityRef.current) directionRef.current = velocityRef.current > 0 ? 'right' : 'left'
  }

  return (
    <div
      ref={jacketRef}
      className="curved-loop-jacket"
      style={{ cursor: interactive && !reducedMotion ? 'grab' : 'auto' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
    >
      <svg className="curved-loop-svg" viewBox={`0 0 ${width || 1440} ${height}`} style={{ height }} role="img" aria-label={marqueeText.trim()}>
        <text ref={measureRef} xmlSpace="preserve" style={{ visibility: 'hidden', pointerEvents: 'none' }}>{text}</text>
        <defs><path id={pathId} d={pathD} fill="none" /></defs>
        {spacing > 0 && (
          <text className={className} xmlSpace="preserve">
            <textPath ref={textPathRef} href={`#${pathId}`} startOffset={`-${spacing}px`}>
              {totalText}
            </textPath>
          </text>
        )}
      </svg>
    </div>
  )
}
