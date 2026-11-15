'use client'

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { glideToSection, SCROLL_TARGET_KEY } from '@/lib/scroll'

const LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'faq', label: 'FAQ' },
]

/**
 * The header's section links.
 *
 * On the home page a click glides to the section, and a butter pill follows
 * the section in view (the system's "selected is butter" state, made visible).
 * From another page (About, Privacy, Terms) a click returns home and glides on
 * arrival, so the move is never a hard jump.
 */
export function SectionNav() {
  const pathname = usePathname()
  const router = useRouter()
  const onHome = pathname === '/'

  const [active, setActive] = useState<string | null>(null)
  // Kept after the section leaves the band, so the pill fades out in place and
  // slides from there to the next link; it never travels from the corner.
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null)

  const navRef = useRef<HTMLElement>(null)
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  // Scrollspy: the section crossing a thin band near the top third is "in view".
  useEffect(() => {
    if (!onHome) return
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    const inBand = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id)
          else inBand.delete(entry.target.id)
        }
        setActive(LINKS.find((l) => inBand.has(l.id))?.id ?? null)
      },
      { rootMargin: '-35% 0px -60% 0px' },
    )
    sections.forEach((el) => observer.observe(el))
    return () => {
      observer.disconnect()
      setActive(null)
    }
  }, [onHome])

  // Measure the active link so the pill can sit behind it.
  useLayoutEffect(() => {
    const nav = navRef.current
    const link = active ? linkRefs.current[active] : null
    if (!nav || !link) return
    const measure = () => setPill({ x: link.offsetLeft, w: link.offsetWidth })
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(nav)
    return () => observer.disconnect()
  }, [active])

  function onClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    if (onHome) {
      glideToSection(id)
      return
    }
    try {
      sessionStorage.setItem(SCROLL_TARGET_KEY, id)
    } catch {
      /* storage unavailable: the home page simply opens at the top */
    }
    router.push('/')
  }

  return (
    <nav ref={navRef} aria-label="Primary" className="relative hidden items-center gap-1 md:flex">
      {pill ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-primary-soft transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] starting:opacity-0 motion-reduce:transition-none"
          style={{
            transform: `translateX(${pill.x}px)`,
            width: pill.w,
            opacity: active ? 1 : 0,
          }}
        />
      ) : null}
      {LINKS.map((link) => (
        <a
          key={link.id}
          ref={(el) => {
            linkRefs.current[link.id] = el
          }}
          href={`/#${link.id}`}
          onClick={(event) => onClick(event, link.id)}
          aria-current={active === link.id ? 'location' : undefined}
          className={`relative rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
            active === link.id
              ? 'text-primary-text'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}
