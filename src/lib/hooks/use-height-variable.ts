import { useCallback, useEffect, useRef } from 'react'

/**
 * Publishes an element's height as a CSS custom property on itself.
 *
 * Sticky panels inside a scroll region need to cap their height to that region,
 * which no static value can express once a header above it can wrap. Measuring
 * the region and exposing the variable lets descendants size against the real
 * scrollport without hard-coded offsets.
 *
 * Returns a *callback ref* rather than an object ref: the node it measures is
 * mounted conditionally (a route renders a loading state first), and an effect
 * keyed on the variable name alone would run once against a null ref and never
 * re-run once the real element appeared.
 */
export function useHeightVariable(cssVar: string) {
  const observerRef = useRef<ResizeObserver | null>(null)

  const setNode = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (!node) return

      const apply = () => node.style.setProperty(cssVar, `${node.clientHeight}px`)
      apply()

      const observer = new ResizeObserver(apply)
      observer.observe(node)
      observerRef.current = observer
    },
    [cssVar],
  )

  useEffect(() => () => observerRef.current?.disconnect(), [])

  return setNode
}
