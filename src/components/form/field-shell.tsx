import { useId, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Label } from '@/components/ui/primitives'

export interface FieldShellProps {
  label: string
  help?: string
  error?: string
  required?: boolean
  className?: string
  /** Rendered next to the label (e.g. a character counter). */
  accessory?: ReactNode
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode
}

/**
 * Label + help text + error message, wired up with the ARIA relationships every
 * control in the app needs. Controls never re-implement this.
 */
export function FieldShell({
  label,
  help,
  error,
  required,
  className,
  accessory,
  children,
}: FieldShellProps) {
  const inputId = useId()
  const helpId = `${inputId}-help`
  const errorId = `${inputId}-error`

  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ')

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={inputId}>
          {label}
          {required ? (
            <span className="ml-1 text-primary-text" aria-hidden="true">
              *
            </span>
          ) : null}
          {required ? <span className="sr-only"> (required)</span> : null}
        </Label>
        {accessory}
      </div>

      {children({ inputId, describedBy: describedBy || undefined })}

      {help && !error ? (
        <p id={helpId} className="text-xs leading-relaxed text-muted-foreground">
          {help}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  )
}
