import type { PDFFont } from 'pdf-lib'

/**
 * Text preparation for the PDF engine.
 *
 * The standard PDF fonts are limited to WinAnsi, and `drawText` throws on any
 * character outside it. Briefs are written by people who paste arrows, bullets
 * and the occasional emoji, so everything is transliterated to something
 * printable before it reaches pdf-lib.
 */

/** Characters worth spelling out rather than dropping. */
const TRANSLITERATIONS: Record<string, string> = {
  '→': '->',
  '⟶': '->',
  '←': '<-',
  '↔': '<->',
  '⇒': '=>',
  '⇐': '<=',
  '≥': '>=',
  '≤': '<=',
  '≠': '!=',
  '≈': '~',
  '×': 'x',
  '÷': '/',
  '✓': 'Yes',
  '✔': 'Yes',
  '✗': 'No',
  '✘': 'No',
  '★': '*',
  '☆': '*',
  '№': 'No.',
  ' ': ' ',
  '​': '',
}

/**
 * The typographic characters cp1252 maps into its 0x80–0x9F block.
 *
 * These are worth keeping rather than transliterating: em dashes and curly
 * quotes are most of what makes a document look typeset rather than typed.
 */
const WINANSI_EXTRAS = new Set([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160,
  0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
])

/** WinAnsi covers Latin-1 plus the cp1252 extras above. */
function isEncodable(codePoint: number): boolean {
  if (codePoint === 0x0a) return true
  if (codePoint >= 0x20 && codePoint <= 0x7e) return true
  if (codePoint >= 0xa1 && codePoint <= 0xff) return true
  return WINANSI_EXTRAS.has(codePoint)
}

export function sanitise(value: string): string {
  let result = ''

  for (const character of value) {
    const replacement = TRANSLITERATIONS[character]
    if (replacement !== undefined) {
      result += replacement
      continue
    }

    const codePoint = character.codePointAt(0) ?? 0
    if (isEncodable(codePoint)) {
      result += character
      continue
    }

    // Combining marks and zero-width joiners are dropped silently; anything
    // else leaves a visible marker so the omission is not mistaken for content.
    if (codePoint >= 0x0300 && codePoint <= 0x036f) continue
    if (codePoint === 0x200d || codePoint === 0xfe0f) continue
    result += '?'
  }

  return result
}

/** Normalises whitespace that would otherwise measure oddly. */
export function normaliseWhitespace(value: string): string {
  return sanitise(value).replace(/\t/g, '    ').replace(/\r\n?/g, '\n')
}

export function textWidth(text: string, font: PDFFont, size: number): number {
  return font.widthOfTextAtSize(text, size)
}

/**
 * Greedy word wrap.
 *
 * Explicit newlines always break. A single word longer than the line — a URL,
 * usually — is split rather than allowed to overflow the margin.
 */
export function wrapText(
  value: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string[] {
  const lines: string[] = []

  for (const paragraph of normaliseWhitespace(value).split('\n')) {
    if (paragraph.trim() === '') {
      lines.push('')
      continue
    }

    let line = ''

    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word

      if (textWidth(candidate, font, size) <= maxWidth) {
        line = candidate
        continue
      }

      if (line) lines.push(line)

      if (textWidth(word, font, size) <= maxWidth) {
        line = word
        continue
      }

      // Break the oversized word across as many lines as it needs.
      let chunk = ''
      for (const character of word) {
        if (textWidth(chunk + character, font, size) > maxWidth && chunk) {
          lines.push(chunk)
          chunk = character
        } else {
          chunk += character
        }
      }
      line = chunk
    }

    if (line) lines.push(line)
  }

  return lines.length > 0 ? lines : ['']
}

/** Shortens to fit, with an ellipsis. Used for running headers. */
export function truncateToWidth(
  value: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
): string {
  const clean = sanitise(value)
  if (textWidth(clean, font, size) <= maxWidth) return clean

  let result = ''
  for (const character of clean) {
    if (textWidth(`${result}${character}...`, font, size) > maxWidth) break
    result += character
  }
  return `${result.trimEnd()}...`
}
