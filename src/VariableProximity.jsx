import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react'
import { motion } from 'motion/react'
import './VariableProximity.css'

function useAnimationFrame(callback) {
  useEffect(() => {
    let frameId

    const loop = () => {
      callback()
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [callback])
}

function usePointerPositionRef(containerRef) {
  const positionRef = useRef({ x: null, y: null })

  useEffect(() => {
    const updatePosition = (clientX, clientY) => {
      if (!containerRef?.current) return
      const rect = containerRef.current.getBoundingClientRect()
      positionRef.current = { x: clientX - rect.left, y: clientY - rect.top }
    }

    const handlePointerMove = event => updatePosition(event.clientX, event.clientY)
    const handlePointerLeave = () => {
      positionRef.current = { x: null, y: null }
    }

    window.addEventListener('pointermove', handlePointerMove)
    document.documentElement.addEventListener('pointerleave', handlePointerLeave)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [containerRef])

  return positionRef
}

const VariableProximity = forwardRef(function VariableProximity({
  label = '',
  fromFontVariationSettings = "'wght' 400",
  toFontVariationSettings = "'wght' 800",
  containerRef,
  radius = 50,
  falloff = 'linear',
  className = '',
  style,
  ...restProps
}, ref) {
  const letterRefs = useRef([])
  const pointerPositionRef = usePointerPositionRef(containerRef)
  const lastPositionRef = useRef({ x: undefined, y: undefined })

  const parsedSettings = useMemo(() => {
    const parseSettings = settings => new Map(
      settings.split(',').map(setting => {
        const [name, value] = setting.trim().split(/\s+/)
        return [name.replace(/['"]/g, ''), Number.parseFloat(value)]
      })
    )
    const fromSettings = parseSettings(fromFontVariationSettings)
    const toSettings = parseSettings(toFontVariationSettings)

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue,
    }))
  }, [fromFontVariationSettings, toFontVariationSettings])

  const animateLetters = useCallback(() => {
    if (!containerRef?.current) return

    const { x, y } = pointerPositionRef.current
    if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) return
    lastPositionRef.current = { x, y }

    const containerRect = containerRef.current.getBoundingClientRect()
    letterRefs.current.forEach(letter => {
      if (!letter) return
      if (x === null || y === null) {
        letter.style.fontVariationSettings = fromFontVariationSettings
        return
      }

      const rect = letter.getBoundingClientRect()
      const letterX = rect.left + rect.width / 2 - containerRect.left
      const letterY = rect.top + rect.height / 2 - containerRect.top
      const distance = Math.hypot(x - letterX, y - letterY)
      const normalized = Math.min(Math.max(1 - distance / radius, 0), 1)
      const influence = falloff === 'exponential'
        ? normalized ** 2
        : falloff === 'gaussian'
          ? Math.exp(-((distance / (radius / 2)) ** 2) / 2)
          : normalized

      letter.style.fontVariationSettings = parsedSettings
        .map(({ axis, fromValue, toValue }) => `'${axis}' ${fromValue + (toValue - fromValue) * influence}`)
        .join(', ')
    })
  }, [containerRef, falloff, fromFontVariationSettings, parsedSettings, pointerPositionRef, radius])

  useAnimationFrame(animateLetters)

  return <span ref={ref} className={`${className} variable-proximity`} style={style} {...restProps}>
    {Array.from(label).map((letter, index) => <motion.span
      aria-hidden="true"
      className="variable-proximity-letter"
      key={`${letter}-${index}`}
      ref={element => { letterRefs.current[index] = element }}
      style={{ fontVariationSettings: fromFontVariationSettings }}
    >{letter}</motion.span>)}
    <span className="sr-only">{label}</span>
  </span>
})

export default VariableProximity
