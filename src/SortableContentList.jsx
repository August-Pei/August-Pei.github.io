import React, { useEffect, useRef, useState } from 'react'
import { GripVertical } from 'lucide-react'

export default function SortableContentList({ items, disabled, onReorder, renderItem, empty }) {
  const listRef = useRef(null)
  const dragRef = useRef(null)
  const frameRef = useRef(null)
  const [drag, setDrag] = useState(null)
  const [announcement, setAnnouncement] = useState('')

  const cancel = () => {
    cancelAnimationFrame(frameRef.current)
    dragRef.current = null
    setDrag(null)
  }

  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') cancel() }
    window.addEventListener('keydown', escape)
    window.addEventListener('blur', cancel)
    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('keydown', escape)
      window.removeEventListener('blur', cancel)
    }
  }, [])

  useEffect(() => { cancel() }, [items, disabled])

  const locate = current => {
    const bounds = listRef.current.getBoundingClientRect()
    let target = null
    if (current.x >= bounds.left && current.x <= bounds.right) {
      const rows = [...listRef.current.querySelectorAll('[data-sort-id]')]
        .filter(row => row.dataset.sortId !== current.id)
      for (const row of rows) {
        const rect = row.getBoundingClientRect()
        if (current.y < rect.top + rect.height / 2) {
          target = { id: row.dataset.sortId, side: 'before' }
          break
        }
      }
      if (!target && rows.length) target = { id: rows.at(-1).dataset.sortId, side: 'after' }
    }
    const next = { ...current, target }
    dragRef.current = next
    setDrag(next)
  }

  const tick = () => {
    const current = dragRef.current
    if (!current?.active) return
    const edge = 80
    const speed = current.y < edge ? -Math.min(1, (edge - current.y) / edge)
      : current.y > window.innerHeight - edge ? Math.min(1, (current.y - window.innerHeight + edge) / edge) : 0
    if (speed) window.scrollBy({ top: speed * 14, behavior: 'instant' })
    locate(current)
    frameRef.current = requestAnimationFrame(tick)
  }

  const start = (event, item) => {
    if (disabled || !event.isPrimary || event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: item.id, title: item.title, pointerId: event.pointerId,
      startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, active: false, target: null }
  }

  const move = event => {
    const current = dragRef.current
    if (!current || current.pointerId !== event.pointerId) return
    const next = { ...current, x: event.clientX, y: event.clientY }
    if (!current.active && Math.hypot(next.x - next.startX, next.y - next.startY) < 5) return
    next.active = true
    locate(next)
    if (!current.active) frameRef.current = requestAnimationFrame(tick)
  }

  const finish = event => {
    const current = dragRef.current
    if (!current || current.pointerId !== event.pointerId) return
    if (current.active) {
      locate({ ...current, x: event.clientX, y: event.clientY })
      const target = dragRef.current.target
      if (target) {
        onReorder(current.id, target.id, target.side)
        setAnnouncement(`已调整「${current.title}」的位置，请保存内容。`)
      }
    }
    cancel()
  }

  return <section ref={listRef} className={`admin-panel content-list${drag?.active ? ' is-sorting' : ''}`}>
    {items.length ? items.map(item => <article key={item.id} data-sort-id={item.id}
      className={`content-row${drag?.active && drag.id === item.id ? ' is-dragging' : ''}${drag?.target?.id === item.id ? ` insert-${drag.target.side}` : ''}`}>
      <button type="button" className="icon-button sort-handle" disabled={disabled || items.length < 2}
        aria-label={`拖动排序 ${item.title}`} title="按住拖动排序，也可使用右侧上下箭头"
        onPointerDown={event => start(event, item)} onPointerMove={move} onPointerUp={finish}
        onPointerCancel={cancel} onLostPointerCapture={cancel}>
        <GripVertical size={19}/>
      </button>
      {renderItem(item)}
    </article>) : <div className="empty">{empty}</div>}
    {drag?.active && <div className="sort-preview" aria-hidden="true"
      style={{ left: drag.x + 16, top: drag.y + 16 }}><GripVertical size={18}/>{drag.title}</div>}
    <span className="sort-announcement" role="status">{announcement}</span>
  </section>
}
