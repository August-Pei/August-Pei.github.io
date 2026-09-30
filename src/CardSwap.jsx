import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import gsap from 'gsap'
import './CardSwap.css'

export const Card = forwardRef(({ customClass, ...rest }, ref) => (
  <article
    ref={ref}
    {...rest}
    className={`swap-card ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
  />
))

Card.displayName = 'Card'

const makeSlot = (index, distanceX, distanceY, total) => ({
  x: index * distanceX,
  y: -index * distanceY,
  z: -index * distanceX * 1.5,
  zIndex: total - index,
})

const placeNow = (element, slot, skew) => gsap.set(element, {
  x: slot.x,
  y: slot.y,
  z: slot.z,
  xPercent: -50,
  yPercent: -50,
  skewY: skew,
  transformOrigin: 'center center',
  zIndex: slot.zIndex,
  force3D: true,
})

const CardSwap = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  controlsRef,
  onCardClick,
  onActiveChange,
  skewAmount = 6,
  easing = 'elastic',
  children,
}) => {
  const config = easing === 'elastic'
    ? {
        ease: 'elastic.out(0.6,0.9)',
        durDrop: 2,
        durMove: 2,
        durReturn: 2,
        promoteOverlap: 0.9,
        returnDelay: 0.05,
      }
    : {
        ease: 'power1.inOut',
        durDrop: 0.8,
        durMove: 0.8,
        durReturn: 0.8,
        promoteOverlap: 0.45,
        returnDelay: 0.2,
      }

  const childArr = useMemo(() => Children.toArray(children), [children])
  const refs = useMemo(
    () => childArr.map(() => React.createRef()),
    // The refs only need to change if the number of cards changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [childArr.length],
  )
  const order = useRef(Array.from({ length: childArr.length }, (_, index) => index))
  const timelineRef = useRef(null)
  const intervalRef = useRef()
  const autoPausedRef = useRef(false)
  const container = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const total = refs.length
    order.current = Array.from({ length: total }, (_, index) => index)
    refs.forEach((ref, index) => placeNow(
      ref.current,
      makeSlot(index, cardDistance, verticalDistance, total),
      skewAmount,
    ))
    setActiveIndex(0)
    onActiveChange?.(0)

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const swap = (direction = 1) => {
      if (total < 2) return
      timelineRef.current?.progress(1)
      timelineRef.current?.kill()
      timelineRef.current = null

      if (reducedMotion) {
        order.current = direction > 0
          ? [...order.current.slice(1), order.current[0]]
          : [order.current[total - 1], ...order.current.slice(0, -1)]
        refs.forEach((cardRef, index) => placeNow(
          cardRef.current,
          makeSlot(order.current.indexOf(index), cardDistance, verticalDistance, total),
          skewAmount,
        ))
        setActiveIndex(order.current[0])
        onActiveChange?.(order.current[0])
        return
      }

      if (direction < 0) {
        const previous = order.current[total - 1]
        const rest = order.current.slice(0, -1)
        const previousElement = refs[previous].current
        const timeline = gsap.timeline()
        timelineRef.current = timeline
        timeline.set(previousElement, { y: '+=500', zIndex: total + 1 })
        timeline.call(() => {
          setActiveIndex(previous)
          onActiveChange?.(previous)
        })
        rest.forEach((index, slotIndex) => {
          const slot = makeSlot(slotIndex + 1, cardDistance, verticalDistance, total)
          timeline.set(refs[index].current, { zIndex: slot.zIndex }, 0)
          timeline.to(refs[index].current, {
            x: slot.x, y: slot.y, z: slot.z,
            duration: config.durMove, ease: config.ease,
          }, slotIndex * 0.15)
        })
        const frontSlot = makeSlot(0, cardDistance, verticalDistance, total)
        timeline.to(previousElement, {
          x: frontSlot.x, y: frontSlot.y, z: frontSlot.z,
          duration: config.durReturn, ease: config.ease,
        }, 0)
        timeline.call(() => { order.current = [previous, ...rest] })
        return
      }

      const [front, ...rest] = order.current
      const frontElement = refs[front].current
      const timeline = gsap.timeline()
      timelineRef.current = timeline

      timeline.to(frontElement, {
        y: '+=500',
        duration: config.durDrop,
        ease: config.ease,
      })

      timeline.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`)
      timeline.call(() => {
        setActiveIndex(rest[0])
        onActiveChange?.(rest[0])
      }, undefined, 'promote')

      rest.forEach((index, slotIndex) => {
        const element = refs[index].current
        const slot = makeSlot(slotIndex, cardDistance, verticalDistance, total)
        timeline.set(element, { zIndex: slot.zIndex }, 'promote')
        timeline.to(element, {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          duration: config.durMove,
          ease: config.ease,
        }, `promote+=${slotIndex * 0.15}`)
      })

      const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total)
      timeline.addLabel('return', `promote+=${config.durMove * config.returnDelay}`)
      timeline.call(() => gsap.set(frontElement, { zIndex: backSlot.zIndex }), undefined, 'return')
      timeline.to(frontElement, {
        x: backSlot.x,
        y: backSlot.y,
        z: backSlot.z,
        duration: config.durReturn,
        ease: config.ease,
      }, 'return')
      timeline.call(() => {
        order.current = [...rest, front]
      })
    }

    const select = targetIndex => {
      if (targetIndex < 0 || targetIndex >= total) return
      timelineRef.current?.progress(1)
      timelineRef.current?.kill()
      timelineRef.current = null

      const targetPosition = order.current.indexOf(targetIndex)
      if (targetPosition <= 0) return
      const nextOrder = [
        ...order.current.slice(targetPosition),
        ...order.current.slice(0, targetPosition),
      ]

      if (reducedMotion) {
        order.current = nextOrder
        refs.forEach((cardRef, index) => placeNow(
          cardRef.current,
          makeSlot(order.current.indexOf(index), cardDistance, verticalDistance, total),
          skewAmount,
        ))
        setActiveIndex(targetIndex)
        onActiveChange?.(targetIndex)
        return
      }

      const timeline = gsap.timeline()
      timelineRef.current = timeline
      timeline.set(refs[targetIndex].current, { zIndex: total + 1 })
      nextOrder.forEach((index, slotIndex) => {
        const slot = makeSlot(slotIndex, cardDistance, verticalDistance, total)
        timeline.to(refs[index].current, {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          zIndex: slot.zIndex,
          duration: config.durMove,
          ease: config.ease,
        }, slotIndex * 0.08)
      })
      timeline.call(() => {
        order.current = nextOrder
        setActiveIndex(targetIndex)
        onActiveChange?.(targetIndex)
      }, undefined, 0)
    }

    const startTimer = () => {
      window.clearInterval(intervalRef.current)
      if (!reducedMotion && !autoPausedRef.current && total > 1) {
        intervalRef.current = window.setInterval(() => swap(1), delay)
      }
    }

    const node = container.current
    const pause = () => {
      timelineRef.current?.pause()
      window.clearInterval(intervalRef.current)
    }
    const resume = () => {
      timelineRef.current?.play()
      window.clearInterval(intervalRef.current)
      startTimer()
    }

    if (controlsRef) controlsRef.current = {
      previous: () => { swap(-1); startTimer() },
      next: () => { swap(1); startTimer() },
      select: index => { select(index); startTimer() },
      setPaused: paused => {
        autoPausedRef.current = paused
        if (paused) window.clearInterval(intervalRef.current)
        else startTimer()
      },
    }
    startTimer()

    if (pauseOnHover) {
      node.addEventListener('mouseenter', pause)
      node.addEventListener('mouseleave', resume)
    }

    return () => {
      if (pauseOnHover) {
        node.removeEventListener('mouseenter', pause)
        node.removeEventListener('mouseleave', resume)
      }
      window.clearInterval(intervalRef.current)
      timelineRef.current?.kill()
      if (controlsRef) controlsRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, refs.length])

  const rendered = childArr.map((child, index) => isValidElement(child)
    ? cloneElement(child, {
        key: index,
        ref: refs[index],
        'aria-hidden': activeIndex !== index,
        style: { width, height, ...(child.props.style ?? {}) },
        onClick: event => {
          child.props.onClick?.(event)
          onCardClick?.(index)
        },
      })
    : child)

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  )
}

export default CardSwap
