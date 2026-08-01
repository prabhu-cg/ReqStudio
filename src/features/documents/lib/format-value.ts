import { format as formatDate, isValid, parseISO } from 'date-fns'
import type { FieldDef, FieldValue, RepeaterSubFieldDef } from '@/types/field'
import type { DateFormatPattern, DocText } from '@/types/document'
import { isEmptyValue } from '@/lib/fields/value'

/**
 * Field value → document text.
 *
 * The single place that decides how a stored value reads in a finished
 * document, shared by the preview and all four exporters.
 */

export function formatDocDate(
  value: string | null | undefined,
  pattern: DateFormatPattern,
): string {
  if (!value) return ''
  const date = value.includes('T') ? new Date(value) : parseISO(value)
  return isValid(date) ? formatDate(date, pattern) : ''
}

/** Field kinds that read well inside a table cell. */
const COMPACT_KINDS = new Set<FieldDef['kind']>([
  'text',
  'number',
  'date',
  'select',
  'switch',
  'tags',
  'multiselect',
])

export function isCompactField(field: FieldDef): boolean {
  return COMPACT_KINDS.has(field.kind)
}

/** Fields whose value is a bullet list rather than a single value. */
export function isListField(field: FieldDef): boolean {
  return field.kind === 'list'
}

/**
 * Switches always render, because "No" is an answer a reader needs. Everything
 * else renders only when the user has filled it in.
 */
export function hasDocValue(field: FieldDef, value: FieldValue): boolean {
  if (field.kind === 'switch') return true
  if (field.kind === 'repeater') return Array.isArray(value) && value.length > 0
  return !isEmptyValue(value)
}

/** Relative column width for a field rendered as a table column. */
export function columnWidth(field: RepeaterSubFieldDef): number {
  switch (field.kind) {
    case 'textarea':
      return 2.6
    case 'list':
      return 2.2
    case 'text':
      return 1.5
    case 'multiselect':
    case 'tags':
      return 1.3
    case 'number':
    case 'date':
      return 0.9
    default:
      return 1
  }
}

/**
 * Renders a scalar field value.
 *
 * List-shaped values are joined rather than bulleted — callers that want
 * bullets ask for them explicitly with `valueToBullets`.
 */
export function valueToText(
  field: FieldDef,
  value: FieldValue,
  dateFormat: DateFormatPattern,
): string {
  if (field.kind === 'switch') return value === true ? 'Yes' : 'No'
  if (isEmptyValue(value)) return ''

  switch (field.kind) {
    case 'date':
      return formatDocDate(String(value), dateFormat)

    case 'number': {
      const suffix = 'suffix' in field && field.suffix ? ` ${field.suffix}` : ''
      return `${String(value)}${suffix}`
    }

    case 'select': {
      const option = field.options.find((candidate) => candidate.value === value)
      return option?.label ?? String(value)
    }

    case 'multiselect': {
      const values = Array.isArray(value) ? (value as string[]) : []
      return values
        .map((item) => field.options.find((option) => option.value === item)?.label ?? item)
        .join(', ')
    }

    case 'tags':
    case 'list': {
      const values = Array.isArray(value) ? (value as string[]) : []
      return values.filter(Boolean).join(', ')
    }

    case 'repeater':
      return ''

    default:
      return String(value)
  }
}

/** Bullet items for a list-shaped field, or null when it holds nothing. */
export function valueToBullets(field: FieldDef, value: FieldValue): DocText[] | null {
  if (field.kind !== 'list' && field.kind !== 'tags' && field.kind !== 'multiselect') return null
  const values = Array.isArray(value) ? (value as string[]) : []
  const items = values.filter((item) => typeof item === 'string' && item.trim())
  return items.length > 0 ? items : null
}

/** Bullet items for a plain `string[]` — used by the page sections. */
export function stringsToBullets(values: string[] | undefined): DocText[] | null {
  const items = (values ?? []).filter((item) => item.trim())
  return items.length > 0 ? items : null
}
