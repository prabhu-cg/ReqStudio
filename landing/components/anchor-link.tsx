'use client'

import type { MouseEvent, ReactNode } from 'react'
import { glideToSection } from '@/lib/scroll'

/** An in-page link to `#id` that glides instead of jumping. Modified clicks keep their default. */
export function AnchorLink({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: ReactNode
}) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (glideToSection(id)) event.preventDefault()
  }

  return (
    <a href={`#${id}`} onClick={onClick} className={className}>
      {children}
    </a>
  )
}
