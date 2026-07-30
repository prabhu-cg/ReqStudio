import { z } from 'zod'
import type { FieldDef, RepeaterSubFieldDef, SectionValues } from '@/types/field'

/**
 * Builds a Zod schema from field descriptors.
 *
 * The schema is intentionally permissive about *emptiness* for optional fields —
 * a brief is filled in over time and must never be blocked by half-finished
 * sections. Required fields are enforced, and format rules (numeric ranges,
 * lengths, dates) always apply once a value exists.
 */

function requiredMessage(label: string): string {
  return `${label} is required`
}

function stringSchema(field: { required?: boolean; label: string; maxLength?: number }) {
  let schema = z.string()
  if (field.maxLength) {
    schema = schema.max(field.maxLength, `${field.label} must be ${field.maxLength} characters or fewer`)
  }
  return field.required
    ? schema.trim().min(1, requiredMessage(field.label))
    : schema.optional().default('')
}

function numberSchema(field: {
  required?: boolean
  label: string
  min?: number
  max?: number
}) {
  const base = z.union([z.literal(''), z.coerce.number()]).transform((v) => (v === '' ? '' : v))

  return base.superRefine((value, ctx) => {
    if (value === '') {
      if (field.required) {
        ctx.addIssue({ code: 'custom', message: requiredMessage(field.label) })
      }
      return
    }
    if (Number.isNaN(value)) {
      ctx.addIssue({ code: 'custom', message: `${field.label} must be a number` })
      return
    }
    if (field.min !== undefined && value < field.min) {
      ctx.addIssue({ code: 'custom', message: `${field.label} must be at least ${field.min}` })
    }
    if (field.max !== undefined && value > field.max) {
      ctx.addIssue({ code: 'custom', message: `${field.label} must be at most ${field.max}` })
    }
  })
}

function listSchema(field: { required?: boolean; label: string; minItems?: number }) {
  const min = field.minItems ?? (field.required ? 1 : 0)
  return z
    .array(z.string())
    .default([])
    .superRefine((items, ctx) => {
      const filled = items.filter((item) => item.trim().length > 0)
      if (filled.length < min) {
        ctx.addIssue({
          code: 'custom',
          message: min === 1 ? requiredMessage(field.label) : `Add at least ${min} ${field.label.toLowerCase()}`,
        })
      }
    })
}

function fieldSchema(field: RepeaterSubFieldDef): z.ZodTypeAny {
  switch (field.kind) {
    case 'text':
    case 'textarea':
    case 'date':
      return stringSchema(field)
    case 'select':
      return field.required
        ? z.string().min(1, requiredMessage(field.label))
        : z.string().optional().default('')
    case 'number':
      return numberSchema(field)
    case 'switch':
      return z.boolean().default(false)
    case 'tags':
    case 'list':
    case 'multiselect':
      return listSchema(field)
  }
}

/** Schemas produced here parse and emit `SectionValues`. */
export type SectionSchema = z.ZodType<SectionValues, SectionValues>

export function buildSectionSchema(fields: readonly FieldDef[]): SectionSchema {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    if (field.kind === 'repeater') {
      const rowShape: Record<string, z.ZodTypeAny> = {}
      for (const sub of field.fields) rowShape[sub.name] = fieldSchema(sub)

      const min = field.minItems ?? (field.required ? 1 : 0)
      let rows: z.ZodTypeAny = z.array(z.object(rowShape)).default([])
      if (min > 0) {
        rows = z
          .array(z.object(rowShape))
          .min(min, `Add at least ${min} ${field.itemLabel.toLowerCase()}`)
      }
      shape[field.name] = rows
      continue
    }
    shape[field.name] = fieldSchema(field)
  }

  return z.object(shape) as unknown as SectionSchema
}

/** Cached per field array so resolvers stay referentially stable across renders. */
const schemaCache = new WeakMap<readonly FieldDef[], SectionSchema>()

export function getSectionSchema(fields: readonly FieldDef[]): SectionSchema {
  const cached = schemaCache.get(fields)
  if (cached) return cached
  const schema = buildSectionSchema(fields)
  schemaCache.set(fields, schema)
  return schema
}
