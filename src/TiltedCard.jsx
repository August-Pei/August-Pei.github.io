import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import './TiltedCard.css'

const cardSpring = {
  damping: 30,
  stiffness: 100,
  mass: 2,
}

export default function TiltedCard({
  imageSrc,
  altText = 'Tilted card image',
  captionText = '',
  children = null,
  className = '',
  rotateAmplitude = 9,
  scaleOnHover = 1.1,
  showTooltip = true,
  imageLoading = 'lazy',
}) {
  const cardRef = useRef(null)
  const lastY = useRef(0)
  const tooltipX = useMotionValue(0)
  const tooltipY = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), cardSpring)
  const rotateY = useSpring(useMotionValue(0), cardSpring)
  const scale = useSpring(1, cardSpring)
  const tooltipOpacity = useSpring(0, { stiffness: 260, damping: 28 })
  const tooltipRotate = useSpring(0, { stiffness: 350, damping: 30, mass: 1 })

  const handleMouseMove = event => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - rect.width / 2
    const offsetY = event.clientY - rect.top - rect.height / 2

    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude)
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude)
    tooltipX.set(event.clientX - rect.left)
    tooltipY.set(event.clientY - rect.top)
    tooltipRotate.set(-(offsetY - lastY.current) * .45)
    lastY.current = offsetY
  }

  const handleMouseEnter = () => {
    scale.set(scaleOnHover)
    tooltipOpacity.set(1)
  }

  const handleMouseLeave = () => {
    tooltipOpacity.set(0)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    tooltipRotate.set(0)
    lastY.current = 0
  }

  return <figure
    ref={cardRef}
    className={`tilted-card-figure ${className}`.trim()}
    onMouseMove={handleMouseMove}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  >
    <motion.div className="tilted-card-inner" style={{ rotateX, rotateY, scale }}>
      {children ?? <img src={imageSrc} alt={altText} className="tilted-card-img" width="700" height="700" loading={imageLoading} draggable="false" />}
    </motion.div>
    {showTooltip && <motion.figcaption
      className="tilted-card-caption"
      style={{ x: tooltipX, y: tooltipY, opacity: tooltipOpacity, rotate: tooltipRotate }}
    >
      {captionText}
    </motion.figcaption>}
  </figure>
}
