import type {
  CalloutTone,
  DocBlock,
  DocFieldItem,
  DocSpan,
  DocTableColumn,
  DocText,
  DocumentSection,
} from '@/types/document'

/**
 * Block constructors and inline-text helpers.
 *
 * Every renderer works in terms of these, so a change to the shape of a block
 * is a change in one place rather than five.
 */

/* -------------------------------------------------------------------------- */
/* Inline text                                                                 */
/* -------------------------------------------------------------------------- */

/** Normalises either representation to spans. */
export function toSpans(value: DocText): DocSpan[] {
  return typeof value === 'string' ? [{ text: value }] : value
}

/** Flattens to plain text — used for word counts, search and PDF measurement. */
export function plainText(value: DocText): string {
  return typeof value === 'string' ? value : value.map((span) => span.text).join('')
}

export function bold(text: string): DocSpan {
  return { text, bold: true }
}

export function italic(text: string): DocSpan {
  return { text, italic: true }
}

export function isBlankText(value: DocText): boolean {
  return plainText(value).trim() === ''
}

/* -------------------------------------------------------------------------- */
/* Block constructors                                                          */
/* -------------------------------------------------------------------------- */

export function heading(text: string, level: 3 | 4 = 3): DocBlock {
  return { type: 'heading', level, text }
}

export function paragraph(
  text: DocText,
  variant: 'body' | 'lead' | 'muted' = 'body',
): DocBlock {
  return { type: 'paragraph', text, variant }
}

export function bullets(items: DocText[]): DocBlock {
  return { type: 'list', ordered: false, items }
}

export function numbered(items: DocText[]): DocBlock {
  return { type: 'list', ordered: true, items }
}

export function fields(items: DocFieldItem[]): DocBlock {
  return { type: 'fields', items }
}

export function table(
  columns: DocTableColumn[],
  rows: DocText[][],
  caption?: string,
): DocBlock {
  return { type: 'table', columns, rows, caption }
}

export function callout(tone: CalloutTone, text: DocText, title?: string): DocBlock {
  return { type: 'callout', tone, text, title }
}

export const divider: DocBlock = { type: 'divider' }
export const pageBreak: DocBlock = { type: 'pageBreak' }

export function empty(text = 'Not completed.'): DocBlock {
  return { type: 'empty', text }
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

export interface SectionInput {
  id: string
  number: string
  title: string
  level?: 1 | 2
  description?: string
  completion?: number
  blocks: DocBlock[]
}

/**
 * A section is empty when it carries no content block. Headings and dividers do
 * not count — a section holding only a heading has nothing to say.
 */
const CONTENT_BLOCKS = new Set<DocBlock['type']>([
  'paragraph',
  'list',
  'fields',
  'table',
  'callout',
])

export function section(input: SectionInput): DocumentSection {
  return {
    id: input.id,
    number: input.number,
    title: input.title,
    level: input.level ?? 1,
    description: input.description,
    completion: input.completion,
    blocks: input.blocks,
    isEmpty: !input.blocks.some((block) => CONTENT_BLOCKS.has(block.type)),
    // Assigned by the paginator once the whole document is assembled.
    page: 1,
  }
}

/** Drops blocks that ended up with nothing in them. */
export function compact(blocks: Array<DocBlock | null | undefined>): DocBlock[] {
  return blocks.filter((block): block is DocBlock => {
    if (!block) return false
    if (block.type === 'list') return block.items.length > 0
    if (block.type === 'fields') return block.items.length > 0
    if (block.type === 'table') return block.rows.length > 0
    if (block.type === 'paragraph') return !isBlankText(block.text)
    if (block.type === 'callout') return !isBlankText(block.text)
    return true
  })
}
