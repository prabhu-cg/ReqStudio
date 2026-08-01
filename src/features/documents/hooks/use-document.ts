import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Project, ProjectPage } from '@/types/project'
import type { ReadinessReport } from '@/types/section'
import type {
  DocumentModel,
  DocumentSettings,
  ExportOptions,
  ExportRecord,
  ProjectDocument,
} from '@/types/document'
import { buildDocument } from '../templates/brief-document'
import { defaultDocumentSettings, defaultExportOptions } from '../lib/document-settings'

/** The persisted document record for a project, or undefined while loading. */
export function useProjectDocument(projectId: string | undefined): ProjectDocument | null | undefined {
  return useLiveQuery(async () => {
    if (!projectId) return null
    const record = await db.documents.where('projectId').equals(projectId).first()
    return record && !record.deletedAt ? record : null
  }, [projectId])
}

export interface DocumentConfiguration {
  settings: DocumentSettings
  options: ExportOptions
  /** True once a stored record exists, rather than the derived defaults. */
  persisted: boolean
}

/**
 * Settings for a project's document, falling back to defaults derived from the
 * project so the preview and exports work before anything is configured.
 */
export function useDocumentConfiguration(
  project: Project,
  record: ProjectDocument | null | undefined,
): DocumentConfiguration {
  return useMemo(() => {
    if (record) {
      return { settings: record.settings, options: record.options, persisted: true }
    }
    return {
      settings: defaultDocumentSettings(project),
      options: defaultExportOptions(),
      persisted: false,
    }
  }, [project, record])
}

/** The compiled document. Rebuilt whenever the brief or its settings change. */
export function useDocumentModel(
  project: Project,
  pages: ProjectPage[],
  readiness: ReadinessReport,
  configuration: DocumentConfiguration,
): DocumentModel {
  return useMemo(
    () =>
      buildDocument({
        project,
        pages,
        readiness,
        settings: configuration.settings,
        options: configuration.options,
      }),
    [project, pages, readiness, configuration],
  )
}

/** Download history for a project, newest first. */
export function useExportHistory(projectId: string | undefined): ExportRecord[] {
  const records = useLiveQuery(async () => {
    if (!projectId) return []
    const result = await db.exports.where('projectId').equals(projectId).toArray()
    return result
      .filter((record) => !record.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [projectId])

  return records ?? []
}
