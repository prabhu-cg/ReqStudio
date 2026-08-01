import type { Project } from '@/types/project'
import type { DocumentSettings, ExportOptions } from '@/types/document'
import { initials } from '@/lib/utils/text'

/**
 * Defaults for a project's document configuration.
 *
 * Derived from the project so a brief exports sensibly before anyone opens the
 * settings drawer.
 */

export const INITIAL_VERSION = '1.0'

export function defaultDocumentSettings(project: Project): DocumentSettings {
  return {
    documentTitle: project.name ? `${project.name} — Requirements Brief` : 'Requirements Brief',
    version: INITIAL_VERSION,
    company: '',
    preparedBy: project.designer || '',
    approvedBy: '',
    footerText: 'Confidential — prepared for internal review',
    logoText: initials(project.client || project.name || 'ReqStudio'),
    dateFormat: 'd MMM yyyy',
    pageSize: 'a4',
    margins: 'normal',
    theme: 'light',
  }
}

export function defaultExportOptions(): ExportOptions {
  return {
    includeCover: true,
    includeDocumentInfo: true,
    includeToc: true,
    includeExecutiveSummary: true,
    includeAppendix: true,
    includeApprovals: true,
    includeEmptySections: false,
    pageNumbers: true,
    headers: true,
    footers: true,
  }
}

/* -------------------------------------------------------------------------- */
/* Versioning                                                                  */
/* -------------------------------------------------------------------------- */

const VERSION_PATTERN = /^v?(\d+)\.(\d+)$/i
const MAX_MINOR = 9

/** Accepts "1.2", "v1.2" and anything else by falling back to the initial version. */
export function normaliseVersion(value: string): string {
  const match = VERSION_PATTERN.exec(value.trim())
  if (!match) return INITIAL_VERSION
  return `${Number(match[1])}.${Number(match[2])}`
}

/** 1.0 → 1.1 … 1.9 → 2.0. Every export advances the document by one revision. */
export function nextVersion(current: string): string {
  const match = VERSION_PATTERN.exec(current.trim())
  if (!match) return INITIAL_VERSION
  const major = Number(match[1])
  const minor = Number(match[2])
  return minor >= MAX_MINOR ? `${major + 1}.0` : `${major}.${minor + 1}`
}

export function formatVersion(value: string): string {
  return `v${normaliseVersion(value)}`
}
