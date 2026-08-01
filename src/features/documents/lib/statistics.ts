import type { DocBlock, DocumentSection, DocumentStatistics } from '@/types/document'
import { plainText } from './blocks'

/** Counts words and characters across a block's visible text. */
function blockText(block: DocBlock): string {
  switch (block.type) {
    case 'heading':
      return block.text
    case 'paragraph':
      return plainText(block.text)
    case 'list':
      return block.items.map(plainText).join(' ')
    case 'fields':
      return block.items
        .map((item) =>
          [item.label, item.bullets ? item.bullets.map(plainText).join(' ') : plainText(item.value)].join(' '),
        )
        .join(' ')
    case 'table':
      return [
        block.caption ?? '',
        ...block.columns.map((column) => column.header),
        ...block.rows.flatMap((row) => row.map(plainText)),
      ].join(' ')
    case 'callout':
      return [block.title ?? '', plainText(block.text)].join(' ')
    case 'empty':
      return block.text
    case 'divider':
    case 'pageBreak':
      return ''
  }
}

/** All readable text in a section — powers preview search. */
export function sectionText(section: DocumentSection): string {
  return [section.title, section.description ?? '', ...section.blocks.map(blockText)].join(' ')
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export function computeStatistics(
  sections: DocumentSection[],
  pageCount: number,
  projectPages: number,
  completion: number,
): DocumentStatistics {
  let words = 0
  let characters = 0
  let tables = 0

  for (const section of sections) {
    words += countWords(section.title)
    characters += section.title.length

    for (const block of section.blocks) {
      if (block.type === 'table') tables += 1
      const text = blockText(block)
      words += countWords(text)
      characters += text.length
    }
  }

  return {
    sections: sections.length,
    completedSections: sections.filter((section) => !section.isEmpty).length,
    pages: pageCount,
    projectPages,
    words,
    characters,
    tables,
    completion,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Rough download size for a format, before it exists.
 *
 * Deliberately coarse — it exists to set expectations on the export cards, not
 * to be accurate to the byte.
 */
const BYTES_PER_CHARACTER: Record<string, number> = {
  pdf: 2.6,
  docx: 1.4,
  markdown: 1.1,
  html: 1.9,
}

const BASE_BYTES: Record<string, number> = {
  pdf: 18_000,
  docx: 11_000,
  markdown: 400,
  html: 9_000,
}

export function estimateFileSize(format: string, statistics: DocumentStatistics): number {
  const base = BASE_BYTES[format] ?? 4_000
  const perCharacter = BYTES_PER_CHARACTER[format] ?? 1.5
  return Math.round(base + statistics.characters * perCharacter)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
