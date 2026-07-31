import { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { ChevronDown, Copy, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { ScalarField } from './scalar-field'
import { emptyRow } from '@/lib/fields/value'
import type { FieldValue, RepeaterFieldDef, RepeaterRow } from '@/types/field'

export interface RepeaterInputProps {
  field: RepeaterFieldDef
  value: RepeaterRow[]
  onChange: (value: RepeaterRow[]) => void
  errors?: Array<Record<string, string | undefined> | undefined>
  error?: string
}

/**
 * Repeating groups (goals, personas, requirements, risks, approvers…).
 *
 * Rows are collapsible so a section with twenty requirements stays scannable.
 */
export function RepeaterInput({ field, value, onChange, errors, error }: RepeaterInputProps) {
  const rows = value ?? []
  const [openRows, setOpenRows] = useState<Record<number, boolean>>({ 0: true })

  function setRow(index: number, next: RepeaterRow) {
    onChange(rows.map((row, i) => (i === index ? next : row)))
  }

  function addRow() {
    onChange([...rows, emptyRow(field)])
    setOpenRows((current) => ({ ...current, [rows.length]: true }))
  }

  function duplicateRow(index: number) {
    const copy = [...rows]
    copy.splice(index + 1, 0, { ...rows[index]! })
    onChange(copy)
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }

  function rowTitle(row: RepeaterRow, index: number): string {
    const raw = row?.[field.titleField]
    const title = typeof raw === 'string' ? raw.trim() : ''
    return title || `${field.itemLabel} ${index + 1}`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <span className="text-sm font-medium">
            {field.label}
            {field.required ? (
              <span className="ml-1 text-primary-text" aria-hidden="true">
                *
              </span>
            ) : null}
          </span>
          {field.help ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{field.help}</p>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {rows.length} {rows.length === 1 ? field.itemLabel.toLowerCase() : `${field.itemLabel.toLowerCase()}s`}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-control border border-dashed border-border bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
          No {field.itemLabel.toLowerCase()}s yet.
        </p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <li key={index}>
            <Collapsible.Root
              open={openRows[index] ?? false}
              onOpenChange={(open) => setOpenRows((current) => ({ ...current, [index]: open }))}
              className="overflow-hidden rounded-[10px] border border-border bg-surface-raised"
            >
              <div className="flex items-center gap-1 bg-surface px-2 py-1.5">
                <Collapsible.Trigger asChild>
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-[6px] px-2 py-1 text-left text-sm font-medium transition-colors hover:bg-muted"
                  >
                    <ChevronDown
                      className={cn(
                        'size-4 shrink-0 text-muted-foreground transition-transform',
                        (openRows[index] ?? false) && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{rowTitle(row, index)}</span>
                  </button>
                </Collapsible.Trigger>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => duplicateRow(index)}
                  aria-label={`Duplicate ${rowTitle(row, index)}`}
                >
                  <Copy aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeRow(index)}
                  aria-label={`Remove ${rowTitle(row, index)}`}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>

              <Collapsible.Content>
                <div className="grid grid-cols-1 gap-4 border-t border-border p-4 sm:grid-cols-2">
                  {field.fields.map((sub) => (
                    <ScalarField
                      key={sub.name}
                      field={sub}
                      value={row?.[sub.name] as FieldValue}
                      error={errors?.[index]?.[sub.name]}
                      onChange={(next) =>
                        setRow(index, { ...row, [sub.name]: next as RepeaterRow[string] })
                      }
                      className={sub.span === 2 ? 'sm:col-span-2' : undefined}
                    />
                  ))}
                </div>
              </Collapsible.Content>
            </Collapsible.Root>
          </li>
        ))}
      </ul>

      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}

      <div>
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          <Plus aria-hidden="true" />
          Add {field.itemLabel.toLowerCase()}
        </Button>
      </div>
    </div>
  )
}
