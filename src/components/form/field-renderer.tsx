import { useController, type Control, type FieldError, type FieldValues } from 'react-hook-form'
import { ScalarField } from './scalar-field'
import { RepeaterInput } from './repeater-input'
import type { FieldDef, FieldValue, RepeaterRow } from '@/types/field'
import { cn } from '@/lib/utils/cn'

type RowErrors = Array<Record<string, string | undefined> | undefined>

/** RHF stores array-field errors as a sparse array of per-row error maps. */
function extractRowErrors(error: unknown): RowErrors | undefined {
  if (!Array.isArray(error)) return undefined
  return error.map((rowError) => {
    if (!rowError || typeof rowError !== 'object') return undefined
    const entries = Object.entries(rowError as Record<string, FieldError | undefined>)
    return Object.fromEntries(entries.map(([key, value]) => [key, value?.message]))
  })
}

function extractMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || Array.isArray(error)) return undefined
  const message = (error as FieldError).message
  return typeof message === 'string' ? message : undefined
}

export interface FieldRendererProps {
  field: FieldDef
  control: Control<FieldValues>
}

/** Binds one field descriptor to react-hook-form. */
export function FieldRenderer({ field, control }: FieldRendererProps) {
  const { field: controlled, fieldState } = useController({ name: field.name, control })

  if (field.kind === 'repeater') {
    return (
      <RepeaterInput
        field={field}
        value={(controlled.value ?? []) as RepeaterRow[]}
        onChange={controlled.onChange}
        errors={extractRowErrors(fieldState.error)}
        error={extractMessage(fieldState.error)}
      />
    )
  }

  return (
    <ScalarField
      field={field}
      value={controlled.value as FieldValue}
      onChange={controlled.onChange}
      onBlur={controlled.onBlur}
      error={extractMessage(fieldState.error)}
    />
  )
}

export interface FieldGridProps {
  fields: readonly FieldDef[]
  control: Control<FieldValues>
  className?: string
}

/** Two-column responsive layout honouring each field's `span`. */
export function FieldGrid({ fields, control, className }: FieldGridProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-5 lg:grid-cols-2', className)}>
      {fields.map((field) => (
        <div
          key={field.name}
          className={cn(
            'min-w-0',
            (field.span === 2 || field.kind === 'repeater') && 'lg:col-span-2',
          )}
        >
          <FieldRenderer field={field} control={control} />
        </div>
      ))}
    </div>
  )
}
