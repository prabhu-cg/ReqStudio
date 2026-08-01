import type { DocBlock } from '@/types/document'
import { cn } from '@/lib/utils/cn'
import { DocInline } from './doc-inline'
import { DocumentTable } from './tables/document-table'
import { DocumentCallout } from './callouts/document-callout'

/**
 * Block → React.
 *
 * The screen counterpart of the Markdown, HTML, Word and PDF renderers. All
 * five walk the same block list, which is what keeps the preview honest about
 * what an export will contain.
 */
export function BlockRenderer({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: DocBlock }) {
  switch (block.type) {
    case 'heading':
      return block.level === 3 ? (
        <h3 className="mt-2 text-base font-semibold tracking-tight">{block.text}</h3>
      ) : (
        <h4 className="mt-1 text-sm font-semibold tracking-tight text-primary-text">
          {block.text}
        </h4>
      )

    case 'paragraph':
      return (
        <p
          className={cn(
            'max-w-[68ch] leading-relaxed',
            block.variant === 'lead' && 'text-base',
            block.variant === 'muted' && 'text-sm text-muted-foreground',
            (!block.variant || block.variant === 'body') && 'text-sm',
          )}
        >
          <DocInline text={block.text} />
        </p>
      )

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag
          className={cn(
            'max-w-[68ch] space-y-1.5 pl-5 text-sm leading-relaxed',
            block.ordered ? 'list-decimal' : 'list-disc',
          )}
        >
          {block.items.map((item, index) => (
            <li key={index} className="pl-1">
              <DocInline text={item} />
            </li>
          ))}
        </ListTag>
      )
    }

    case 'fields':
      return (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-[minmax(8rem,11rem)_1fr]">
          {block.items.map((item, index) => (
            <div key={index} className="contents">
              <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {item.label}
              </dt>
              <dd
                className={cn(
                  'max-w-[68ch] text-sm leading-relaxed',
                  item.empty && 'italic text-muted-foreground/70',
                )}
              >
                {item.bullets ? (
                  <ul className="list-disc space-y-1 pl-4">
                    {item.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex}>
                        <DocInline text={bullet} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <DocInline text={item.value} />
                )}
              </dd>
            </div>
          ))}
        </dl>
      )

    case 'table':
      return <DocumentTable block={block} />

    case 'callout':
      return (
        <DocumentCallout tone={block.tone} title={block.title}>
          <DocInline text={block.text} />
        </DocumentCallout>
      )

    case 'divider':
      return <hr className="my-2 border-t border-border" />

    case 'empty':
      return <p className="text-sm italic text-muted-foreground">{block.text}</p>

    case 'pageBreak':
      // Only meaningful in paginated output; marked so print honours it.
      return <div data-print="break-before" aria-hidden="true" />
  }
}
