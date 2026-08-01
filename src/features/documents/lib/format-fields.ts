import type { FieldDef, RepeaterRow, RepeaterSubFieldDef, SectionValues } from '@/types/field'
import type { DateFormatPattern, DocBlock, DocFieldItem, DocTableColumn, DocText } from '@/types/document'
import { isRowEmpty, withDefaults } from '@/lib/fields/value'
import { compact, fields as fieldsBlock, heading, table } from './blocks'
import {
  columnWidth,
  hasDocValue,
  isCompactField,
  valueToBullets,
  valueToText,
} from './format-value'

/**
 * Section fields → document blocks.
 *
 * Driven entirely by the field descriptors, so a section added in a later phase
 * appears in the preview and in every export with no extra work. Repeaters are
 * the interesting case: they become tables where the columns fit, and a summary
 * table plus per-row detail where they do not.
 */

/** A repeater becomes a single table when at most one column holds long text. */
const MAX_LONG_COLUMNS_FOR_TABLE = 1
/** Below this, a summary table above the detail blocks is not worth the space. */
const MIN_COLUMNS_FOR_SUMMARY = 2

export interface FormatContext {
  dateFormat: DateFormatPattern
  /** Render fields the user left blank, marked as not provided. */
  includeEmpty: boolean
}

export function fieldsToBlocks(
  defs: readonly FieldDef[],
  rawValues: SectionValues | undefined,
  context: FormatContext,
): DocBlock[] {
  const values = withDefaults(defs, rawValues)
  const blocks: DocBlock[] = []
  let group: DocFieldItem[] = []

  // A switch that is off is a real answer worth printing — but only once the
  // section says something else. Otherwise an untouched section would render as
  // a list of "No"s and count as completed.
  let hasRealContent = false
  const pendingSwitches: DocFieldItem[] = []

  const flush = () => {
    if (group.length > 0) {
      blocks.push(fieldsBlock(group))
      group = []
    }
  }

  for (const field of defs) {
    const value = values[field.name]

    if (field.kind === 'repeater') {
      const rows = (Array.isArray(value) ? (value as RepeaterRow[]) : []).filter(
        (row) => !isRowEmpty(row),
      )
      if (rows.length === 0) {
        if (context.includeEmpty) {
          group.push({ label: field.label, value: 'Not provided', empty: true })
        }
        continue
      }
      flush()
      hasRealContent = true
      blocks.push(...repeaterToBlocks(field, rows, context))
      continue
    }

    if (field.kind === 'switch') {
      const item = { label: field.label, value: valueToText(field, value, context.dateFormat) }
      if (value === true) {
        hasRealContent = true
        group.push(item)
      } else {
        pendingSwitches.push(item)
      }
      continue
    }

    if (!hasDocValue(field, value)) {
      if (context.includeEmpty) {
        group.push({ label: field.label, value: 'Not provided', empty: true })
      }
      continue
    }

    hasRealContent = true

    const bullets = valueToBullets(field, value)
    if (bullets) {
      group.push({ label: field.label, value: '', bullets })
      continue
    }

    group.push({ label: field.label, value: valueToText(field, value, context.dateFormat) })
  }

  if (hasRealContent || context.includeEmpty) group.push(...pendingSwitches)

  flush()
  return compact(blocks)
}

/* -------------------------------------------------------------------------- */
/* Repeaters                                                                   */
/* -------------------------------------------------------------------------- */

function repeaterToBlocks(
  field: Extract<FieldDef, { kind: 'repeater' }>,
  rows: RepeaterRow[],
  context: FormatContext,
): DocBlock[] {
  const longFields = field.fields.filter((sub) => !isCompactField(sub))

  if (longFields.length <= MAX_LONG_COLUMNS_FOR_TABLE) {
    return [buildTable(field.label, field.fields, rows, context)]
  }

  const compactFields = field.fields.filter(isCompactField)
  const blocks: DocBlock[] = []

  if (compactFields.length >= MIN_COLUMNS_FOR_SUMMARY) {
    blocks.push(buildTable(field.label, compactFields, rows, context))
  }

  // Long-form detail per row. Compact values already appear in the summary
  // table above, so repeating them here would only pad the document.
  const detailFields = compactFields.length >= MIN_COLUMNS_FOR_SUMMARY ? longFields : field.fields

  for (const [index, row] of rows.entries()) {
    const items = rowToItems(detailFields, row, context)
    if (items.length === 0) continue
    blocks.push(heading(rowTitle(field, row, index), 4))
    blocks.push(fieldsBlock(items))
  }

  return blocks
}

function buildTable(
  caption: string,
  subFields: readonly RepeaterSubFieldDef[],
  rows: RepeaterRow[],
  context: FormatContext,
): DocBlock {
  // Columns nobody filled in are dropped so the table stays readable.
  const used = subFields.filter((sub) =>
    rows.some((row) => {
      const text = valueToText(sub, row[sub.name] ?? null, context.dateFormat)
      return sub.kind === 'switch' ? true : text.trim() !== ''
    }),
  )
  const columns: DocTableColumn[] = used.map((sub) => ({
    header: sub.label,
    width: columnWidth(sub),
    align: sub.kind === 'number' ? 'right' : 'left',
  }))

  const cells: DocText[][] = rows.map((row) =>
    used.map((sub) => valueToText(sub, row[sub.name] ?? null, context.dateFormat)),
  )

  return table(columns, cells, caption)
}

function rowToItems(
  subFields: readonly RepeaterSubFieldDef[],
  row: RepeaterRow,
  context: FormatContext,
): DocFieldItem[] {
  const items: DocFieldItem[] = []

  for (const sub of subFields) {
    const value = row[sub.name] ?? null
    if (!hasDocValue(sub, value)) {
      if (context.includeEmpty) items.push({ label: sub.label, value: 'Not provided', empty: true })
      continue
    }
    const bullets = valueToBullets(sub, value)
    if (bullets) {
      items.push({ label: sub.label, value: '', bullets })
      continue
    }
    items.push({ label: sub.label, value: valueToText(sub, value, context.dateFormat) })
  }

  return items
}

function rowTitle(
  field: Extract<FieldDef, { kind: 'repeater' }>,
  row: RepeaterRow,
  index: number,
): string {
  const title = row[field.titleField]
  const text = typeof title === 'string' ? title.trim() : ''
  return text || `${field.itemLabel} ${index + 1}`
}
