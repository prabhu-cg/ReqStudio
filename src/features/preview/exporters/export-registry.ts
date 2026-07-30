import type { Project, ProjectPage } from '@/types/project'

/**
 * Export extension point.
 *
 * Phase 1 ships no exporters. The contract and registry exist now so PDF, Word,
 * Markdown and HTML exports can be added later by registering an implementation
 * — the Preview UI already reads this list and needs no changes.
 */
export interface ExportContext {
  project: Project
  pages: ProjectPage[]
}

export interface Exporter {
  id: string
  label: string
  extension: string
  mimeType: string
  export: (context: ExportContext) => Promise<Blob>
}

export interface ExportFormat {
  id: string
  label: string
  available: boolean
}

const registry = new Map<string, Exporter>()

export function registerExporter(exporter: Exporter): void {
  registry.set(exporter.id, exporter)
}

export function getExporter(id: string): Exporter | undefined {
  return registry.get(id)
}

/** Formats advertised in the UI, whether or not an implementation is registered. */
const PLANNED_FORMATS: Array<Omit<ExportFormat, 'available'>> = [
  { id: 'pdf', label: 'PDF document' },
  { id: 'docx', label: 'Word document' },
  { id: 'markdown', label: 'Markdown' },
  { id: 'html', label: 'HTML page' },
]

export const exportFormats: ExportFormat[] = PLANNED_FORMATS.map((format) => ({
  ...format,
  available: registry.has(format.id),
}))
