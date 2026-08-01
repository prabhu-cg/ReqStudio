import type { DocTableBlock } from '@/types/document'
import { cn } from '@/lib/utils/cn'
import { DocInline } from '../doc-inline'

/**
 * Report table.
 *
 * Columns size themselves from the relative widths in the block, and the whole
 * table scrolls horizontally on narrow screens rather than forcing the page to.
 */
export function DocumentTable({ block }: { block: DocTableBlock }) {
  const total = block.columns.reduce((sum, column) => sum + (column.width ?? 1), 0) || 1

  return (
    <figure data-print="section" className="my-1">
      {block.caption ? (
        <figcaption className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {block.caption}
        </figcaption>
      ) : null}

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[32rem] border-collapse text-sm">
          <colgroup>
            {block.columns.map((column, index) => (
              <col key={index} style={{ width: `${((column.width ?? 1) / total) * 100}%` }} />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-muted">
              {block.columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={cn(
                    'border-b border-border px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground',
                    column.align === 'right' ? 'text-right' : 'text-left',
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="even:bg-surface">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={cn(
                      'border-b border-border px-3 py-2.5 align-top leading-relaxed last:border-r-0',
                      'group-last:border-b-0',
                      block.columns[cellIndex]?.align === 'right' ? 'text-right tabular-nums' : 'text-left',
                    )}
                  >
                    <DocInline text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
