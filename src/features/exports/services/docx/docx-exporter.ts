import {
  AlignmentType,
  BorderStyle,
  Bookmark,
  Document,
  Footer,
  Header,
  HeadingLevel,
  InternalHyperlink,
  LevelFormat,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip,
  type IParagraphOptions,
  type ISectionOptions,
} from 'docx'
import type {
  CalloutTone,
  DocBlock,
  DocText,
  DocumentModel,
  DocumentSection,
  MarginPreset,
  PageSize,
} from '@/types/document'
import { toSpans } from '@/features/documents/lib/blocks'

/**
 * Microsoft Word renderer.
 *
 * Produces a document a client can mark up: real heading styles (so Word's own
 * navigation pane and table-of-contents field work), real tables, and a
 * bookmarked contents page rather than a picture of one.
 */

const FONT = 'Manrope'
const PRIMARY = 'C74504'
const INK = '1C1917'
const BODY = '555555'
const MUTED = '78716C'
const RULE = 'E5E0D5'
const SURFACE = 'F4F2EA'

const BULLET_REFERENCE = 'rs-bullets'
const NUMBER_REFERENCE = 'rs-numbers'

/** Page geometry in twips. */
const PAGE_SIZES: Record<PageSize, { width: number; height: number }> = {
  a4: { width: 11906, height: 16838 },
  letter: { width: 12240, height: 15840 },
}

const MARGINS_MM: Record<MarginPreset, number> = {
  narrow: 15,
  normal: 20,
  wide: 30,
}

const CALLOUT_COLOURS: Record<CalloutTone, { fill: string; text: string; label: string }> = {
  info: { fill: 'EBF3FB', text: '1F5F9E', label: 'Information' },
  success: { fill: 'E6F4EC', text: '146C43', label: 'Success' },
  warning: { fill: 'FDF3E0', text: '8A5A00', label: 'Warning' },
  risk: { fill: 'FDECEB', text: 'B3261E', label: 'Risk' },
  future: { fill: 'FDEFE7', text: 'A93A03', label: 'Future scope' },
}

export async function exportDocx(model: DocumentModel): Promise<Blob> {
  const margin = convertMillimetersToTwip(MARGINS_MM[model.settings.margins])
  const contentWidth = PAGE_SIZES[model.settings.pageSize].width - margin * 2

  // Ordered lists each need their own numbering instance, or Word continues the
  // count from the previous list in the document.
  const state = { listInstance: 0 }

  const children: Array<Paragraph | Table> = []

  if (model.options.includeCover) children.push(...coverPage(model))
  if (model.options.includeDocumentInfo) children.push(...documentInfoPage(model, contentWidth))
  if (model.options.includeToc) children.push(...tableOfContents(model))

  for (const section of model.sections) {
    children.push(...renderSection(section, contentWidth, state))
  }

  const section: ISectionOptions = {
    properties: {
      page: {
        size: PAGE_SIZES[model.settings.pageSize],
        margin: { top: margin, bottom: margin, left: margin, right: margin },
      },
    },
    headers: model.options.headers ? { default: runningHeader(model) } : undefined,
    footers: model.options.footers ? { default: runningFooter(model) } : undefined,
    children,
  }

  const document = new Document({
    creator: model.meta.preparedBy || 'ReqStudio',
    title: model.meta.documentTitle,
    description: model.cover.subtitle,
    subject: model.meta.projectName,
    styles: documentStyles(),
    numbering: numberingConfig(),
    sections: [section],
  })

  return Packer.toBlob(document)
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

function documentStyles() {
  return {
    default: {
      document: {
        run: { font: FONT, size: 21, color: BODY },
        paragraph: { spacing: { line: 300, after: 120 } },
      },
      heading1: {
        run: { font: FONT, size: 32, bold: true, color: INK },
        paragraph: { spacing: { before: 360, after: 160 } },
      },
      heading2: {
        run: { font: FONT, size: 25, bold: true, color: INK },
        paragraph: { spacing: { before: 280, after: 140 } },
      },
      heading3: {
        run: { font: FONT, size: 22, bold: true, color: INK },
        paragraph: { spacing: { before: 240, after: 100 } },
      },
      heading4: {
        run: { font: FONT, size: 21, bold: true, color: PRIMARY },
        paragraph: { spacing: { before: 200, after: 80 } },
      },
    },
  }
}

function numberingConfig() {
  return {
    config: [
      {
        reference: BULLET_REFERENCE,
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 460, hanging: 240 } } },
          },
        ],
      },
      {
        reference: NUMBER_REFERENCE,
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: '%1.',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 460, hanging: 240 } } },
          },
        ],
      },
    ],
  }
}

