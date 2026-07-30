import { useEffect } from 'react'
import { useForm, type FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { FieldGrid } from '@/components/form/field-renderer'
import { useUIStore } from '@/stores/ui-store'
import { useProject } from '../hooks/use-projects'
import { createProject, updateProject } from '../services/project-service'
import {
  PROJECT_FORM_DEFAULTS,
  formValuesToProject,
  projectFormFields,
  projectFormSchema,
  projectToFormValues,
} from '../lib/project-form-fields'
import type { DrawerComponentProps } from '@/components/drawers/drawer-registry'
import type { SectionValues } from '@/types/field'

type Props =
  | DrawerComponentProps<'project.create'>
  | DrawerComponentProps<'project.edit'>

/**
 * Create and edit share one drawer: the only differences are the initial values
 * and which service call runs on submit.
 */
export function ProjectFormDrawer({ state, open, onClose }: Props) {
  const isEdit = state.type === 'project.edit'
  const project = useProject(isEdit ? state.projectId : undefined)
  const navigate = useNavigate()
  const toast = useUIStore((store) => store.toast)

  const form = useForm<FieldValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: PROJECT_FORM_DEFAULTS,
    mode: 'onBlur',
  })

  const { reset, handleSubmit, control, formState } = form

  useEffect(() => {
    if (!open) return
    reset(project ? projectToFormValues(project) : PROJECT_FORM_DEFAULTS)
  }, [open, project, reset])

  const onSubmit = handleSubmit(async (values) => {
    const payload = formValuesToProject(values as SectionValues)

    if (isEdit) {
      await updateProject(state.projectId, payload)
      toast({ title: 'Project updated', variant: 'success' })
      onClose()
      return
    }

    const created = await createProject(payload)
    toast({
      title: 'Project created',
      description: 'Autosave is on — everything you type is stored on this device.',
      variant: 'success',
    })
    onClose()
    navigate(`/projects/${created.id}/brief`)
  })

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={isEdit ? 'Edit project' : 'New project'}
      description={
        isEdit
          ? 'Update the project details. Changes are saved when you apply them.'
          : 'Set up the essentials — you can complete the brief in any order afterwards.'
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSubmit} loading={formState.isSubmitting}>
            {isEdit ? 'Save changes' : 'Create project'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        aria-label={isEdit ? 'Edit project' : 'Create project'}
      >
        <FieldGrid fields={projectFormFields} control={control} />
        {/* Enables Enter-to-submit without a visible duplicate button. */}
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
          Submit
        </button>
      </form>
    </Drawer>
  )
}
