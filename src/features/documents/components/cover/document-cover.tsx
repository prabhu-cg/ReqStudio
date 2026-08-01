import type { DocumentCover as CoverData, DocumentMeta } from '@/types/document'

/**
 * The cover page.
 *
 * Laid out to fill a printed page: an identity band at the top, the title
 * anchored in the upper third, and the project facts as a grid at the foot.
 */
export function DocumentCover({ cover, meta }: { cover: CoverData; meta: DocumentMeta }) {
  return (
    <section
      data-print="page"
      aria-label="Cover page"
      className="flex min-h-[42rem] flex-col justify-between border-b border-border px-8 py-12 sm:px-12 sm:py-16"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-3">
          {/* Logo placeholder — replaced by an uploaded mark in a later phase. */}
          <div
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-card bg-primary text-sm font-bold tracking-tight text-primary-foreground"
          >
            {cover.logoText}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold tracking-tight">
              {cover.organisation !== 'Not recorded' ? cover.organisation : 'ReqStudio'}
            </p>
            <p className="text-xs text-muted-foreground">Requirements documentation</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-text">
            {cover.version}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{cover.status}</p>
        </div>
      </div>

      <div className="max-w-3xl py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-text">
          Project requirements brief
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          {cover.title}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {cover.subtitle}
        </p>
        <div className="mt-8 h-1 w-24 rounded-full bg-primary" aria-hidden="true" />
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8 sm:grid-cols-4">
        <CoverFact label="Project" value={cover.projectName} />
        <CoverFact label="Client" value={cover.client} />
        <CoverFact label="Organisation" value={cover.organisation} />
        <CoverFact label="Project type" value={cover.projectType} />
        <CoverFact label="Prepared by" value={cover.designer} />
        <CoverFact label="Prepared" value={cover.preparedDate} />
        <CoverFact label="Version" value={cover.version} />
        <CoverFact label="Status" value={cover.status} />
      </dl>

      <p className="mt-8 text-xs text-muted-foreground">{meta.footerText}</p>
    </section>
  )
}

function CoverFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold leading-snug">{value}</dd>
    </div>
  )
}
