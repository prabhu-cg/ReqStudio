import { normaliseVersion } from '@/features/documents/lib/document-settings'

/**
 * File naming.
 *
 * `ProjectName_v1.0.pdf`. Names have to survive Windows, macOS and cloud
 * storage, so reserved characters are stripped rather than escaped and runs of
 * whitespace collapse into single underscores.
 */

/** Reserved on Windows, awkward everywhere else, plus C0 control codes. */
// eslint-disable-next-line no-control-regex
const ILLEGAL = /[<>:"/\\|?*\u0000-\u001f]/g
const COMBINING_MARKS = /[\u0300-\u036f]/g
/** Windows reserves these stems regardless of extension. */
const RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i
const MAX_BASE_LENGTH = 80

export function safeFileBase(value: string): string {
  const cleaned = value
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(ILLEGAL, '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, MAX_BASE_LENGTH)

  if (!cleaned || RESERVED.test(cleaned)) return 'Project'
  return cleaned
}

export function buildFileName(projectName: string, version: string, extension: string): string {
  return `${safeFileBase(projectName)}_v${normaliseVersion(version)}.${extension}`
}
