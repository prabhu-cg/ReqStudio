import type { DocBlock, DocumentSection, DocumentSettings, ExportOptions } from '@/types/document'
import { plainText } from './blocks'
import { LEADING, TYPE_SCALE, estimateLines, geometryFor, type Geometry } from './page-metrics'

/**
 * Page estimation.
 *
 * The PDF exporter lays out for real; everything else — the preview's contents
 * rail, the Word document, the statistics panel — needs a page number before
 * any file exists. This walks the same blocks the PDF engine walks and measures
 * them in points at the same type scale, so the estimate tracks the real output
 * rather than drifting away from it.
 */

/** Mirrors the padding the PDF engine leaves around each block. */
const SPACE = {
  afterParagraph: 6,
  afterList: 4,
  afterFields: 3,
  perFieldItem: 5,
  tableCaption: TYPE_SCALE.micro * 1.8 + 6,
  tableHeader: TYPE_SCALE.micro * 1.4 + 12,
  tableRow: 9,
  afterTable: 10,
  calloutPadding: 20,
  beforeHeading: 6,
  afterSection: 8,
}

function heightOf(block: DocBlock, width: number): number {
  switch (block.type) {
    case 'heading': {
      const size = block.level === 3 ? TYPE_SCALE.h3 : TYPE_SCALE.h4
      return SPACE.beforeHeading + size * LEADING + 2
    }

    case 'paragraph': {
      const size = block.variant === 'lead' ? TYPE_SCALE.lead : TYPE_SCALE.body
      const lines = estimateLines(plainText(block.text), size, width)
      return lines * size * LEADING + SPACE.afterParagraph
    }

    case 'list': {
      const size = TYPE_SCALE.body
      const lines = block.items.reduce(
        (total, item) => total + estimateLines(plainText(item), size, width - 14),
        0,
      )
      return lines * size * LEADING + block.items.length * 1.5 + SPACE.afterList
    }

    case 'fields': {
      const labelWidth = Math.min(140, width * 0.28)
      const valueWidth = width - labelWidth - 12

      const total = block.items.reduce((sum, item) => {
        const labelLines = estimateLines(item.label, TYPE_SCALE.micro, labelWidth)
        const valueLines = item.bullets
          ? item.bullets.reduce(
              (count, bullet) =>
                count + estimateLines(plainText(bullet), TYPE_SCALE.body, valueWidth - 10),
              0,
            )
          : estimateLines(plainText(item.value), TYPE_SCALE.body, valueWidth)

        const height = Math.max(
          labelLines * TYPE_SCALE.micro * 1.35,
          Math.max(1, valueLines) * TYPE_SCALE.body * LEADING,
        )
        return sum + height + SPACE.perFieldItem
      }, 0)

      return total + SPACE.afterFields
    }

    case 'table': {
      const weights = block.columns.map((column) => column.width ?? 1)
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1

      const rows = block.rows.reduce((total, row) => {
        const tallest = row.reduce((max, cell, index) => {
          const columnWidth = ((weights[index] ?? 1) / totalWeight) * width - 12
          return Math.max(max, estimateLines(plainText(cell), TYPE_SCALE.small, columnWidth))
        }, 1)
        return total + tallest * TYPE_SCALE.small * LEADING + SPACE.tableRow
      }, 0)

      return (
        (block.caption ? SPACE.tableCaption : 0) + SPACE.tableHeader + rows + SPACE.afterTable
      )
    }

    case 'callout': {
      const lines = estimateLines(plainText(block.text), TYPE_SCALE.body, width - 26)
      return (
        SPACE.calloutPadding +
        TYPE_SCALE.micro * 1.6 +
        lines * TYPE_SCALE.body * LEADING +
        12
      )
    }

    case 'divider':
      return 12

    case 'empty':
      return TYPE_SCALE.body * LEADING + SPACE.afterParagraph

    case 'pageBreak':
      return 0
  }
}

/** The section's own title block, matching what the PDF engine draws. */
function titleHeight(section: DocumentSection, width: number): number {
  const size = section.level === 1 ? TYPE_SCALE.h1 : TYPE_SCALE.h2
  const description = section.description
    ? estimateLines(section.description, TYPE_SCALE.small, width) * TYPE_SCALE.small * LEADING
    : 0
  return size * LEADING + description + 6 + (section.level === 1 ? 10 : 0)
}

/**
 * Assigns an estimated start page to every section, mutating in place, and
 * returns the total page count.
 *
 * `startPage` accounts for the front matter — cover, document information and
 * contents — that precedes the body.
 */
export function paginate(
  sections: DocumentSection[],
  settings: DocumentSettings,
  options: ExportOptions,
  startPage: number,
): number {
  const geometry: Geometry = geometryFor(settings.pageSize, settings.margins, {
    headers: options.headers,
    footers: options.footers,
  })

  const width = geometry.contentWidth
  const limit = geometry.contentHeight

  let page = startPage
  let used = 0

  const breakPage = () => {
    page += 1
    used = 0
  }

  for (const section of sections) {
    const title = titleHeight(section, width)

    // A title stranded at the foot of a page moves down with its content.
    if (used > 0 && used + title + TYPE_SCALE.body * LEADING > limit) breakPage()

    section.page = page
    used += title

    for (const block of section.blocks) {
      if (block.type === 'pageBreak') {
        if (used > 0) breakPage()
        continue
      }

      const height = heightOf(block, width)

      if (used + height > limit) {
        // Tables and long lists flow across pages rather than being pushed
        // whole, which is what the PDF engine does with them.
        if (height > limit) {
          const overflow = used + height - limit
          page += Math.ceil(overflow / limit)
          used = overflow % limit
          continue
        }
        breakPage()
      }

      used += height
    }

    used += SPACE.afterSection
  }

  return page
}
