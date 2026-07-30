import type { FieldDef, FieldValue, RepeaterRow, SectionValues } from '@/types/field'

/** The value a field holds before the user touches it. */
export function emptyValue(field: FieldDef): FieldValue {
  switch (field.kind) {
    case 'number':
      return ''
    case 'switch':
      return false
    case 'tags':
    case 'list':
    case 'multiselect':
      return []
    case 'repeater':
      return []
    default:
      return ''
  }
}

/** A blank row for a repeater field. */
export function emptyRow(field: Extract<FieldDef, { kind: 'repeater' }>): RepeaterRow {
  const row: RepeaterRow = {}
  for (const sub of field.fields) {
    row[sub.name] = emptyValue(sub) as RepeaterRow[string]
  }
  return row
}

export function isEmptyValue(value: FieldValue): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (typeof value === 'number') return Number.isNaN(value)
  if (typeof value === 'boolean') return value === false
  if (Array.isArray(value)) {
    if (value.length === 0) return true
    return value.every((item) =>
      typeof item === 'string' ? item.trim() === '' : isRowEmpty(item),
    )
  }
  return false
}

/** A repeater row is empty when none of its cells hold anything meaningful. */
export function isRowEmpty(row: RepeaterRow | null | undefined): boolean {
  if (!row || typeof row !== 'object') return true
  return Object.values(row).every((cell) => isEmptyValue(cell as FieldValue))
}

/**
 * A switch counts as answered only when it is on — an untouched switch and a
 * deliberate "no" are indistinguishable, so we do not award completion for it.
 */
export function isFieldAnswered(field: FieldDef, value: FieldValue): boolean {
  if (field.kind === 'switch') return value === true
  return !isEmptyValue(value)
}

/** Fill in missing keys so react-hook-form always receives a controlled shape. */
export function withDefaults(
  fields: readonly FieldDef[],
  values: SectionValues | undefined,
): SectionValues {
  const result: SectionValues = { ...values }
  for (const field of fields) {
    if (result[field.name] === undefined || result[field.name] === null) {
      result[field.name] = emptyValue(field)
    }
  }
  return result
}

/** Drop blank list/tag entries and fully-blank repeater rows before persisting. */
export function pruneValues(fields: readonly FieldDef[], values: SectionValues): SectionValues {
  const result: SectionValues = {}
  for (const field of fields) {
    const value = values[field.name]
    if (field.kind === 'tags' || field.kind === 'list' || field.kind === 'multiselect') {
      result[field.name] = Array.isArray(value)
        ? (value as string[]).map((v) => (typeof v === 'string' ? v.trim() : v)).filter(Boolean)
        : []
      continue
    }
    if (field.kind === 'repeater') {
      const rows = Array.isArray(value) ? (value as RepeaterRow[]) : []
      result[field.name] = rows.filter((row) => !isRowEmpty(row))
      continue
    }
    if (typeof value === 'string') {
      result[field.name] = value
      continue
    }
    result[field.name] = value ?? emptyValue(field)
  }
  return result
}
