import { useEffect, useRef, useState, type RefObject, type TouchEvent } from 'react'

/** Id of the section currently in the middle of the viewport (for active nav state). */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  const key = ids.join(',')
  useEffect(() => {
    const els = key.split(',').map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const top = () => { if (window.scrollY < 200) setActive('') }
    window.addEventListener('scroll', top, { passive: true })
    return () => { io.disconnect(); window.removeEventListener('scroll', top) }
  }, [key])
  return active
}

/** Mobile menu: lock page scroll, close on Esc (focus back to the toggle) and when resizing to desktop. */
export function useMenu(open: boolean, close: () => void, toggleRef?: RefObject<HTMLElement | null>, desktop = 1024) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); toggleRef?.current?.focus() }
    }
    const onResize = () => { if (window.innerWidth >= desktop) close() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open, close, toggleRef, desktop])
}

/** Marks <html> while a dialog is open so floating buttons can step aside. */
export function useDialogFlag() {
  useEffect(() => {
    document.documentElement.classList.add('has-dialog')
    return () => document.documentElement.classList.remove('has-dialog')
  }, [])
}

/** Horizontal swipe on touch devices (lightbox / sheet navigation). */
export function useSwipe(onSwipe: (dir: 1 | -1) => void) {
  const p = useRef({ x: 0, y: 0 })
  return {
    onTouchStart: (e: TouchEvent) => { p.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } },
    onTouchEnd: (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - p.current.x, dy = e.changedTouches[0].clientY - p.current.y
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) onSwipe(dx < 0 ? 1 : -1)
    },
  }
}
