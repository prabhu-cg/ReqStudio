import type { FieldDef, SectionValues } from '@/types/field'
import { isFieldAnswered } from './value'

/** Required fields count double so an unanswered "must have" hurts the score more. */
const REQUIRED_WEIGHT = 2
const OPTIONAL_WEIGHT = 1

export interface FieldCompletionResult {
  completed: number
  total: number
  missingRequired: string[]
  missingOptional: string[]
}

export function scoreFields(
  fields: readonly FieldDef[],
  values: SectionValues,
): FieldCompletionResult {
  let completed = 0
  let total = 0
  const missingRequired: string[] = []
  const missingOptional: string[] = []

  for (const field of fields) {
    if (field.scored === false) continue

    const weight = field.required ? REQUIRED_WEIGHT : OPTIONAL_WEIGHT
    total += weight

    if (isFieldAnswered(field, values[field.name])) {
      completed += weight
    } else if (field.required) {
      missingRequired.push(field.label)
    } else {
      missingOptional.push(field.label)
    }
  }

  return { completed, total, missingRequired, missingOptional }
}

export function toPercent(completed: number, total: number): number {
  if (total <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)))
}
