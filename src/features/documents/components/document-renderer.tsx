import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown } from 'lucide-react'
import type { DocumentModel, DocumentSection } from '@/types/document'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { BlockRenderer } from './block-renderer'
import { DocumentCover } from './cover/document-cover'
import { DocumentHeader } from './headers/document-header'
import { DocumentFooter } from './footers/document-footer'
import { TableOfContents } from './toc/table-of-contents'

/**
 * The document rendering engine, on screen.
 *
 * Composes the same running order the exporters use — cover, document
 * information, contents, body — from a compiled `DocumentModel`. Collapse and
 * filter state are owned by the caller so this stays a pure rendering surface.
 */
export interface DocumentRendererProps {
  model: DocumentModel
  /** Section ids currently collapsed. */
  collapsed?: ReadonlySet<string>
  onToggleSection?: (sectionId: string, open: boolean) => void
  /** When present, only these sections render (search results). */
  visible?: ReadonlySet<string>
  /** Shows completion badges and collapse affordances. */
  interactive?: boolean
}

export function DocumentRenderer({
  model,
  collapsed,
  onToggleSection,
  visible,
  interactive = false,
}: DocumentRendererProps) {
  const sections = visible
    ? model.sections.filter((section) => visible.has(section.id))
    : model.sections

  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface-raised shadow-card">
      {model.options.headers ? <DocumentHeader meta={model.meta} /> : null}

      {model.options.includeCover ? (
        <DocumentCover cover={model.cover} meta={model.meta} />
      ) : null}

      {model.options.includeDocumentInfo ? (
        <DocumentInformation model={model} />
      ) : null}

      {model.options.includeToc ? (
        <TableOfContents sections={model.sections} />
      ) : null}

      <div className="px-8 py-10 sm:px-12">
        {sections.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No sections match the current filter.
          </p>
        ) : null}

        <div className="flex flex-col">
          {sections.map((section) => (
            <Section
              key={section.id}
              section={section}
              open={!collapsed?.has(section.id)}
              onToggle={onToggleSection}
              interactive={interactive}
            />
          ))}
        </div>
      </div>

      {model.options.footers ? (
        <DocumentFooter meta={model.meta} pages={model.statistics.pages} />
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Document information                                                        */
/* -------------------------------------------------------------------------- */

function DocumentInformation({ model }: { model: DocumentModel }) {
  return (
    <section
      data-print="page"
      aria-labelledby="document-information"
      className="border-b border-border px-8 py-10 sm:px-12"
    >
      <h2 id="document-information" className="text-2xl font-bold tracking-tight">
        Document Information
      </h2>
      <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-2">
        {model.documentInfo.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-1 border-b border-border pb-3 sm:flex-row sm:items-baseline sm:gap-4"
          >
            <dt className="shrink-0 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:w-40">
              {item.label}
            </dt>
            <dd className="min-w-0 text-sm">
              {item.bullets ? (
                <ul className="list-disc space-y-0.5 pl-4">
                  {item.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex}>{String(bullet)}</li>
                  ))}
                </ul>
              ) : (
                String(item.value)
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

function Section({
  section,
  open,
  onToggle,
  interactive,
}: {
  section: DocumentSection
  open: boolean
  onToggle?: (sectionId: string, open: boolean) => void
  interactive: boolean
}) {
  const isSub = section.level === 2

  return (
    <Collapsible.Root
      id={section.id}
      open={open}
      onOpenChange={(next) => onToggle?.(section.id, next)}
      data-print="section"
      className={cn(
        'scroll-mt-24 border-b border-border py-7 last:border-b-0',
        isSub && 'pl-0 sm:pl-6',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <Collapsible.Trigger asChild disabled={!interactive}>
          <button
            type="button"
            className={cn(
              'group flex min-w-0 flex-1 items-start gap-3 text-left',
              !interactive && 'cursor-default',
            )}
          >
            {interactive ? (
              <ChevronDown
                data-print="hide"
                className={cn(
                  'mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform',
                  !open && '-rotate-90',
                )}
                aria-hidden="true"
              />
            ) : null}
            <span className="min-w-0">
              <span
                className={cn(
                  'block font-bold tracking-tight',
                  isSub ? 'text-lg' : 'text-2xl',
                )}
              >
                <span className="mr-2.5 tabular-nums text-primary-text">{section.number}</span>
                {section.title}
              </span>
              {section.description ? (
                <span className="mt-1.5 block max-w-[68ch] text-sm text-muted-foreground">
                  {section.description}
                </span>
              ) : null}
            </span>
          </button>
        </Collapsible.Trigger>

        {interactive && section.completion !== undefined ? (
          <Badge
            data-print="hide"
            tone={section.completion >= 100 ? 'success' : section.completion > 0 ? 'neutral' : 'outline'}
          >
            {section.completion}%
          </Badge>
        ) : null}
      </div>

      <Collapsible.Content className={cn('pt-5', interactive && 'pl-0 sm:pl-7')}>
        <BlockRenderer blocks={section.blocks} />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
