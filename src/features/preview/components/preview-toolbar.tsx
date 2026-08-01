import { Minus, Plus, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEFAULT_ZOOM_INDEX, ZOOM_STEPS, zoomAt } from '../lib/zoom'

/**
 * Zoom control for the preview surface.
 *
 * Uses the CSS `zoom` property rather than a transform so the document reflows
 * at each step instead of being scaled and clipped.
 */
export function PreviewZoom({
  index,
  onChange,
}: {
  index: number
  onChange: (index: number) => void
}) {
  const zoom = zoomAt(index)

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Preview zoom">
      <Button
        variant="secondary"
        size="icon-sm"
        onClick={() => onChange(Math.max(0, index - 1))}
        disabled={index <= 0}
        aria-label="Zoom out"
      >
        <Minus aria-hidden="true" />
      </Button>

      <span
        className="min-w-14 text-center text-xs font-medium tabular-nums text-muted-foreground"
        aria-live="polite"
      >
        {Math.round(zoom * 100)}%
      </span>

      <Button
        variant="secondary"
        size="icon-sm"
        onClick={() => onChange(Math.min(ZOOM_STEPS.length - 1, index + 1))}
        disabled={index >= ZOOM_STEPS.length - 1}
        aria-label="Zoom in"
      >
        <Plus aria-hidden="true" />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(DEFAULT_ZOOM_INDEX)}
        disabled={index === DEFAULT_ZOOM_INDEX}
        aria-label="Reset zoom to 100%"
      >
        <RotateCcw aria-hidden="true" />
      </Button>
    </div>
  )
}
