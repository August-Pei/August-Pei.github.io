import { useSyncExternalStore } from 'react'

export const mouseHoverQuery = '(hover: hover) and (pointer: fine)'

const subscribe = callback => {
  const media = window.matchMedia(mouseHoverQuery)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export default function useCanHover() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(mouseHoverQuery).matches, () => false)
}
