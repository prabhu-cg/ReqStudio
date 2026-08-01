import type { LucideIcon } from 'lucide-react'
import { FileCode2, FileText, FileType2, Hash } from 'lucide-react'
import type { DocumentModel, ExportFormatId } from '@/types/document'

/**
 * The exporter registry.
 *
 * Every format implements the same contract — take a compiled `DocumentModel`,
 * return a `Blob` — so the export dashboard, the version history and the bundle
 * download all work for a format they have never heard of. Adding JSON, an AI
 * prompt, Confluence or Notion in a later phase means registering one more
 * entry here.
 */

export interface Exporter {
  id: ExportFormatId
  label: string
  description: string
  extension: string
  mimeType: string
  icon: LucideIcon
  /** Loaded on demand so a format's library is not in the initial bundle. */
  load: () => Promise<(model: DocumentModel) => Promise<Blob> | Blob>
}

export const exporters: readonly Exporter[] = [
  {
    id: 'pdf',
    label: 'PDF',
    description:
      'Paginated, print-ready document with a cover, running headers, footers and a linked contents page.',
    extension: 'pdf',
    mimeType: 'application/pdf',
    icon: FileText,
    load: async () => (await import('./pdf/pdf-exporter')).exportPdf,
  },
  {
    id: 'docx',
    label: 'Microsoft Word',
    description:
      'Editable .docx with real heading styles, tables and a bookmarked contents page for client mark-up.',
    extension: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    icon: FileType2,
    load: async () => (await import('./docx/docx-exporter')).exportDocx,
  },
  {
    id: 'markdown',
    label: 'Markdown',
    description:
      'Clean .md for GitHub, Obsidian and Notion — and for pasting into Claude, ChatGPT or Cursor.',
    extension: 'md',
    mimeType: 'text/markdown;charset=utf-8',
    icon: Hash,
    load: async () => (await import('./markdown/markdown-exporter')).exportMarkdown,
  },
  {
    id: 'html',
    label: 'HTML',
    description:
      'Standalone page with embedded styles and a print stylesheet. No external dependencies.',
    extension: 'html',
    mimeType: 'text/html;charset=utf-8',
    icon: FileCode2,
    load: async () => (await import('./html/html-exporter')).exportHtml,
  },
]

const byId = new Map(exporters.map((exporter) => [exporter.id, exporter]))

export function getExporter(id: ExportFormatId): Exporter {
  const exporter = byId.get(id)
  if (!exporter) throw new Error(`No exporter is registered for "${id}"`)
  return exporter
}
