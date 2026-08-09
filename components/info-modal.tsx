'use client'

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

export interface InfoModalProps {
  label: string
  title: string
  subtitle?: string
  /** App/site mark shown in a bordered box to the left of the title. */
  icon?: ReactNode
  /** Version pill rendered under the subtitle, e.g. "v0.1.0". */
  badge?: string
  children: ReactNode
}

/**
 * Footer document viewer.
 *
 * Built on the native <dialog> element rather than a library: `showModal()`
 * gives a real focus trap, Escape handling, background inertness and a
 * `::backdrop` for free, which keeps a marketing page free of a dialog
 * dependency it would otherwise carry for three static documents.
 */
export function InfoModal({ label, title, subtitle, icon, badge, children }: InfoModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const titleId = useId()

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // showModal() makes the page inert but does not stop it scrolling behind.
  useEffect(() => {
    if (!open) return
    const { style } = document.documentElement
    const previous = style.overflow
    style.overflow = 'hidden'
    return () => {
      style.overflow = previous
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => {
          dialogRef.current?.showModal()
          setOpen(true)
        }}
        className="rounded text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // A click on the dialog element itself is a click on the backdrop —
          // the content sits inside a child element.
          if (event.target === dialogRef.current) close()
        }}
        className="m-auto w-[calc(100vw-2rem)] max-w-2xl rounded-2xl border border-border bg-card p-0 text-foreground shadow-xl backdrop:bg-foreground/40 backdrop:backdrop-blur-[2px] "
      >
        <div className="flex max-h-[min(80vh,44rem)] flex-col">
          <header className="flex items-start gap-4 border-b border-border px-6 py-4">
            {icon ? <div className="shrink-0">{icon}</div> : null}
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="text-base font-semibold tracking-tight">
                {title}
              </h2>
              {subtitle ? (
                <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
              ) : null}
              {badge ? (
                <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary-text">
                  {badge}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={`Close ${title}`}
              className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </header>

          <div className="overflow-y-auto px-6 py-5 text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </dialog>
    </>
  )
}

/** Section heading inside a document. */
export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

export function DocList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
