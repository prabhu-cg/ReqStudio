import { useRef, useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface TagsInputProps {
  id?: string
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  placeholder?: string
  suggestions?: readonly string[]
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  disabled?: boolean
}

/** Chip input. Enter or comma commits a tag; Backspace on an empty field removes the last. */
export function TagsInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder = 'Type and press Enter',
  suggestions,
  disabled,
  ...aria
}: TagsInputProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = suggestions?.length ? `${id ?? 'tags'}-suggestions` : undefined

  function commit(raw: string) {
    const tag = raw.trim().replace(/,$/, '')
    if (!tag || value.includes(tag)) {
      setDraft('')
      return
    }
    onChange([...value, tag])
    setDraft('')
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(draft)
      return
    }
    if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-control border border-border bg-surface-raised px-2 py-1.5 shadow-xs transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/35',
        disabled && 'pointer-events-none opacity-60',
        aria['aria-invalid'] && 'border-danger',
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-muted py-0.5 pl-2.5 pr-1 text-xs font-medium text-foreground"
        >
          {tag}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              onChange(value.filter((item) => item !== tag))
            }}
            className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        id={id}
        list={listId}
        value={draft}
        disabled={disabled}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          commit(draft)
          onBlur?.()
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-24 flex-1 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground/70"
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
      />

      {listId ? (
        <datalist id={listId}>
          {suggestions?.map((suggestion) => <option key={suggestion} value={suggestion} />)}
        </datalist>
      ) : null}
    </div>
  )
}
