/**
 * Anchor-link motion.
 *
 * The nav's section links glide rather than jump. The glide is driven here
 * (not by CSS `scroll-behavior`) so its duration scales with distance, it
 * decelerates with an exponential ease-out, and any user input stops it
 * instantly. Under `prefers-reduced-motion` it jumps with no travel.
 *
 * Every arrival moves keyboard focus to the section, so the destination is
 * announced and the next Tab continues from there.
 */

/** sessionStorage key: a link clicked on another page asks the home page to glide on arrival. */
export const SCROLL_TARGET_KEY = 'reqstudio-scroll-target'

const MIN_MS = 450
const MAX_MS = 900
const MS_PER_PX = 0.35

/** Exponential ease-out: confident arrival, no overshoot. */
const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p))

let stopCurrent: (() => void) | null = null

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function jump(top: number) {
  window.scrollTo({ top, behavior: 'instant' as ScrollBehavior })
}

/** Scrolls to `#id`, honouring the section's `scroll-margin-top` (the sticky header). */
export function glideToSection(id: string): boolean {
  const el = document.getElementById(id)
  if (!el) return false

  stopCurrent?.()

  const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  const start = window.scrollY
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight
  const target = Math.min(maxScroll, Math.max(0, el.getBoundingClientRect().top + start - offset))
  const distance = Math.abs(target - start)

  const arrive = () => {
    el.focus({ preventScroll: true })
    if (window.location.hash !== `#${id}`) history.pushState(null, '', `#${id}`)
  }

  if (reducedMotion() || distance < 2) {
    jump(target)
    arrive()
    return true
  }

  const duration = Math.min(MAX_MS, Math.max(MIN_MS, distance * MS_PER_PX))
  const t0 = performance.now()
  let frame = 0

  // Wheel, touch, a key press or a mouse-down (the scrollbar) hands control back.
  const interrupts = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const
  const stop = () => {
    cancelAnimationFrame(frame)
    interrupts.forEach((type) => window.removeEventListener(type, stop))
    stopCurrent = null
  }
  interrupts.forEach((type) => window.addEventListener(type, stop, { passive: true }))
  stopCurrent = stop

  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / duration)
    jump(start + (target - start) * easeOutExpo(p))
    if (p < 1) {
      frame = requestAnimationFrame(tick)
    } else {
      stop()
      jump(target)
      arrive()
    }
  }
  frame = requestAnimationFrame(tick)
  return true
}
