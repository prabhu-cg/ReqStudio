import { useRef, type KeyboardEvent } from 'react'
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface ListInputProps {
  id?: string
  value: string[]
  onChange: (value: string[]) => void
  onBlur?: () => void
  placeholder?: string
  itemLabel?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/** An ordered list of short text entries — objectives, nav items, criteria. */
export function ListInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  itemLabel = 'Item',
  ...aria
}: ListInputProps) {
  const items = value.length > 0 ? value : ['']
  const containerRef = useRef<HTMLDivElement>(null)

  function update(index: number, next: string) {
    const copy = [...items]
    copy[index] = next
    onChange(copy)
  }

  function add(afterIndex = items.length - 1) {
    const copy = [...items]
    copy.splice(afterIndex + 1, 0, '')
    onChange(copy)
    requestAnimationFrame(() => {
      const inputs = containerRef.current?.querySelectorAll('input')
      inputs?.[afterIndex + 1]?.focus()
    })
  }

  function remove(index: number) {
    const copy = items.filter((_, i) => i !== index)
    onChange(copy)
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const copy = [...items]
    const [moved] = copy.splice(index, 1)
    copy.splice(target, 0, moved!)
    onChange(copy)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === 'Enter') {
      event.preventDefault()
      add(index)
    }
    if (event.key === 'Backspace' && items[index] === '' && items.length > 1) {
      event.preventDefault()
      remove(index)
    }
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      <ul className="flex flex-col gap-2" aria-describedby={aria['aria-describedby']}>
        {items.map((item, index) => (
          <li key={index} className="group flex items-center gap-1.5">
            <GripVertical
              className="size-4 shrink-0 text-border-strong opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
              aria-hidden="true"
            />
            <Input
              id={index === 0 ? id : undefined}
              value={item}
              placeholder={placeholder}
              aria-label={`${itemLabel} ${index + 1}`}
              aria-invalid={aria['aria-invalid']}
              onChange={(event) => update(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              onBlur={onBlur}
            />
            <div className="flex shrink-0 items-center opacity-0 transition-opacity focus-within:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${itemLabel.toLowerCase()} ${index + 1} up`}
              >
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label={`Move ${itemLabel.toLowerCase()} ${index + 1} down`}
              >
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                disabled={items.length === 1 && items[0] === ''}
                aria-label={`Remove ${itemLabel.toLowerCase()} ${index + 1}`}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div>
        <Button type="button" variant="ghost" size="sm" onClick={() => add()} className="-ml-2">
          <Plus aria-hidden="true" />
          Add {itemLabel.toLowerCase()}
        </Button>
      </div>
    </div>
  )
}
