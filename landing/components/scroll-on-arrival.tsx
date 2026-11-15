'use client'

import { useEffect } from 'react'
import { glideToSection, SCROLL_TARGET_KEY } from '@/lib/scroll'

/**
 * Finishes a section link clicked on another page: the nav stores the target
 * and returns home, and this glides to it once the page has painted.
 *
 * The stored target is cleared only when the glide actually starts. React runs
 * effects twice in development, cancelling the first frame; consuming the key
 * up front would leave the second run with nothing to do.
 */
export function ScrollOnArrival() {
  useEffect(() => {
    let id: string | null = null
    try {
      id = sessionStorage.getItem(SCROLL_TARGET_KEY)
    } catch {
      return
    }
    if (!id) return
    const target = id

    // Two frames: let the page paint at the top first, so the glide is visible.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        try {
          sessionStorage.removeItem(SCROLL_TARGET_KEY)
        } catch {
          /* nothing to clear */
        }
        glideToSection(target)
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  return null
}
