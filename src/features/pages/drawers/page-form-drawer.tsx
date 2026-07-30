import { useEffect, useMemo } from 'react'
import { useForm, useWatch, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FieldGrid } from '@/components/form/field-renderer'
import { SaveIndicator } from '@/components/layout/save-indicator'
import { useUIStore } from '@/stores/ui-store'
import { usePage } from '@/features/projects/hooks/use-projects'
import { createPage, updatePage } from '../services/page-service'
import {
  PAGE_FORM_DEFAULTS,
  formValuesToPage,
  pageFormFields,
  pageFormSchema,
  pageToFormValues,
} from '../lib/page-form-fields'
import { useAutosave } from '@/lib/hooks/use-autosave'
import { pageCompletion } from '../lib/page-completion'
import type { DrawerComponentProps } from '@/components/drawers/drawer-registry'
import type { SectionValues } from '@/types/field'

type Props = DrawerComponentProps<'page.create'> | DrawerComponentProps<'page.edit'>

/**
 * Add / edit page.
 *
 * Editing an existing page autosaves like the rest of the brief. Creating one
 * needs an explicit action because there is no record to write to yet.
 */
export function PageFormDrawer({ state, open, onClose }: Props) {
  const isEdit = state.type === 'page.edit'
  const page = usePage(isEdit ? state.pageId : undefined)
  const toast = useUIStore((store) => store.toast)
  const openDrawer = useUIStore((store) => store.openDrawer)

  const form = useForm<FieldValues>({
    resolver: zodResolver(pageFormSchema),
    defaultValues: PAGE_FORM_DEFAULTS,
    mode: 'onBlur',
  })

  const { reset, handleSubmit, control, formState } = form

  useEffect(() => {
    if (!open) return
    reset(page ? pageToFormValues(page) : PAGE_FORM_DEFAULTS)
  }, [open, page, reset])

  const values = useWatch({ control })

  // Mirrors the brief sections: only write when the payload really changed.
  const storedPayload = useMemo(
    () => (page ? JSON.stringify(formValuesToPage(pageToFormValues(page))) : null),
    [page],
  )

  useAutosave<SectionValues>({
    value: values as SectionValues,
    enabled: isEdit && open && Boolean(page),
    canSave: (next) => JSON.stringify(formValuesToPage(next)) !== storedPayload,
    save: async (next) => {
      if (!isEdit) return
      await updatePage(state.pageId, formValuesToPage(next))
    },
  })

  const onSubmit = handleSubmit(async (submitted) => {
    if (isEdit) {
      await updatePage(state.pageId, formValuesToPage(submitted as SectionValues))
      onClose()
      return
    }

    await createPage({
      projectId: state.projectId,
      ...formValuesToPage(submitted as SectionValues),
    })
    toast({ title: 'Page added', variant: 'success' })
    onClose()
  })

  const completion = page ? pageCompletion(page) : 0

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={isEdit ? page?.name || 'Edit page' : 'Add page'}
      description={
        isEdit
          ? 'Every change is saved automatically.'
          : 'Describe the page. You can refine the detail at any time.'
      }
      size="xl"
      headerAccessory={
        isEdit ? (
          <Badge tone={completion >= 80 ? 'success' : completion >= 40 ? 'warning' : 'neutral'} size="md">
            {completion}% specified
          </Badge>
        ) : null
      }
      footer={
        isEdit ? (
          <>
            <SaveIndicator className="mr-auto" />
            <Button
              variant="ghost"
              onClick={() =>
                openDrawer({
                  type: 'page.delete',
                  projectId: state.projectId,
                  pageId: state.pageId,
                })
              }
            >
              <Trash2 aria-hidden="true" />
              Delete
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onSubmit} loading={formState.isSubmitting}>
              Add page
            </Button>
          </>
        )
      }
    >
      <form onSubmit={onSubmit} noValidate aria-label={isEdit ? 'Edit page' : 'Add page'}>
        <FieldGrid fields={pageFormFields} control={control} />
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
          Submit
        </button>
      </form>
    </Drawer>
  )
}
