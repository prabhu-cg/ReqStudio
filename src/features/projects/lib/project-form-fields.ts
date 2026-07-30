import type { FieldDef, SectionValues } from '@/types/field'
import type { Project } from '@/types/project'
import { getSectionSchema } from '@/lib/fields/schema'
import { withDefaults } from '@/lib/fields/value'
import { PRIORITY_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS } from './project-display'
import { toDateInputValue } from '@/lib/utils/date'

/**
 * The Create/Edit Project form, described with the same field descriptors the
 * brief sections use — one renderer, one validation path, one visual language.
 */
export const projectFormFields: readonly FieldDef[] = [
  {
    kind: 'text',
    name: 'name',
    label: 'Project name',
    placeholder: 'e.g. Northwind Corporate Site',
    required: true,
    span: 2,
    maxLength: 120,
  },
  { kind: 'text', name: 'client', label: 'Client', placeholder: 'Organisation or internal team' },
  { kind: 'select', name: 'type', label: 'Project type', required: true, options: TYPE_OPTIONS },
  {
    kind: 'textarea',
    name: 'description',
    label: 'Description',
    placeholder: 'One or two lines describing the engagement.',
    rows: 3,
    span: 2,
    maxLength: 600,
  },
  { kind: 'text', name: 'designer', label: 'Lead designer', placeholder: 'Who owns the design?' },
  { kind: 'select', name: 'priority', label: 'Priority', options: PRIORITY_OPTIONS },
  { kind: 'date', name: 'startDate', label: 'Start date' },
  { kind: 'date', name: 'targetDate', label: 'Target date' },
  {
    kind: 'tags',
    name: 'stakeholders',
    label: 'Stakeholders',
    placeholder: 'Add a name and press Enter',
    span: 2,
  },
  {
    kind: 'tags',
    name: 'tags',
    label: 'Tags',
    placeholder: 'e.g. b2b, rebrand',
    span: 2,
    suggestions: ['b2b', 'b2c', 'rebrand', 'accessibility', 'migration', 'retainer'],
  },
  { kind: 'select', name: 'status', label: 'Status', required: true, options: STATUS_OPTIONS },
]

/** Field rules from the descriptors, plus the one cross-field rule. */
export const projectFormSchema = getSectionSchema(projectFormFields).superRefine((value, ctx) => {
  const values = value as SectionValues
  const start = typeof values.startDate === 'string' ? values.startDate : ''
  const target = typeof values.targetDate === 'string' ? values.targetDate : ''
  if (start && target && target < start) {
    ctx.addIssue({
      code: 'custom',
      path: ['targetDate'],
      message: 'Target date cannot be before the start date',
    })
  }
})

export const PROJECT_FORM_DEFAULTS: SectionValues = withDefaults(projectFormFields, {
  type: 'marketing-website',
  priority: 'medium',
  status: 'draft',
})

export function projectToFormValues(project: Project): SectionValues {
  return withDefaults(projectFormFields, {
    name: project.name,
    client: project.client,
    type: project.type,
    description: project.description,
    designer: project.designer,
    priority: project.priority,
    startDate: toDateInputValue(project.startDate),
    targetDate: toDateInputValue(project.targetDate),
    stakeholders: project.stakeholders,
    tags: project.tags,
    status: project.status,
  })
}

type ProjectFormPayload = Pick<
  Project,
  | 'name'
  | 'client'
  | 'type'
  | 'description'
  | 'designer'
  | 'priority'
  | 'startDate'
  | 'targetDate'
  | 'stakeholders'
  | 'tags'
  | 'status'
>

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).map((v) => v.trim()).filter(Boolean) : []
}

export function formValuesToProject(values: SectionValues): ProjectFormPayload {
  return {
    name: str(values.name),
    client: str(values.client),
    type: (str(values.type) || 'other') as Project['type'],
    description: str(values.description),
    designer: str(values.designer),
    priority: (str(values.priority) || 'medium') as Project['priority'],
    startDate: str(values.startDate) || null,
    targetDate: str(values.targetDate) || null,
    stakeholders: list(values.stakeholders),
    tags: list(values.tags),
    status: (str(values.status) || 'draft') as Project['status'],
  }
}
