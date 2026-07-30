/** Initials for avatars/badges — max two characters. */
export function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

/** Case/diacritic-insensitive haystack used by every search box in the app. */
export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesQuery(query: string, ...haystack: Array<string | undefined | null>): boolean {
  const q = normalize(query)
  if (!q) return true
  const terms = q.split(/\s+/)
  const target = normalize(haystack.filter(Boolean).join(' '))
  return terms.every((term) => target.includes(term))
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}

export function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`
}
