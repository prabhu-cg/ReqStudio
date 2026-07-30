import { Input, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/primitives'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FieldShell } from './field-shell'
import { TagsInput } from './tags-input'
import { ListInput } from './list-input'
import { MultiSelectInput } from './multi-select-input'
import type { FieldValue, RepeaterSubFieldDef } from '@/types/field'
import { cn } from '@/lib/utils/cn'

export interface ScalarFieldProps {
  field: RepeaterSubFieldDef
  value: FieldValue
  onChange: (value: FieldValue) => void
  onBlur?: () => void
  error?: string
  /** Overrides the descriptor label — used to disambiguate repeater rows. */
  labelOverride?: string
  className?: string
}

function asString(value: FieldValue): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  return ''
}

function asArray(value: FieldValue): string[] {
  return Array.isArray(value) ? (value as string[]).filter((v) => typeof v === 'string') : []
}

/**
 * Renders one non-repeating field from its descriptor.
 *
 * This is the only place a field kind maps to a control, so every form in the
 * app — brief sections, page drawer, repeater rows — stays visually identical.
 */
export function ScalarField({
  field,
  value,
  onChange,
  onBlur,
  error,
  labelOverride,
  className,
}: ScalarFieldProps) {
  const label = labelOverride ?? field.label

  if (field.kind === 'switch') {
    return (
      <div
        className={cn(
          'flex items-start justify-between gap-4 rounded-[8px] border border-border bg-surface px-4 py-3',
          className,
        )}
      >
        <div className="min-w-0">
          <span className="text-sm font-medium">{label}</span>
          {field.help ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{field.help}</p>
          ) : null}
        </div>
        <Switch
          checked={value === true}
          onCheckedChange={(checked) => onChange(checked)}
          aria-label={label}
        />
      </div>
    )
  }

  return (
    <FieldShell
      label={label}
      help={field.help}
      error={error}
      required={field.required}
      className={className}
    >
      {({ inputId, describedBy }) => {
        const shared = {
          id: inputId,
          'aria-describedby': describedBy,
          'aria-invalid': Boolean(error) || undefined,
        }

        switch (field.kind) {
          case 'textarea':
            return (
              <Textarea
                {...shared}
                rows={field.rows ?? 3}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                value={asString(value)}
                onChange={(event) => onChange(event.target.value)}
                onBlur={onBlur}
              />
            )

          case 'number':
            return (
              <div className="flex items-center gap-2">
                <Input
                  {...shared}
                  type="number"
                  inputMode="numeric"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  placeholder={field.placeholder}
                  value={asString(value)}
                  onChange={(event) =>
                    onChange(event.target.value === '' ? '' : Number(event.target.value))
                  }
                  onBlur={onBlur}
                />
                {field.suffix ? (
                  <span className="shrink-0 text-sm text-muted-foreground">{field.suffix}</span>
                ) : null}
              </div>
            )

          case 'date':
            return (
              <Input
                {...shared}
                type="date"
                value={asString(value)}
                onChange={(event) => onChange(event.target.value)}
                onBlur={onBlur}
              />
            )

          case 'select':
            return (
              <Select
                value={asString(value) || undefined}
                onValueChange={(next) => onChange(next)}
              >
                <SelectTrigger {...shared} aria-label={label}>
                  <SelectValue placeholder={field.placeholder ?? 'Select…'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      description={option.description}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )

          case 'multiselect':
            return (
              <MultiSelectInput
                {...shared}
                options={field.options}
                value={asArray(value)}
                onChange={(next) => onChange(next)}
              />
            )

          case 'tags':
            return (
              <TagsInput
                {...shared}
                placeholder={field.placeholder}
                suggestions={field.suggestions}
                value={asArray(value)}
                onChange={(next) => onChange(next)}
                onBlur={onBlur}
              />
            )

          case 'list':
            return (
              <ListInput
                {...shared}
                itemLabel={field.itemLabel}
                placeholder={field.placeholder}
                value={asArray(value)}
                onChange={(next) => onChange(next)}
                onBlur={onBlur}
              />
            )

          case 'text':
          default:
            return (
              <Input
                {...shared}
                maxLength={field.maxLength}
                placeholder={field.placeholder}
                value={asString(value)}
                onChange={(event) => onChange(event.target.value)}
                onBlur={onBlur}
              />
            )
        }
      }}
    </FieldShell>
  )
}
