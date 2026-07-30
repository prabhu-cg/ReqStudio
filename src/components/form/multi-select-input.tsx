import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { SelectOption } from '@/types/field'

export interface MultiSelectInputProps {
  id?: string
  value: string[]
  onChange: (value: string[]) => void
  options: readonly SelectOption[]
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/**
 * Toggle-chip group. Rendered as real checkboxes so screen readers announce
 * state and the whole group is keyboard reachable in one tab stop per option.
 */
export function MultiSelectInput({
  id,
  value,
  onChange,
  options,
  ...aria
}: MultiSelectInputProps) {
  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    )
  }

  return (
    <div
      id={id}
      className="flex flex-wrap gap-2"
      aria-describedby={aria['aria-describedby']}
      role="group"
    >
      {options.map((option) => {
        const checked = value.includes(option.value)
        return (
          <label
            key={option.value}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
              checked
                ? 'border-primary bg-primary-soft text-primary-text'
                : 'border-border bg-surface-raised text-muted-foreground hover:border-border-strong hover:text-foreground',
            )}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => toggle(option.value)}
            />
            {checked ? <Check className="size-3.5" aria-hidden="true" /> : null}
            {option.label}
          </label>
        )
      })}
    </div>
  )
}
