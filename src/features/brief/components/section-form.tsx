import { useEffect, useMemo } from 'react'
import { useForm, useWatch, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldGrid } from '@/components/form/field-renderer'
import { useAutosave } from '@/lib/hooks/use-autosave'
import { getSectionSchema } from '@/lib/fields/schema'
import { pruneValues, withDefaults } from '@/lib/fields/value'
import { saveBriefSection } from '@/features/projects/services/project-service'
import type { SectionDefinition } from '@/types/section'
import type { Project, ProjectPage } from '@/types/project'
import type { SectionValues } from '@/types/field'

export interface SectionFormProps {
  section: SectionDefinition
  project: Project
  pages: ProjectPage[]
}

/**
 * Renders and autosaves one brief section.
 *
 * The form is rebuilt whenever the section changes, keyed by project + section,
 * so switching sections never carries values across.
 */
export function SectionForm({ section, project, pages }: SectionFormProps) {
  const defaultValues = useMemo(
    () => withDefaults(section.fields, project.brief[section.id]),
    // Re-seeding on every project mutation would fight the user's typing, so the
    // form is only seeded when the section or project identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [section.id, project.id],
  )

  const form = useForm<FieldValues>({
    resolver: zodResolver(getSectionSchema(section.fields)),
    defaultValues,
    mode: 'onChange',
  })

  const { control, reset } = form

  useEffect(() => {
    // Seed without validating: an untouched section should never open covered in
    // red. The "still required" banner and the outline carry that signal instead,
    // and both are derived from the data rather than from form state.
    reset(defaultValues)
  }, [defaultValues, reset])

  const values = useWatch({ control })

  // What is already in the database. Autosave stays silent until the pruned
  // payload actually differs, so merely opening a section never writes.
  const storedPayload = useMemo(
    () => JSON.stringify(pruneValues(section.fields, defaultValues)),
    [section.fields, defaultValues],
  )

  useAutosave<SectionValues>({
    value: values as SectionValues,
    canSave: (next) =>
      JSON.stringify(pruneValues(section.fields, next)) !== storedPayload,
    save: async (next) => {
      await saveBriefSection(project.id, section.id, pruneValues(section.fields, next))
    },
  })

  const Pane = section.pane

  return (
    <form
      noValidate
      aria-label={section.title}
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-8"
    >
      {Pane ? <Pane project={project} pages={pages} /> : null}
      {section.fields.length > 0 ? (
        <FieldGrid fields={section.fields} control={control} />
      ) : null}
    </form>
  )
}
