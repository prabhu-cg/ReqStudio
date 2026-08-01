import { saveAs } from 'file-saver'
import { documentRepository, exportRepository } from '@/lib/db'
import type { Project } from '@/types/project'
import type { CreateInput } from '@/types/entity'
import type { DocumentModel, ExportFormatId, ExportRecord } from '@/types/document'
import { nextVersion, normaliseVersion } from '@/features/documents/lib/document-settings'
import { ensureDocument } from '@/features/documents/services/document-service'
import { SAMPLE_EXPORT_FORMATS, isSampleProject } from '@/features/sample/lib/sample-project'
import { buildFileName, safeFileBase } from '../lib/file-name'
import { exporters, getExporter } from './export-registry'

/**
 * Export use-cases.
 *
 * Generating a file, saving it, recording it in the download history and
 * advancing the document version are one operation — doing them separately is
 * how a history ends up disagreeing with what was actually downloaded.
 */

export class ExportError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'ExportError'
  }
}

export interface ExportResult {
  fileName: string
  size: number
  version: string
  format: ExportFormatId | 'bundle'
}

/** Guards against a blob the browser will refuse to save. */
const MAX_BLOB_BYTES = 512 * 1024 * 1024

/**
 * Generates one format, downloads it, and records the result.
 *
 * The version stored on the document is the one written into the file, and the
 * next export advances it — so v1.0 is what the first PDF says it is, and the
 * history never renumbers an existing download.
 */
export async function runExport(
  project: Project,
  model: DocumentModel,
  format: ExportFormatId,
): Promise<ExportResult> {
  const exporter = getExporter(format)

  // The UI locks these cards; this is the backstop.
  if (isSampleProject(project.id) && !SAMPLE_EXPORT_FORMATS.includes(format)) {
    throw new ExportError(
      `${exporter.label} is not available on the sample project. Duplicate it to export every format.`,
    )
  }

  const version = normaliseVersion(model.settings.version)
  const fileName = buildFileName(model.meta.projectName, version, exporter.extension)

  const blob = await generate(model, format)

  if (blob.size === 0) throw new ExportError(`The ${exporter.label} export produced an empty file.`)
  if (blob.size > MAX_BLOB_BYTES) {
    throw new ExportError(
      `The ${exporter.label} export is too large to download (${Math.round(blob.size / 1024 / 1024)} MB).`,
    )
  }

  download(blob, fileName)
  await recordExport(project, model, { format, fileName, size: blob.size, version })

  return { fileName, size: blob.size, version, format }
}

/** Every format in one archive. */
export async function runBundleExport(
  project: Project,
  model: DocumentModel,
): Promise<ExportResult> {
  if (isSampleProject(project.id)) {
    throw new ExportError(
      'The combined archive is not available on the sample project. Duplicate it to export every format.',
    )
  }

  const version = normaliseVersion(model.settings.version)
  const base = safeFileBase(model.meta.projectName)
  const fileName = `${base}_v${version}.zip`

  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  const folder = zip.folder(`${base}_v${version}`) ?? zip

  const failures: string[] = []

  for (const exporter of exporters) {
    try {
      const blob = await generate(model, exporter.id)
      folder.file(buildFileName(model.meta.projectName, version, exporter.extension), blob)
    } catch (error) {
      // One failing format should not cost the user the other three.
      failures.push(exporter.label)
      console.error(`[reqstudio] ${exporter.label} export failed`, error)
    }
  }

  if (failures.length === exporters.length) {
    throw new ExportError('No formats could be generated. Check the brief for unsupported content.')
  }

  const archive = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  download(archive, fileName)
  await recordExport(project, model, {
    format: 'bundle',
    fileName,
    size: archive.size,
    version,
  })

  return { fileName, size: archive.size, version, format: 'bundle' }
}

/* -------------------------------------------------------------------------- */
/* Internals                                                                   */
/* -------------------------------------------------------------------------- */

async function generate(model: DocumentModel, format: ExportFormatId): Promise<Blob> {
  const exporter = getExporter(format)

  try {
    const render = await exporter.load()
    return await render(model)
  } catch (error) {
    throw new ExportError(`${exporter.label} export failed. ${describe(error)}`, { cause: error })
  }
}

function describe(error: unknown): string {
  if (error instanceof Error && error.message) return error.message
  return 'An unexpected error occurred while rendering the document.'
}

function download(blob: Blob, fileName: string): void {
  try {
    saveAs(blob, fileName)
  } catch (error) {
    throw new ExportError('The browser blocked the download. Check pop-up settings and try again.', {
      cause: error,
    })
  }
}

/**
 * Writes the history entry and advances the stored version.
 *
 * Storage failures are reported but never discard a file the user already has —
 * the download has happened by this point.
 */
async function recordExport(
  project: Project,
  model: DocumentModel,
  result: { format: ExportFormatId | 'bundle'; fileName: string; size: number; version: string },
): Promise<void> {
  // The sample is a fixed showcase: it stays at v1.0 and keeps no history, so
  // it looks the same to every reader on every visit.
  if (isSampleProject(project.id)) return

  try {
    const record = await ensureDocument(project)

    await exportRepository.record({
      projectId: project.id,
      format: result.format,
      fileName: result.fileName,
      version: result.version,
      size: result.size,
      documentTitle: model.meta.documentTitle,
      pages: model.statistics.pages,
      words: model.statistics.words,
    } as CreateInput<ExportRecord>)

    const advanced = nextVersion(result.version)
    await documentRepository.update(record.id, {
      version: advanced,
      settings: { ...record.settings, version: advanced },
      lastGeneratedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[reqstudio] Could not record the export', error)
    throw new ExportError(
      'The file downloaded, but it could not be added to the export history. Local storage may be full.',
      { cause: error },
    )
  }
}

/** Regenerates a past download with the document as it stands today. */
export async function regenerate(
  project: Project,
  model: DocumentModel,
  record: ExportRecord,
): Promise<ExportResult> {
  if (record.format === 'bundle') return runBundleExport(project, model)
  return runExport(project, model, record.format)
}
