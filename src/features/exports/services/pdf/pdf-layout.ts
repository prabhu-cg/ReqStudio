import { rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib'
import type { CalloutTone, DocBlock, DocText, DocumentModel } from '@/types/document'
import { toSpans } from '@/features/documents/lib/blocks'
import {
  LEADING,
  TYPE_SCALE as SIZE,
  type Geometry,
} from '@/features/documents/lib/page-metrics'
import { sanitise, truncateToWidth, wrapText } from './pdf-text'

/**
 * The PDF layout engine.
 *
 * A downward-flowing cursor over a sequence of pages. Every draw call first
 * asks for vertical space, which is what produces automatic page breaks; long
 * tables and lists flow across pages rather than being pushed whole.
 *
 * The same code runs twice per export: once with `dry` set, to learn which page
 * each section lands on and how many pages there are in total, and once for
 * real with those numbers in hand. Keeping one implementation for both passes
 * is what stops the contents page from lying.
 */

/* -------------------------------------------------------------------------- */
/* Palette and type scale                                                      */
/* -------------------------------------------------------------------------- */

export const COLOURS = {
  primary: hex('#c74504'),
  primaryDark: hex('#a93a03'),
  primarySoft: hex('#fdefe7'),
  ink: hex('#1c1917'),
  body: hex('#555555'),
  muted: hex('#78716c'),
  rule: hex('#e5e0d5'),
  ruleStrong: hex('#d6c7ab'),
  surface: hex('#f4f2ea'),
  surfaceSoft: hex('#fbfaf6'),
  white: rgb(1, 1, 1),
}

const CALLOUT_STYLES: Record<CalloutTone, { fill: RGB; accent: RGB; label: string }> = {
  info: { fill: hex('#ebf3fb'), accent: hex('#1f5f9e'), label: 'Information' },
  success: { fill: hex('#e6f4ec'), accent: hex('#146c43'), label: 'Success' },
  warning: { fill: hex('#fdf3e0'), accent: hex('#8a5a00'), label: 'Warning' },
  risk: { fill: hex('#fdeceb'), accent: hex('#b3261e'), label: 'Risk' },
  future: { fill: hex('#fdefe7'), accent: hex('#a93a03'), label: 'Future scope' },
}

function hex(value: string): RGB {
  const int = Number.parseInt(value.replace('#', ''), 16)
  return rgb(((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255)
}

/* -------------------------------------------------------------------------- */
/* Fonts                                                                       */
/* -------------------------------------------------------------------------- */

export interface PdfFonts {
  regular: PDFFont
  bold: PDFFont
  italic: PDFFont
  boldItalic: PDFFont
}

/** Where a table-of-contents entry was drawn, so a link can be attached later. */
export interface LinkTarget {
  sectionId: string
  pageIndex: number
  rect: [number, number, number, number]
}

export interface SectionAnchor {
  sectionId: string
  title: string
  number: string
  level: 1 | 2
  pageIndex: number
  y: number
}

export interface WriterOptions {
  geometry: Geometry
  fonts: PdfFonts
  model: DocumentModel
  dry: boolean
  /** Known only on the second pass. */
  totalPages?: number
  /** Section id → 1-based page number, known only on the second pass. */
  pageNumbers?: Map<string, number>
  addPage: () => PDFPage
}

export class PdfWriter {
  private readonly geometry: Geometry
  private readonly fonts: PdfFonts
  private readonly model: DocumentModel
  private readonly dry: boolean
  private readonly addPage: () => PDFPage

  private page: PDFPage | null = null
  private cursor = 0
  pageIndex = -1

  readonly anchors: SectionAnchor[] = []
  readonly links: LinkTarget[] = []
  readonly pages: PDFPage[] = []

  private totalPages: number
  private readonly pageNumbers: Map<string, number>

  constructor(options: WriterOptions) {
    this.geometry = options.geometry
    this.fonts = options.fonts
    this.model = options.model
    this.dry = options.dry
    this.addPage = options.addPage
    this.totalPages = options.totalPages ?? 0
    this.pageNumbers = options.pageNumbers ?? new Map()
  }

  /* ------------------------------------------------------------------------ */
  /* Page management                                                          */
  /* ------------------------------------------------------------------------ */

  get pageCount(): number {
    return this.pageIndex + 1
  }

  get contentWidth(): number {
    return this.geometry.contentWidth
  }

  get left(): number {
    return this.geometry.margin
  }

  get y(): number {
    return this.cursor
  }

  newPage(options?: { chrome?: boolean }): void {
    const page = this.addPage()
    this.pages.push(page)
    this.page = page
    this.pageIndex += 1
    this.cursor = this.geometry.contentTop

    if (options?.chrome !== false) this.drawChrome()
  }

  /** Reserves vertical space, breaking to a new page when it will not fit. */
  ensure(height: number): void {
    if (this.page === null) {
      this.newPage()
      return
    }
    if (this.cursor - height < this.geometry.contentBottom) this.newPage()
  }

  advance(height: number): void {
    this.cursor -= height
  }

  /** Space that remains on the current page. */
  get remaining(): number {
    return this.cursor - this.geometry.contentBottom
  }

  /* ------------------------------------------------------------------------ */
  /* Drawing primitives                                                       */
  /* ------------------------------------------------------------------------ */

  private text(
    value: string,
    x: number,
    y: number,
    options: { font: PDFFont; size: number; colour: RGB },
  ): void {
    if (this.dry || !this.page) return
    this.page.drawText(value, {
      x,
      y,
      size: options.size,
      font: options.font,
      color: options.colour,
    })
  }

  private rect(
    x: number,
    y: number,
    width: number,
    height: number,
    options: { fill?: RGB; border?: RGB; borderWidth?: number },
  ): void {
    if (this.dry || !this.page) return
    this.page.drawRectangle({
      x,
      y,
      width,
      height,
      color: options.fill,
      borderColor: options.border,
      borderWidth: options.borderWidth ?? (options.border ? 0.5 : 0),
    })
  }

  private line(x1: number, y1: number, x2: number, y2: number, colour: RGB, thickness = 0.5): void {
    if (this.dry || !this.page) return
    this.page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color: colour,
    })
  }

  /* ------------------------------------------------------------------------ */
  /* Running header and footer                                                */
  /* ------------------------------------------------------------------------ */

  private drawChrome(): void {
    const { options, meta } = this.model
    const { margin, page: dimensions } = this.geometry

    if (options.headers) {
      const y = dimensions.height - margin + 6
      const label = truncateToWidth(
        `ReqStudio  ·  ${meta.projectName}`,
        this.fonts.regular,
        SIZE.micro,
        this.contentWidth - 60,
      )
      this.text(label, margin, y, {
        font: this.fonts.regular,
        size: SIZE.micro,
        colour: COLOURS.muted,
      })

      const version = sanitise(meta.version)
      const width = this.fonts.bold.widthOfTextAtSize(version, SIZE.micro)
      this.text(version, margin + this.contentWidth - width, y, {
        font: this.fonts.bold,
        size: SIZE.micro,
        colour: COLOURS.primaryDark,
      })

      this.line(margin, y - 5, margin + this.contentWidth, y - 5, COLOURS.rule)
    }

    if (options.footers) {
      const y = margin - 2
      this.line(margin, y + 14, margin + this.contentWidth, y + 14, COLOURS.rule)

      this.text(truncateToWidth(meta.footerText, this.fonts.regular, SIZE.micro, this.contentWidth * 0.5), margin, y, {
        font: this.fonts.regular,
        size: SIZE.micro,
        colour: COLOURS.muted,
      })

      const right = options.pageNumbers
        ? `${meta.generatedDate}  ·  Page ${this.pageIndex + 1} of ${this.totalPages || '—'}`
        : `${meta.generatedDate}  ·  Generated by ReqStudio`
      const clean = sanitise(right)
      const width = this.fonts.regular.widthOfTextAtSize(clean, SIZE.micro)
      this.text(clean, margin + this.contentWidth - width, y, {
        font: this.fonts.regular,
        size: SIZE.micro,
        colour: COLOURS.muted,
      })
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Text blocks                                                              */
  /* ------------------------------------------------------------------------ */

  /**
   * Draws wrapped text, breaking pages between lines.
   *
   * Inline spans are flattened first: mixing weights within a wrapped paragraph
   * would need per-word measurement for a gain this document never needs, so a
   * span's emphasis applies to the whole run it starts.
   */
  paragraph(
    value: DocText,
    options: {
      x?: number
      width?: number
      size?: number
      colour?: RGB
      font?: PDFFont;
      spaceAfter?: number
      indent?: number
    } = {},
  ): void {
    const size = options.size ?? SIZE.body
    const spans = toSpans(value)
    const font = options.font ?? this.fontFor(spans[0]?.bold, spans[0]?.italic)
    const x = options.x ?? this.left
    const width = options.width ?? this.contentWidth
    const colour = options.colour ?? COLOURS.body
    const lineHeight = size * LEADING

    const text = spans.map((span) => span.text).join('')
    const lines = wrapText(text, font, size, width - (options.indent ?? 0))

    for (const [index, line] of lines.entries()) {
      this.ensure(lineHeight)
      const offset = index === 0 ? 0 : (options.indent ?? 0)
      this.text(line, x + offset, this.cursor - size, { font, size, colour })
      this.advance(lineHeight)
    }

    if (options.spaceAfter) this.advance(options.spaceAfter)
  }

  private fontFor(bold?: boolean, italic?: boolean): PDFFont {
    if (bold && italic) return this.fonts.boldItalic
    if (bold) return this.fonts.bold
    if (italic) return this.fonts.italic
    return this.fonts.regular
  }

  /* ------------------------------------------------------------------------ */
  /* Structure                                                                */
  /* ------------------------------------------------------------------------ */

  /** Records where a section starts so links and bookmarks can point at it. */
  sectionHeading(section: {
    id: string
    number: string
    title: string
    level: 1 | 2
    description?: string
  }): void {
    const size = section.level === 1 ? SIZE.h1 : SIZE.h2
    const needed = size * LEADING + (section.description ? SIZE.small * LEADING : 0) + 18

    this.ensure(needed)
    if (section.level === 1 && this.cursor < this.geometry.contentTop) this.advance(10)

    this.anchors.push({
      sectionId: section.id,
      title: section.title,
      number: section.number,
      level: section.level,
      pageIndex: this.pageIndex,
      y: this.cursor,
    })

    const numberText = sanitise(`${section.number}  `)
    const numberWidth = this.fonts.bold.widthOfTextAtSize(numberText, size)

    this.text(numberText, this.left, this.cursor - size, {
      font: this.fonts.bold,
      size,
      colour: COLOURS.primaryDark,
    })
    this.text(sanitise(section.title), this.left + numberWidth, this.cursor - size, {
      font: this.fonts.bold,
      size,
      colour: COLOURS.ink,
    })
    this.advance(size * LEADING)

    if (section.description) {
      this.paragraph(section.description, {
        size: SIZE.small,
        colour: COLOURS.muted,
        font: this.fonts.italic,
      })
    }

    this.advance(6)
  }

  heading(text: string, level: 3 | 4): void {
    const size = level === 3 ? SIZE.h3 : SIZE.h4
    this.ensure(size * LEADING + 10)
    this.advance(6)
    this.ensure(size * LEADING)
    this.text(sanitise(text), this.left, this.cursor - size, {
      font: this.fonts.bold,
      size,
      colour: level === 3 ? COLOURS.ink : COLOURS.primaryDark,
    })
    this.advance(size * LEADING + 2)
  }

  list(items: DocText[], ordered: boolean): void {
    const size = SIZE.body
    const indent = 14

    for (const [index, item] of items.entries()) {
      const marker = ordered ? `${index + 1}.` : '-'
      const markerWidth = this.fonts.regular.widthOfTextAtSize(marker, size)
      const lines = wrapText(
        toSpans(item)
          .map((span) => span.text)
          .join(''),
        this.fonts.regular,
        size,
        this.contentWidth - indent,
      )

      for (const [lineIndex, line] of lines.entries()) {
        this.ensure(size * LEADING)
        if (lineIndex === 0) {
          this.text(marker, this.left + indent - markerWidth - 4, this.cursor - size, {
            font: this.fonts.regular,
            size,
            colour: COLOURS.muted,
          })
        }
        this.text(line, this.left + indent, this.cursor - size, {
          font: this.fonts.regular,
          size,
          colour: COLOURS.body,
        })
        this.advance(size * LEADING)
      }
      this.advance(1.5)
    }

    this.advance(4)
  }

  /** Label/value pairs in two columns. */
  fields(items: Array<{ label: string; value: DocText; bullets?: DocText[]; empty?: boolean }>): void {
    const labelWidth = Math.min(140, this.contentWidth * 0.28)
    const valueX = this.left + labelWidth + 12
    const valueWidth = this.contentWidth - labelWidth - 12
    const size = SIZE.body

    for (const item of items) {
      const labelLines = wrapText(item.label.toUpperCase(), this.fonts.bold, SIZE.micro, labelWidth)

      const valueLines = item.bullets
        ? item.bullets.flatMap((bullet) =>
            wrapText(plain(bullet), this.fonts.regular, size, valueWidth - 10).map(
              (line, index) => (index === 0 ? `-  ${line}` : `   ${line}`),
            ),
          )
        : wrapText(plain(item.value), this.fonts.regular, size, valueWidth)

      const height = Math.max(labelLines.length * SIZE.micro * 1.35, valueLines.length * size * LEADING)
      this.ensure(Math.min(height, this.geometry.contentHeight))

      const top = this.cursor

      for (const [index, line] of labelLines.entries()) {
        this.text(line, this.left, top - SIZE.micro - index * SIZE.micro * 1.35, {
          font: this.fonts.bold,
          size: SIZE.micro,
          colour: COLOURS.muted,
        })
      }

      // The value column may outrun the page even when the label does not.
      this.cursor = top
      for (const line of valueLines) {
        this.ensure(size * LEADING)
        this.text(line, valueX, this.cursor - size, {
          font: item.empty ? this.fonts.italic : this.fonts.regular,
          size,
          colour: item.empty ? COLOURS.muted : COLOURS.body,
        })
        this.advance(size * LEADING)
      }

      this.advance(5)
    }

    this.advance(3)
  }

  /* ------------------------------------------------------------------------ */
  /* Tables                                                                   */
  /* ------------------------------------------------------------------------ */

  table(block: Extract<DocBlock, { type: 'table' }>): void {
    const size = SIZE.small
    const padding = 6
    const weights = block.columns.map((column) => column.width ?? 1)
    const total = weights.reduce((sum, weight) => sum + weight, 0) || 1
    const widths = weights.map((weight) => (weight / total) * this.contentWidth)

    if (block.caption) {
      this.ensure(SIZE.micro * 2 + 8)
      this.advance(6)
      this.text(sanitise(block.caption.toUpperCase()), this.left, this.cursor - SIZE.micro, {
        font: this.fonts.bold,
        size: SIZE.micro,
        colour: COLOURS.muted,
      })
      this.advance(SIZE.micro * 1.8)
    }

    const headerHeight = SIZE.micro * 1.4 + padding * 2

    const drawHeader = () => {
      this.ensure(headerHeight + size * LEADING)
      const top = this.cursor
      this.rect(this.left, top - headerHeight, this.contentWidth, headerHeight, {
        fill: COLOURS.surface,
      })

      let x = this.left
      for (const [index, column] of block.columns.entries()) {
        const width = widths[index] ?? 0
        const label = truncateToWidth(
          column.header.toUpperCase(),
          this.fonts.bold,
          SIZE.micro,
          width - padding * 2,
        )
        const offset =
          column.align === 'right'
            ? width - padding - this.fonts.bold.widthOfTextAtSize(label, SIZE.micro)
            : padding
        this.text(label, x + offset, top - padding - SIZE.micro, {
          font: this.fonts.bold,
          size: SIZE.micro,
          colour: COLOURS.muted,
        })
        x += width
      }

      this.line(this.left, top - headerHeight, this.left + this.contentWidth, top - headerHeight, COLOURS.ruleStrong)
      this.advance(headerHeight)
    }

    drawHeader()

    for (const [rowIndex, row] of block.rows.entries()) {
      const cellLines = row.map((cell, index) =>
        wrapText(plain(cell), this.fonts.regular, size, (widths[index] ?? 0) - padding * 2),
      )
      const rowHeight = Math.max(
        size * LEADING,
        Math.max(...cellLines.map((lines) => lines.length)) * size * LEADING,
      ) + padding * 1.5

      // A row taller than a whole page is clipped to it rather than looping.
      if (this.remaining < rowHeight && rowHeight < this.geometry.contentHeight) {
        this.newPage()
        drawHeader()
      }

      const top = this.cursor

      if (rowIndex % 2 === 1) {
        this.rect(this.left, top - rowHeight, this.contentWidth, rowHeight, {
          fill: COLOURS.surfaceSoft,
        })
      }

      let x = this.left
      for (const [index, lines] of cellLines.entries()) {
        const width = widths[index] ?? 0
        for (const [lineIndex, line] of lines.entries()) {
          const offset =
            block.columns[index]?.align === 'right'
              ? width - padding - this.fonts.regular.widthOfTextAtSize(line, size)
              : padding
          this.text(line, x + offset, top - padding - size - lineIndex * size * LEADING, {
            font: this.fonts.regular,
            size,
            colour: COLOURS.body,
          })
        }
        x += width
      }

      this.line(this.left, top - rowHeight, this.left + this.contentWidth, top - rowHeight, COLOURS.rule)
      this.advance(rowHeight)
    }

    this.advance(10)
  }

  /* ------------------------------------------------------------------------ */
  /* Callouts                                                                 */
  /* ------------------------------------------------------------------------ */

  callout(block: Extract<DocBlock, { type: 'callout' }>): void {
    const style = CALLOUT_STYLES[block.tone]
    const padding = 10
    const innerWidth = this.contentWidth - padding * 2 - 6
    const bodyLines = wrapText(plain(block.text), this.fonts.regular, SIZE.body, innerWidth)
    const height = padding * 2 + SIZE.micro * 1.6 + bodyLines.length * SIZE.body * LEADING

    this.ensure(Math.min(height + 8, this.geometry.contentHeight))
    this.advance(4)

    const top = this.cursor
    const boxHeight = Math.min(height, this.remaining)

    this.rect(this.left, top - boxHeight, this.contentWidth, boxHeight, { fill: style.fill })
    this.rect(this.left, top - boxHeight, 3, boxHeight, { fill: style.accent })

    this.text(
      sanitise((block.title ?? style.label).toUpperCase()),
      this.left + padding + 6,
      top - padding - SIZE.micro,
      { font: this.fonts.bold, size: SIZE.micro, colour: style.accent },
    )

    for (const [index, line] of bodyLines.entries()) {
      this.text(
        line,
        this.left + padding + 6,
        top - padding - SIZE.micro * 1.6 - SIZE.body - index * SIZE.body * LEADING,
        { font: this.fonts.regular, size: SIZE.body, colour: COLOURS.ink },
      )
    }

    this.advance(boxHeight + 8)
  }

  divider(): void {
    this.ensure(12)
    this.advance(6)
    this.line(this.left, this.cursor, this.left + this.contentWidth, this.cursor, COLOURS.rule)
    this.advance(6)
  }

  empty(text: string): void {
    this.paragraph(text, { font: this.fonts.italic, colour: COLOURS.muted, spaceAfter: 6 })
  }

  pageBreak(): void {
    if (this.pageIndex >= 0 && this.cursor < this.geometry.contentTop) this.newPage()
  }

  /* ------------------------------------------------------------------------ */
  /* Cover, document information and contents                                 */
  /* ------------------------------------------------------------------------ */

  cover(): void {
    // The cover carries no running header or footer.
    this.newPage({ chrome: false })

    const { cover, meta } = this.model
    const { margin, page: dimensions } = this.geometry
    const top = dimensions.height - margin

    // Identity band.
    this.rect(margin, top - 44, 44, 44, { fill: COLOURS.primary })
    const initials = sanitise(cover.logoText).slice(0, 3)
    const initialsWidth = this.fonts.bold.widthOfTextAtSize(initials, 15)
    this.text(initials, margin + 22 - initialsWidth / 2, top - 27, {
      font: this.fonts.bold,
      size: 15,
      colour: COLOURS.white,
    })

    const organisation = cover.organisation !== 'Not recorded' ? cover.organisation : 'ReqStudio'
    this.text(truncateToWidth(organisation, this.fonts.bold, 11, 240), margin + 56, top - 20, {
      font: this.fonts.bold,
      size: 11,
      colour: COLOURS.ink,
    })
    this.text('Requirements documentation', margin + 56, top - 34, {
      font: this.fonts.regular,
      size: SIZE.small,
      colour: COLOURS.muted,
    })

    const versionWidth = this.fonts.bold.widthOfTextAtSize(sanitise(cover.version), SIZE.small)
    this.text(sanitise(cover.version), margin + this.contentWidth - versionWidth, top - 20, {
      font: this.fonts.bold,
      size: SIZE.small,
      colour: COLOURS.primaryDark,
    })
    const statusWidth = this.fonts.regular.widthOfTextAtSize(sanitise(cover.status), SIZE.small)
    this.text(sanitise(cover.status), margin + this.contentWidth - statusWidth, top - 34, {
      font: this.fonts.regular,
      size: SIZE.small,
      colour: COLOURS.muted,
    })

    // Title block, anchored in the upper third.
    this.cursor = top - 180
    this.text('PROJECT REQUIREMENTS BRIEF', margin, this.cursor, {
      font: this.fonts.bold,
      size: SIZE.small,
      colour: COLOURS.primaryDark,
    })
    this.advance(28)

    const titleLines = wrapText(cover.title, this.fonts.bold, 30, this.contentWidth * 0.86)
    for (const line of titleLines) {
      this.text(line, margin, this.cursor - 30, {
        font: this.fonts.bold,
        size: 30,
        colour: COLOURS.ink,
      })
      this.advance(36)
    }

    this.advance(8)
    const subtitleLines = wrapText(cover.subtitle, this.fonts.regular, 12, this.contentWidth * 0.78)
    for (const line of subtitleLines.slice(0, 4)) {
      this.text(line, margin, this.cursor - 12, {
        font: this.fonts.regular,
        size: 12,
        colour: COLOURS.muted,
      })
      this.advance(18)
    }

    this.advance(16)
    this.rect(margin, this.cursor, 72, 4, { fill: COLOURS.primary })

    // Fact grid at the foot.
    const facts: Array<[string, string]> = [
      ['Project', cover.projectName],
      ['Client', cover.client],
      ['Organisation', cover.organisation],
      ['Project type', cover.projectType],
      ['Prepared by', cover.designer],
      ['Prepared', cover.preparedDate],
      ['Version', cover.version],
      ['Status', cover.status],
    ]

    const gridTop = margin + 150
    const columnWidth = this.contentWidth / 4

    this.line(margin, gridTop + 26, margin + this.contentWidth, gridTop + 26, COLOURS.rule)

    for (const [index, [label, value]] of facts.entries()) {
      const column = index % 4
      const row = Math.floor(index / 4)
      const x = margin + column * columnWidth
      const y = gridTop - row * 46

      this.text(sanitise(label.toUpperCase()), x, y, {
        font: this.fonts.bold,
        size: SIZE.micro,
        colour: COLOURS.muted,
      })
      this.text(truncateToWidth(value, this.fonts.bold, SIZE.body, columnWidth - 12), x, y - 15, {
        font: this.fonts.bold,
        size: SIZE.body,
        colour: COLOURS.ink,
      })
    }

    this.text(truncateToWidth(meta.footerText, this.fonts.regular, SIZE.micro, this.contentWidth), margin, margin + 10, {
      font: this.fonts.regular,
      size: SIZE.micro,
      colour: COLOURS.muted,
    })
  }

  documentInformation(): void {
    this.newPage()
    this.sectionHeading({
      id: 'document-information',
      number: '',
      title: 'Document Information',
      level: 1,
    })
    this.fields(this.model.documentInfo)
  }

  /**
   * The contents page.
   *
   * Entry rectangles are recorded so the caller can attach link annotations
   * once every body page exists.
   */
  contents(): void {
    this.newPage()
    this.sectionHeading({ id: 'contents', number: '', title: 'Contents', level: 1 })

    const size = SIZE.body

    for (const section of this.model.sections) {
      this.ensure(size * LEADING + 2)

      const indent = section.level === 2 ? 18 : 0
      const bold = section.level === 1
      const font = bold ? this.fonts.bold : this.fonts.regular
      const numberText = sanitise(section.number)
      const numberWidth = font.widthOfTextAtSize(numberText, size)

      const pageNumber = this.pageNumbers.get(section.id)
      const pageLabel = pageNumber ? String(pageNumber) : ''
      const pageWidth = this.fonts.regular.widthOfTextAtSize(pageLabel || '00', size)

      const titleX = this.left + indent + Math.max(numberWidth + 8, 26)
      const titleMax = this.contentWidth - indent - (titleX - this.left) - pageWidth - 16
      const title = truncateToWidth(section.title, font, size, titleMax)
      const titleWidth = font.widthOfTextAtSize(title, size)

      const baseline = this.cursor - size

      this.text(numberText, this.left + indent, baseline, {
        font,
        size,
        colour: bold ? COLOURS.primaryDark : COLOURS.muted,
      })
      this.text(title, titleX, baseline, {
        font,
        size,
        colour: bold ? COLOURS.ink : COLOURS.body,
      })

      // Leader dots between the title and the page number.
      const leaderStart = titleX + titleWidth + 6
      const leaderEnd = this.left + this.contentWidth - pageWidth - 6
      if (leaderEnd > leaderStart) {
        this.line(leaderStart, baseline + 2, leaderEnd, baseline + 2, COLOURS.rule, 0.4)
      }

      if (pageLabel) {
        this.text(pageLabel, this.left + this.contentWidth - pageWidth, baseline, {
          font: this.fonts.regular,
          size,
          colour: COLOURS.muted,
        })
      }

      this.links.push({
        sectionId: section.id,
        pageIndex: this.pageIndex,
        rect: [this.left + indent, baseline - 2, this.left + this.contentWidth, baseline + size],
      })

      this.advance(size * LEADING + 3)
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Body                                                                     */
  /* ------------------------------------------------------------------------ */

  body(): void {
    this.newPage()

    for (const section of this.model.sections) {
      this.sectionHeading(section)

      for (const block of section.blocks) {
        this.block(block)
      }

      this.advance(8)
    }
  }

  private block(block: DocBlock): void {
    switch (block.type) {
      case 'heading':
        this.heading(block.text, block.level)
        break

      case 'paragraph':
        this.paragraph(block.text, {
          size: block.variant === 'lead' ? SIZE.lead : SIZE.body,
          colour: block.variant === 'muted' ? COLOURS.muted : COLOURS.body,
          font: block.variant === 'muted' ? this.fonts.italic : this.fonts.regular,
          spaceAfter: 6,
        })
        break

      case 'list':
        this.list(block.items, block.ordered)
        break

      case 'fields':
        this.fields(block.items)
        break

      case 'table':
        this.table(block)
        break

      case 'callout':
        this.callout(block)
        break

      case 'divider':
        this.divider()
        break

      case 'empty':
        this.empty(block.text)
        break

      case 'pageBreak':
        this.pageBreak()
        break
    }
  }
}

function plain(text: DocText): string {
  return toSpans(text)
    .map((span) => span.text)
    .join('')
}
