import { useLayoutEffect, useRef } from 'react'

const commonSelectors = [
  '.story-header .story-no',
  '.story-header .mini',
  '.story-heading h3',
  '.story-heading > p',
]

const detailSelectors = {
  learning: [
    '.education-learning-metrics > div',
    '.course-records-head',
    '.course-table-head',
    '.course-row',
  ],
  research: [
    '.ai-research-band > .ai-block-kicker',
    '.ai-research-main h4',
    '.ai-research-tags',
    '.ai-research-band > p',
    '.ai-publication > .ai-block-kicker',
    '.ai-publication-title-row',
    '.ai-publication h5',
    '.ai-publication-meta',
    '.ai-publication > p',
    '.ai-paper-figure',
    '.ai-practice > .ai-block-kicker',
    '.ai-practice h4',
    '.ai-practice-role',
    '.ai-practice-lead',
    '.ai-practice-list > div',
  ],
  campus: ['.story-point', '.story-photo', '.story-note'],
  strengthTrend: [
    '.trend-heading h3',
    '.trend-heading > p',
    '.story-points > .story-point',
  ],
  socialMatrix: ['.platform-grid > .platform'],
  socialContent: ['.content-line-grid > .content-line-card'],
  socialViral: ['.viral-copy', '.viral-card-stage'],
  socialTrend: ['.trend-dashboard > .trend-card', '.trend-dashboard > .trend-stat-card'],
  socialAudience: [
    '.audience-grid > .interaction-card',
    '.audience-grid > .audience-portrait-card',
  ],
}

export default function useEducationReveal(type, enabled = true) {
  const storyRef = useRef(null)

  useLayoutEffect(() => {
    const story = storyRef.current
    if (!enabled || !story || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const elements = [...commonSelectors, ...detailSelectors[type]]
      .flatMap(selector => [...story.querySelectorAll(selector)])
    const targets = elements.map(element => {
      const computed = window.getComputedStyle(element)
      const target = { opacity: computed.opacity, filter: computed.filter, transform: computed.transform }
      element.style.opacity = '0'
      element.style.filter = 'blur(12px)'
      element.style.transform = 'translateY(10px)'
      return { element, target }
    })

    let animations = []
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      animations = targets.map(({ element, target }, index) => {
        const animation = element.animate([
          { opacity: 0, filter: 'blur(12px)', transform: 'translateY(10px)' },
          target,
        ], {
          duration: 620,
          delay: index < 3 ? 0 : index === 3 ? 90 : 170 + (index - 4) * (type === 'socialAudience' ? 160 : 65),
          easing: 'cubic-bezier(.22, 1, .36, 1)',
          fill: 'forwards',
        })
        animation.onfinish = () => {
          element.style.removeProperty('opacity')
          element.style.removeProperty('filter')
          element.style.removeProperty('transform')
          animation.cancel()
        }
        return animation
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -12% 0px' })
    observer.observe(story)

    return () => {
      observer.disconnect()
      animations.forEach(animation => animation.cancel())
      targets.forEach(({ element }) => {
        element.style.removeProperty('opacity')
        element.style.removeProperty('filter')
        element.style.removeProperty('transform')
      })
    }
  }, [type, enabled])

  return storyRef
}
