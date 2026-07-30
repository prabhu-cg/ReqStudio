import type { SectionPaneProps } from '@/types/section'
import type { ProjectPage } from '@/types/project'

const DETAIL_ROWS: Array<{ key: keyof ProjectPage; label: string }> = [
  { key: 'purpose', label: 'Purpose' },
  { key: 'audience', label: 'Audience' },
  { key: 'summary', label: 'Summary' },
  { key: 'businessGoal', label: 'Business goal' },
  { key: 'primaryCta', label: 'Primary CTA' },
  { key: 'secondaryCta', label: 'Secondary CTA' },
  { key: 'contentRequirements', label: 'Content requirements' },
  { key: 'requiredComponents', label: 'Required components' },
  { key: 'dependencies', label: 'Dependencies' },
  { key: 'seoNotes', label: 'SEO notes' },
  { key: 'accessibilityNotes', label: 'Accessibility notes' },
  { key: 'analytics', label: 'Analytics' },
]

/** Report rendering of the pages — one block per page, print friendly. */
export function PageRequirementsPreview({ pages }: SectionPaneProps) {
  if (pages.length === 0) {
    return <p className="text-sm italic text-muted-foreground">No pages have been defined.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {pages.map((page, index) => (
        <article
          key={page.id}
          data-print="page"
          className="rounded-card border border-border bg-surface-raised p-5"
        >
          <h4 className="text-sm font-semibold">
            <span className="mr-2 text-muted-foreground">5.{index + 1}</span>
            {page.name || 'Untitled page'}
          </h4>

          <dl className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[minmax(9rem,auto)_1fr]">
            {DETAIL_ROWS.map(({ key, label }) => {
              const value = page[key]
              const rendered = Array.isArray(value) ? value.filter(Boolean) : String(value ?? '').trim()
              const isEmpty = Array.isArray(rendered) ? rendered.length === 0 : rendered === ''
              if (isEmpty) return null

              return (
                <div key={key} className="contents">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="text-sm leading-relaxed">
                    {Array.isArray(rendered) ? (
                      <ul className="list-disc space-y-1 pl-4">
                        {rendered.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="whitespace-pre-wrap">{rendered}</span>
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
        </article>
      ))}
    </div>
  )
}
