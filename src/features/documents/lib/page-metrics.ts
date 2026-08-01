import type { MarginPreset, PageSize } from '@/types/document'

/**
 * Page geometry in PostScript points.
 *
 * Shared by the paginator (which estimates page numbers for the preview, HTML
 * and Word) and the PDF layout engine (which lays out for real), so the page
 * count quoted in the UI matches what comes out of the exporter.
 */

export interface PageDimensions {
  width: number
  height: number
}

export const PAGE_DIMENSIONS: Record<PageSize, PageDimensions> = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
}

export const MARGIN_VALUES: Record<MarginPreset, number> = {
  narrow: 42.5,
  normal: 56.7,
  wide: 85,
}

export const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  a4: 'A4 (210 × 297 mm)',
  letter: 'US Letter (8.5 × 11 in)',
}

export const MARGIN_LABELS: Record<MarginPreset, string> = {
  narrow: 'Narrow (15 mm)',
  normal: 'Normal (20 mm)',
  wide: 'Wide (30 mm)',
}

/** Reserved strips at the top and bottom of every body page. */
export const HEADER_HEIGHT = 34
export const FOOTER_HEIGHT = 34

/**
 * The document type scale, in points.
 *
 * Shared by the PDF engine, which draws at these sizes, and the paginator,
 * which measures at them. One scale means the estimated page count in the UI
 * tracks the real one instead of drifting away from it.
 */
export const TYPE_SCALE = {
  h1: 19,
  h2: 14,
  h3: 11.5,
  h4: 10.5,
  lead: 11.5,
  body: 10.5,
  small: 9,
  micro: 7.5,
} as const

export const LEADING = 1.42

/** Average glyph width as a fraction of the font size, for Helvetica-like faces. */
export const AVERAGE_GLYPH_RATIO = 0.5

/** Rough line count for `text` set at `size` across `width` points. */
export function estimateLines(text: string, size: number, width: number): number {
  const clean = text.trim()
  if (!clean) return 0
  const charsPerLine = Math.max(8, Math.floor(width / (size * AVERAGE_GLYPH_RATIO)))
  return clean
    .split('\n')
    .reduce((total, line) => total + Math.max(1, Math.ceil(line.length / charsPerLine)), 0)
}

export interface Geometry {
  page: PageDimensions
  margin: number
  contentWidth: number
  contentTop: number
  contentBottom: number
  contentHeight: number
}

export function geometryFor(
  pageSize: PageSize,
  margins: MarginPreset,
  options: { headers: boolean; footers: boolean },
): Geometry {
  const page = PAGE_DIMENSIONS[pageSize]
  const margin = MARGIN_VALUES[margins]
  const top = page.height - margin - (options.headers ? HEADER_HEIGHT : 0)
  const bottom = margin + (options.footers ? FOOTER_HEIGHT : 0)

  return {
    page,
    margin,
    contentWidth: page.width - margin * 2,
    contentTop: top,
    contentBottom: bottom,
    contentHeight: top - bottom,
  }
}
