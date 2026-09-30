import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'

const springConfig = { damping: 20, stiffness: 150, mass: .5 }

export default function ZoomImage({
  src,
  alt,
  width,
  height,
  zoomScale = 3.5,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotion()
  const [isOpen, setIsOpen] = useState(false)
  const mouseX = useMotionValue(50)
  const mouseY = useMotionValue(50)
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)
  const transformOrigin = useTransform(
    [smoothMouseX, smoothMouseY],
    ([latestX, latestY]) => `${latestX}% ${latestY}%`,
  )

  const handleMouseMove = event => {
    if (prefersReducedMotion) return
    const { left, top, width: frameWidth, height: frameHeight } = event.currentTarget.getBoundingClientRect()
    mouseX.set(((event.clientX - left) / frameWidth) * 100)
    mouseY.set(((event.clientY - top) / frameHeight) * 100)
  }

  const handleMouseLeave = () => {
    mouseX.set(50)
    mouseY.set(50)
  }

  useEffect(() => {
    if (!isOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = event => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return <><motion.div
    className={`zoom-image ${className}`.trim()}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
  >
    <motion.img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      draggable="false"
      style={{ transformOrigin }}
      whileHover={prefersReducedMotion ? undefined : { scale: zoomScale }}
      transition={{ type: 'spring', duration: .5, bounce: 0 }}
    />
    <div className="interaction-hint zoom-hint" aria-hidden="true">
      <span>ZOOM</span>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m4 0h6m-3-3v6m11 8l-6-6" />
      </svg>
      <small>TO EXPLORE</small>
    </div>
    <button className="zoom-mobile-trigger" type="button" aria-label="放大查看论文图片" onClick={() => setIsOpen(true)} />
  </motion.div>
    {isOpen && createPortal(<div className="zoom-lightbox" role="dialog" aria-modal="true" aria-label="论文图片放大查看">
      <div className="zoom-lightbox-scroll"><img src={src} alt={alt} width={width} height={height} draggable="false" /></div>
      <button className="zoom-lightbox-close" type="button" autoFocus onClick={() => setIsOpen(false)} aria-label="关闭大图">关闭 ×</button>
    </div>, document.body)}
  </>
}
