import type { DocumentSection } from '@/types/document'
import { cn } from '@/lib/utils/cn'

/**
 * The sticky contents rail.
 *
 * Mirrors the printed table of contents but stays on screen, dims sections
 * filtered out by the search box, and carries each section's completeness.
 */
export function PreviewOutline({
  sections,
  visible,
  activeId,
  onSelect,
}: {
  sections: DocumentSection[]
  visible: ReadonlySet<string>
  activeId: string | null
  onSelect: (sectionId: string) => void
}) {
  return (
    <nav aria-label="Document contents">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Contents
      </h2>
      <ol className="flex flex-col gap-0.5">
        {sections.map((section) => {
          const isVisible = visible.has(section.id)
          const isActive = activeId === section.id

          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  onSelect(section.id)
                }}
                className={cn(
                  'flex items-baseline gap-2 rounded-control px-2 py-1.5 text-sm transition-colors hover:bg-muted',
                  section.level === 2 && 'pl-6 text-[13px]',
                  isActive && 'bg-primary-soft text-primary-text',
                  !isVisible && 'opacity-40',
                )}
              >
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {section.number}
                </span>
                <span className="min-w-0 flex-1 truncate">{section.title}</span>
                {section.completion !== undefined ? (
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {section.completion}%
                  </span>
                ) : null}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
