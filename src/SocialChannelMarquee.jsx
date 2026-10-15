import { useLayoutEffect, useRef } from 'react'

export default function SocialChannelMarquee({ count, children }) {
  const trackRef = useRef(null)
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const first = track.children[0]
      const duplicate = track.children[count]
      if (first && duplicate) {
        track.style.setProperty('--social-channel-cycle', `${duplicate.offsetLeft - first.offsetLeft}px`)
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [count])

  const onPointerDown = event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return
    suppressClickRef.current = false
    const track = trackRef.current
    const animation = track?.getAnimations().find(item => item.animationName === 'socialChannelScroll')
    const duration = animation?.effect?.getTiming().duration
    const first = track?.children[0]
    const duplicate = track?.children[count]
    const cycle = first && duplicate ? duplicate.offsetLeft - first.offsetLeft : 0
    if (!animation || typeof duration !== 'number' || !duration || cycle <= 0) return

    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: Number(animation.currentTime) || 0,
      animation,
      duration,
      cycle,
      moved: false,
    }
    event.currentTarget.classList.add('is-interacting')
  }

  const endDrag = event => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    dragRef.current = null
    event.currentTarget.classList.remove('is-interacting', 'is-dragging')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onPointerMove = event => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (!drag.moved) {
      // Let vertical gestures scroll the page; capture only a horizontal drag.
      if (Math.abs(dy) > 6 && Math.abs(dy) >= Math.abs(dx)) {
        endDrag(event)
        return
      }
      if (Math.abs(dx) <= 6) return
      drag.moved = true
      suppressClickRef.current = true
      event.currentTarget.classList.add('is-dragging')
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    event.preventDefault()
    const time = drag.time - dx / drag.cycle * drag.duration
    drag.animation.currentTime = ((time % drag.duration) + drag.duration) % drag.duration
  }

  return <div
    className="social-channel-marquee"
    aria-label="August 的社交媒体账号，可左右拖动"
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={endDrag}
    onPointerCancel={endDrag}
    onPointerLeave={event => {
      if (dragRef.current && !dragRef.current.moved) endDrag(event)
    }}
    onLostPointerCapture={event => {
      if (event.target === event.currentTarget) endDrag(event)
    }}
    onDragStart={event => event.preventDefault()}
    onClickCapture={event => {
      if (!suppressClickRef.current || event.detail === 0) return
      event.preventDefault()
      event.stopPropagation()
      suppressClickRef.current = false
    }}
  >
    <div className="social-channel-track" ref={trackRef}>{children}</div>
  </div>
}
