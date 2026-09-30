import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import './CoverflowCarousel.css'

const CARD_PITCH = .98
const SETTLE_EASING = .075
const DRAG_INERTIA = .34

export default function CoverflowCarousel({ slides, label = '最近在听的专辑' }) {
  const frameRef = useRef(null)
  const cardsRef = useRef([])
  const positionRef = useRef(0)
  const targetRef = useRef(0)
  const widthRef = useRef(0)
  const animationRef = useRef(null)
  const dragRef = useRef(null)
  const wheelTimerRef = useRef(null)
  const [selected, setSelected] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const count = slides.length
  const indexAt = useCallback((position) => ((Math.round(position) % count) + count) % count, [count])

  const paint = useCallback(() => {
    if (!widthRef.current) return
    const pitch = widthRef.current * CARD_PITCH
    cardsRef.current.forEach((card, index) => {
      if (!card) return
      let offset = index - positionRef.current
      offset = ((offset % count) + count) % count
      if (offset > count / 2) offset -= count
      const distance = Math.abs(offset)
      const ramp = Math.pow(distance, .56)
      const tilt = Math.min(44 * ramp, 82) * Math.sign(offset)
      card.style.transform = `translateX(calc(-50% + ${offset * pitch}px)) translateZ(${-widthRef.current * .6 * ramp}px) rotateY(${-tilt}deg)`
      card.style.opacity = distance < count / 2 - .5 ? '1' : '0'
      card.style.zIndex = String(100 - Math.round(distance))
    })
  }, [count])

  const settle = useCallback((target) => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    targetRef.current = target
    setSelected(indexAt(target))
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) {
      positionRef.current = target
      paint()
      animationRef.current = null
      return
    }
    const step = () => {
      const remaining = target - positionRef.current
      if (Math.abs(remaining) < .00025) {
        positionRef.current = target
        paint()
        animationRef.current = null
        return
      }
      positionRef.current += remaining * SETTLE_EASING
      paint()
      animationRef.current = requestAnimationFrame(step)
    }
    animationRef.current = requestAnimationFrame(step)
  }, [indexAt, paint])

  const goTo = useCallback((index) => settle(index + Math.round((targetRef.current - index) / count) * count), [count, settle])
  const nudge = useCallback((by) => settle(Math.round(targetRef.current) + by), [settle])

  useEffect(() => {
    if (isPaused || count < 2) return undefined
    const timer = window.setTimeout(() => nudge(1), 6500)
    return () => window.clearTimeout(timer)
  }, [count, isPaused, nudge, selected])

  useLayoutEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const measure = () => {
      widthRef.current = cardsRef.current[0]?.offsetWidth || 0
      paint()
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [paint])

  useEffect(() => () => {
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    if (wheelTimerRef.current !== null) clearTimeout(wheelTimerRef.current)
  }, [])

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const onWheel = (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
      event.preventDefault()
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
      if (wheelTimerRef.current !== null) clearTimeout(wheelTimerRef.current)
      positionRef.current += event.deltaX / (widthRef.current * CARD_PITCH || 1)
      targetRef.current = positionRef.current
      setSelected(indexAt(positionRef.current))
      paint()
      wheelTimerRef.current = setTimeout(() => settle(Math.round(positionRef.current)), 110)
    }
    frame.addEventListener('wheel', onWheel, { passive: false })
    return () => frame.removeEventListener('wheel', onWheel)
  }, [indexAt, paint, settle])

  const onPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    if (animationRef.current !== null) cancelAnimationFrame(animationRef.current)
    if (wheelTimerRef.current !== null) clearTimeout(wheelTimerRef.current)
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: event.pointerId, x: event.clientX, position: positionRef.current, velocity: 0, time: performance.now() }
  }

  const onPointerMove = (event) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId || !widthRef.current) return
    const now = performance.now()
    const previous = positionRef.current
    positionRef.current = drag.position - (event.clientX - drag.x) / (widthRef.current * CARD_PITCH)
    drag.velocity = (positionRef.current - previous) / Math.max(now - drag.time, 1) * 1000
    drag.time = now
    setSelected(indexAt(positionRef.current))
    paint()
  }

  const endDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    dragRef.current = null
    settle(Math.round(positionRef.current + Math.max(-3.5, Math.min(3.5, drag.velocity * DRAG_INERTIA))))
  }

  return <div className="coverflow" role="region" aria-roledescription="carousel" aria-label={label}>
    <div className="coverflow-stage">
      <div ref={frameRef} className="coverflow-frame" tabIndex={0}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}
        onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); nudge(event.key === 'ArrowLeft' ? -1 : 1) } }}>
        <div className="coverflow-cards">
          {slides.map((slide, index) => <div key={slide.title} ref={(node) => { cardsRef.current[index] = node }} className="coverflow-card" role="group" aria-roledescription="slide" aria-label={`${index + 1} / ${count}: ${slide.title}`}>
            <img src={slide.src} alt={slide.alt} draggable={false} />
          </div>)}
        </div>
      </div>
      <button type="button" className="coverflow-prev" aria-label="上一张专辑" onClick={() => nudge(-1)}><ChevronLeft/></button>
      <button type="button" className="coverflow-next" aria-label="下一张专辑" onClick={() => nudge(1)}><ChevronRight/></button>
    </div>
    <div className="coverflow-caption" aria-live="polite"><strong>{slides[selected]?.title}</strong>{slides[selected]?.subtitle && <span>{slides[selected].subtitle}</span>}</div>
    <div className={`coverflow-controls${isPaused ? ' is-paused' : ''}`}>
      <div className="coverflow-pagination" aria-label="选择专辑">{slides.map((slide, index) => <button key={slide.title} type="button" aria-label={`查看 ${slide.title}`} aria-current={index === selected ? 'true' : undefined} onClick={() => goTo(index)} />)}</div>
      <button type="button" className="coverflow-playback" aria-label={isPaused ? '继续自动轮播' : '暂停自动轮播'} onClick={() => setIsPaused(paused => !paused)}>{isPaused ? <Play fill="currentColor"/> : <Pause fill="currentColor"/>}</button>
    </div>
  </div>
}
