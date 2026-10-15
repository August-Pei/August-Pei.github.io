import { useLayoutEffect, useRef } from 'react'

export default function SkillTags({ items }) {
  const tagsRef = useRef(null)
  const split = Math.ceil(items.length / 2)
  const rows = [items.slice(0, split), items.slice(split)]

  useLayoutEffect(() => {
    const tags = tagsRef.current
    if (!tags) return
    const rowElements = [...tags.querySelectorAll('.skill-tag-row')]
    const mobile = window.matchMedia('(max-width: 700px)')
    let disposed = false
    let lastWidth = -1
    const fit = () => {
      if (disposed) return
      lastWidth = tags.clientWidth
      tags.style.removeProperty('--skill-tag-fit')
      if (!mobile.matches || lastWidth <= 0) return

      // Measure full-size rows, then scale typography and spacing together.
      // Borders stay at 1px, so exclude them from the scalable width.
      const available = Math.max(0, lastWidth - 1)
      const scale = Math.min(1, ...rowElements.map(row => {
        const borders = row.children.length * 2
        const naturalWidth = row.getBoundingClientRect().width
        return naturalWidth > borders
          ? Math.max(0, available - borders) / (naturalWidth - borders)
          : 1
      }))
      tags.style.setProperty('--skill-tag-fit', String(scale))
    }
    fit()
    const observer = new ResizeObserver(() => {
      // Font/padding changes also affect height; only width changes need a refit.
      if (tags.clientWidth !== lastWidth) fit()
    })
    observer.observe(tags)
    mobile.addEventListener('change', fit)
    document.fonts?.ready.then(fit)
    document.fonts?.addEventListener('loadingdone', fit)
    return () => {
      disposed = true
      observer.disconnect()
      mobile.removeEventListener('change', fit)
      document.fonts?.removeEventListener('loadingdone', fit)
    }
  }, [items])

  return <div className="skill-tags" ref={tagsRef}>
    {rows.map((row, index) => <span className="skill-tag-row" key={index}>
      {row.map(item => <b key={item}>{item}</b>)}
    </span>)}
  </div>
}