/* -------------------------------------------------------------------------- */
/* Running header and footer                                                   */
/* -------------------------------------------------------------------------- */

function runningHeader(model: DocumentModel): Header {
  return new Header({
    children: [
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 6 } },
        spacing: { after: 200 },
        children: [
          new TextRun({ text: 'ReqStudio', bold: true, size: 16, color: PRIMARY }),
          new TextRun({ text: `  ·  ${model.meta.projectName}`, size: 16, color: MUTED }),
          new TextRun({
            text: `\t${model.meta.version}`,
            size: 16,
            bold: true,
            color: PRIMARY,
          }),
        ],
      }),
    ],
  })
}

function runningFooter(model: DocumentModel): Footer {
  const children = [
    new TextRun({ text: model.meta.footerText, size: 15, color: MUTED }),
    new TextRun({ text: `\t${model.meta.generatedDate}  ·  Generated by ReqStudio`, size: 15, color: MUTED }),
  ]

  if (model.options.pageNumbers) {
    children.push(
      new TextRun({
        children: ['\tPage ', PageNumber.CURRENT, ' of ', PageNumber.TOTAL_PAGES],
        size: 15,
        color: MUTED,
      }),
    )
  }

  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 6 } },
        spacing: { before: 160 },
        children,
      }),
    ],
  })
}

/* -------------------------------------------------------------------------- */
/* Front matter                                                                */
/* -------------------------------------------------------------------------- */

