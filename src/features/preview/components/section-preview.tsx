import type { FieldDef, RepeaterRow, SectionValues } from '@/types/field'
import type { SectionDefinition } from '@/types/section'
import type { Project, ProjectPage } from '@/types/project'
import { isFieldAnswered } from '@/lib/fields/value'
import { formatDate } from '@/lib/utils/date'

/**
 * Generic report rendering of any section.
 *
 * Because it reads the same descriptors the editor uses, a section added in a
 * future phase appears in the Preview with no extra work.
 */
export function SectionPreview({
  section,
  project,
  pages,
  showEmpty,
}: {
  section: SectionDefinition
  project: Project
  pages: ProjectPage[]
  showEmpty: boolean
}) {
  const values: SectionValues = project.brief[section.id] ?? {}
  const CustomPreview = section.preview

  const visibleFields = section.fields.filter(
    (field) => showEmpty || isFieldAnswered(field, values[field.name]),
  )

  const hasContent = visibleFields.length > 0 || Boolean(CustomPreview)

  if (!hasContent) {
    return <p className="text-sm italic text-muted-foreground">Not completed.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      {CustomPreview ? <CustomPreview project={project} pages={pages} /> : null}

      {visibleFields.length > 0 ? (
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-[11rem_1fr]">
          {visibleFields.map((field) => (
            <div key={field.name} className="contents">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {field.label}
              </dt>
              <dd className="text-sm leading-relaxed">
                <FieldValueView field={field} value={values[field.name]} />
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  )
}

function FieldValueView({ field, value }: { field: FieldDef; value: unknown }) {
  if (!isFieldAnswered(field, value as never)) {
    return <span className="italic text-muted-foreground/70">Not provided</span>
  }

  switch (field.kind) {
    case 'switch':
      return <span>{value === true ? 'Yes' : 'No'}</span>

    case 'date':
      return <span>{formatDate(String(value))}</span>

    case 'select': {
      const option = field.options.find((candidate) => candidate.value === value)
      return <span>{option?.label ?? String(value)}</span>
    }

    case 'multiselect': {
      const labels = (value as string[]).map(
        (item) => field.options.find((option) => option.value === item)?.label ?? item,
      )
      return <span>{labels.join(', ')}</span>
    }

    case 'tags':
      return (
        <span className="flex flex-wrap gap-1.5">
          {(value as string[]).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </span>
      )

    case 'list':
      return (
        <ul className="list-disc space-y-1 pl-4">
          {(value as string[]).filter(Boolean).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )

    case 'repeater':
      return <RepeaterView field={field} rows={value as RepeaterRow[]} />

    case 'textarea':
      return <span className="whitespace-pre-wrap">{String(value)}</span>

    default:
      return <span>{String(value)}</span>
  }
}

function RepeaterView({
  field,
  rows,
}: {
  field: Extract<FieldDef, { kind: 'repeater' }>
  rows: RepeaterRow[]
}) {
  return (
    <ol className="flex flex-col gap-3">
      {rows.map((row, index) => (
        <li
          key={index}
          data-print="section"
          className="rounded-[8px] border border-border bg-surface px-4 py-3"
        >
          <p className="text-sm font-semibold">
            {String(row[field.titleField] ?? `${field.itemLabel} ${index + 1}`)}
          </p>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-[minmax(7rem,auto)_1fr]">
            {field.fields
              .filter(
                (sub) =>
                  sub.name !== field.titleField && isFieldAnswered(sub, row[sub.name] as never),
              )
              .map((sub) => (
                <div key={sub.name} className="contents">
                  <dt className="text-xs text-muted-foreground">{sub.label}</dt>
                  <dd className="text-sm">
                    <FieldValueView field={sub} value={row[sub.name]} />
                  </dd>
                </div>
              ))}
          </dl>
        </li>
      ))}
    </ol>
  )
}
