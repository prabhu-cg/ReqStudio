import type { DocumentSection } from '@/types/document'
import { cn } from '@/lib/utils/cn'

/**
 * The printed table of contents.
 *
 * Generated from the section list, so it can never drift from the body. Entries
 * are links, and leader dots run to an estimated page number.
 */
export function TableOfContents({
  sections,
  onNavigate,
  showPageNumbers = true,
}: {
  sections: DocumentSection[]
  onNavigate?: (sectionId: string) => void
  showPageNumbers?: boolean
}) {
  if (sections.length === 0) return null

  return (
    <section
      data-print="page"
      aria-labelledby="document-contents"
      className="border-b border-border px-8 py-10 sm:px-12"
    >
      <h2 id="document-contents" className="text-2xl font-bold tracking-tight">
        Contents
      </h2>

      <ol className="mt-6 flex flex-col">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={() => onNavigate?.(section.id)}
              className={cn(
                'group flex items-baseline gap-3 py-1.5 transition-colors hover:text-primary-text',
                section.level === 2 && 'pl-8 text-sm text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'shrink-0 tabular-nums text-muted-foreground',
                  section.level === 1 && 'font-semibold text-primary-text',
                )}
              >
                {section.number}
              </span>
              <span className={cn('shrink-0', section.level === 1 && 'font-semibold')}>
                {section.title}
              </span>
              <span
                aria-hidden="true"
                className="min-w-4 flex-1 translate-y-[-0.25em] border-b border-dotted border-border-strong"
              />
              {showPageNumbers ? (
                <span className="shrink-0 tabular-nums text-muted-foreground">{section.page}</span>
              ) : null}
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