function coverPage(model: DocumentModel): Paragraph[] {
  const { cover } = model

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

  return [
    new Paragraph({
      spacing: { before: 1400, after: 120 },
      children: [
        new TextRun({
          text: 'PROJECT REQUIREMENTS BRIEF',
          bold: true,
          size: 17,
          color: PRIMARY,
          characterSpacing: 60,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: cover.title, bold: true, size: 56, color: INK })],
    }),
    new Paragraph({
      spacing: { after: 600 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: PRIMARY, space: 12 } },
      children: [new TextRun({ text: cover.subtitle, size: 24, color: MUTED })],
    }),
    ...facts.map(
      ([label, value]) =>
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${label.toUpperCase()}   `, bold: true, size: 16, color: MUTED }),
            new TextRun({ text: value, size: 20, color: INK, bold: true }),
          ],
        }),
    ),
    new Paragraph({
      spacing: { before: 600 },
      children: [new TextRun({ text: model.meta.footerText, size: 16, color: MUTED }), new PageBreak()],
    }),
  ]
}

function documentInfoPage(model: DocumentModel, contentWidth: number): Array<Paragraph | Table> {
  const rows = model.documentInfo.map(
    (item) =>
      new TableRow({
        children: [
          cell(
            [new Paragraph({ children: [new TextRun({ text: item.label, bold: true, size: 18, color: MUTED })] })],
            { shading: SURFACE },
          ),
          cell(
            item.bullets
              ? item.bullets.map(
                  (bullet) =>
                    new Paragraph({
                      numbering: { reference: BULLET_REFERENCE, level: 0 },
                      children: [new TextRun({ text: plain(bullet), size: 20, color: INK })],
                    }),
                )
              : [new Paragraph({ children: [new TextRun({ text: plain(item.value), size: 20, color: INK })] })],
          ),
        ],
      }),
  )

  return [
    new Paragraph({ heading: HeadingLevel.HEADING_1, text: 'Document Information' }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [Math.round(contentWidth * 0.32), Math.round(contentWidth * 0.68)],
      borders: tableBorders(),
      rows,
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

function tableOfContents(model: DocumentModel): Paragraph[] {
  const entries = model.sections.map(
    (section) =>
      new Paragraph({
        spacing: { after: 60 },
        indent: section.level === 2 ? { left: 400 } : undefined,
        children: [
          new InternalHyperlink({
            anchor: bookmarkId(section.id),
            children: [
              new TextRun({
                text: `${section.number}.  `,
                bold: section.level === 1,
                size: 20,
                color: section.level === 1 ? PRIMARY : MUTED,
              }),
              new TextRun({
                text: section.title,
                bold: section.level === 1,
                size: 20,
                color: INK,
              }),
              new TextRun({ text: `\t${section.page}`, size: 20, color: MUTED }),
            ],
          }),
        ],
      }),
  )

  return [
    new Paragraph({ heading: HeadingLevel.HEADING_1, text: 'Contents' }),
    ...entries,
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

interface RenderState {
  listInstance: number
}

function renderSection(
  section: DocumentSection,
  contentWidth: number,
  state: RenderState,
): Array<Paragraph | Table> {
  const output: Array<Paragraph | Table> = [
    new Paragraph({
      heading: section.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
      children: [
        new Bookmark({
          id: bookmarkId(section.id),
          children: [
            new TextRun({ text: `${section.number}.  `, color: PRIMARY }),
            new TextRun({ text: section.title }),
          ],
        }),
      ],
    }),
  ]

  if (section.description) {
    output.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: section.description, italics: true, size: 19, color: MUTED })],
      }),
    )
  }

  for (const block of section.blocks) {
    output.push(...renderBlock(block, contentWidth, state))
  }

  return output
}

function renderBlock(
  block: DocBlock,
  contentWidth: number,
  state: RenderState,
): Array<Paragraph | Table> {
  switch (block.type) {
    case 'heading':
      return [
        new Paragraph({
          heading: block.level === 3 ? HeadingLevel.HEADING_3 : HeadingLevel.HEADING_4,
          text: block.text,
        }),
      ]

    case 'paragraph':
      return [
        new Paragraph({
          spacing: { after: 160 },
          children: runs(block.text, {
            size: block.variant === 'lead' ? 23 : 21,
            color: block.variant === 'muted' ? MUTED : BODY,
            italics: block.variant === 'muted',
          }),
        }),
      ]

    case 'list': {
      state.listInstance += 1
      return block.items.map(
        (item) =>
          new Paragraph({
            numbering: {
              reference: block.ordered ? NUMBER_REFERENCE : BULLET_REFERENCE,
              level: 0,
              instance: state.listInstance,
            },
            spacing: { after: 40 },
            children: runs(item, { size: 21, color: BODY }),
          }),
      )
    }

    case 'fields':
      return block.items.flatMap((item) => {
        const label = new Paragraph({
          spacing: { before: 120, after: 20 },
          children: [
            new TextRun({ text: item.label.toUpperCase(), bold: true, size: 16, color: MUTED }),
          ],
        })

        if (item.bullets) {
          state.listInstance += 1
          const instance = state.listInstance
          return [
            label,
            ...item.bullets.map(
              (bullet) =>
                new Paragraph({
                  numbering: { reference: BULLET_REFERENCE, level: 0, instance },
                  spacing: { after: 40 },
                  children: runs(bullet, { size: 21, color: BODY }),
                }),
            ),
          ]
        }

        return [
          label,
          new Paragraph({
            spacing: { after: 100 },
            children: runs(item.value, {
              size: 21,
              color: item.empty ? MUTED : BODY,
              italics: item.empty,
            }),
          }),
        ]
      })

    case 'table':
      return renderTable(block, contentWidth)

    case 'callout':
      return [renderCallout(block)]

    case 'divider':
      return [
        new Paragraph({
          spacing: { before: 160, after: 160 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RULE, space: 4 } },
          children: [],
        }),
      ]

    case 'pageBreak':
      return [new Paragraph({ children: [new PageBreak()] })]

    case 'empty':
      return [
        new Paragraph({
          spacing: { after: 160 },
          children: [new TextRun({ text: block.text, italics: true, size: 20, color: MUTED })],
        }),
      ]
  }
}

function renderTable(
  block: Extract<DocBlock, { type: 'table' }>,
  contentWidth: number,
): Array<Paragraph | Table> {
  const weights = block.columns.map((column) => column.width ?? 1)
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1
  const columnWidths = weights.map((weight) => Math.round((weight / total) * contentWidth))

  const header = new TableRow({
    tableHeader: true,
    children: block.columns.map((column) =>
      cell(
        [
          new Paragraph({
            alignment: column.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
            children: [
              new TextRun({ text: column.header.toUpperCase(), bold: true, size: 16, color: MUTED }),
            ],
          }),
        ],
        { shading: SURFACE },
      ),
    ),
  })

  const rows = block.rows.map(
    (row) =>
      new TableRow({
        children: row.map((value, index) =>
          cell([
            new Paragraph({
              alignment:
                block.columns[index]?.align === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
              children: runs(value, { size: 19, color: BODY }),
            }),
          ]),
        ),
      }),
  )

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths,
    borders: tableBorders(),
    rows: [header, ...rows],
  })

  const caption = block.caption
    ? [
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({ text: block.caption.toUpperCase(), bold: true, size: 16, color: MUTED }),
          ],
        }),
      ]
    : []

  return [...caption, table, new Paragraph({ spacing: { after: 160 }, children: [] })]
}

function renderCallout(block: Extract<DocBlock, { type: 'callout' }>): Table {
  const colours = CALLOUT_COLOURS[block.tone]

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: colours.text },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: colours.text },
      left: { style: BorderStyle.SINGLE, size: 18, color: colours.text },
      right: { style: BorderStyle.SINGLE, size: 4, color: colours.text },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    },
    rows: [
      new TableRow({
        children: [
          cell(
            [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: (block.title ?? colours.label).toUpperCase(),
                    bold: true,
                    size: 16,
                    color: colours.text,
                  }),
                ],
              }),
              new Paragraph({ children: runs(block.text, { size: 20, color: INK }) }),
            ],
            { shading: colours.fill },
          ),
        ],
      }),
    ],
  })
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function cell(children: Paragraph[], options?: { shading?: string }): TableCell {
  return new TableCell({
    children,
    verticalAlign: VerticalAlign.TOP,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    shading: options?.shading
      ? { type: ShadingType.CLEAR, fill: options.shading, color: 'auto' }
      : undefined,
  })
}

function tableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    left: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    right: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: RULE },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: RULE },
  }
}

type RunStyle = Pick<
  NonNullable<IParagraphOptions['run']>,
  'size' | 'color' | 'italics' | 'bold'
>

/**
 * Word has no soft-wrap equivalent of a newline inside a run, so multi-line
 * answers are split into separate runs with explicit breaks.
 */
function runs(text: DocText, style: RunStyle): TextRun[] {
  return toSpans(text).flatMap((span) => {
    const lines = span.text.split(/\r?\n/)
    return lines.map(
      (line, index) =>
        new TextRun({
          text: line,
          break: index > 0 ? 1 : undefined,
          bold: span.bold ?? style.bold,
          italics: span.italic ?? style.italics,
          size: style.size,
          color: style.color,
        }),
    )
  })
}

function plain(text: DocText): string {
  return toSpans(text)
    .map((span) => span.text)
    .join('')
}

/** Word bookmark names must not contain punctuation beyond underscores. */
function bookmarkId(sectionId: string): string {
  return `rs_${sectionId.replace(/[^A-Za-z0-9]/g, '_')}`
}
