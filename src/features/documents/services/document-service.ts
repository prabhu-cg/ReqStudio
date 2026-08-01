import { documentRepository } from '@/lib/db'
import type { Project } from '@/types/project'
import type { CreateInput } from '@/types/entity'
import type { DocumentSettings, ExportOptions, ProjectDocument } from '@/types/document'
import {
  defaultDocumentSettings,
  defaultExportOptions,
  normaliseVersion,
} from '../lib/document-settings'

/**
 * Document configuration use-cases.
 *
 * A project has no document record until someone configures or exports it —
 * these functions create one on demand so every caller can assume it exists.
 */

function initialRecord(project: Project): Omit<CreateInput<ProjectDocument>, 'projectId'> {
  const settings = defaultDocumentSettings(project)
  return {
    settings,
    options: defaultExportOptions(),
    version: settings.version,
    lastGeneratedAt: null,
  }
}

export async function ensureDocument(project: Project): Promise<ProjectDocument> {
  return documentRepository.ensure(project.id, initialRecord(project))
}

export async function saveDocumentSettings(
  project: Project,
  settings: DocumentSettings,
): Promise<ProjectDocument> {
  await ensureDocument(project)
  const version = normaliseVersion(settings.version)
  const updated = await documentRepository.updateByProject(project.id, {
    settings: { ...settings, version },
    version,
  })
  // `ensureDocument` above guarantees the record exists.
  return updated as ProjectDocument
}

export async function saveExportOptions(
  project: Project,
  options: ExportOptions,
): Promise<ProjectDocument> {
  await ensureDocument(project)
  const updated = await documentRepository.updateByProject(project.id, { options })
  return updated as ProjectDocument
}

export async function resetDocumentSettings(project: Project): Promise<ProjectDocument> {
  await ensureDocument(project)
  const settings = defaultDocumentSettings(project)
  const updated = await documentRepository.updateByProject(project.id, {
    settings,
    options: defaultExportOptions(),
  })
  return updated as ProjectDocument
}
