/** Current timestamp in ISO-8601. All entities store dates as ISO strings. */
export function nowIso(): string {
  return new Date().toISOString()
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date)
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 1000 * 60 * 60 * 24 * 365],
  ['month', 1000 * 60 * 60 * 24 * 30],
  ['week', 1000 * 60 * 60 * 24 * 7],
  ['day', 1000 * 60 * 60 * 24],
  ['hour', 1000 * 60 * 60],
  ['minute', 1000 * 60],
]

const relativeFormatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

/** "3 days ago", "just now" — used for Last Updated across the app. */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  if (abs < 45_000) return 'just now'

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (abs >= ms) return relativeFormatter.format(Math.round(diff / ms), unit)
  }
  return relativeFormatter.format(Math.round(diff / 1000), 'second')
}

/** `yyyy-mm-dd` for `<input type="date">`. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

/** Days between today and a target date; negative when overdue. */
export function daysUntil(value: string | null | undefined): number | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const day = 1000 * 60 * 60 * 24
  const start = new Date().setHours(0, 0, 0, 0)
  return Math.round((date.setHours(0, 0, 0, 0) - start) / day)
}
