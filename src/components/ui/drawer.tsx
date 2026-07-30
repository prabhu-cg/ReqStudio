import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from './button'

/**
 * The one drawer component.
 *
 * ReqStudio never uses centred modal dialogs — every create/edit/confirm surface
 * slides in from the right so the workspace behind stays readable. Built on
 * Radix Dialog, which supplies focus trapping, `aria-modal`, escape handling and
 * scroll locking for free.
 */

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
} as const

export type DrawerSize = keyof typeof SIZES

export interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: DrawerSize
  /** Sticky action bar pinned to the bottom of the drawer. */
  footer?: ReactNode
  /** Rendered to the right of the title (e.g. a status badge). */
  headerAccessory?: ReactNode
  children: ReactNode
  contentClassName?: string
}

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  footer,
  headerAccessory,
  children,
  contentClassName,
}: DrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DrawerOverlay />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 right-0 z-70 flex w-full flex-col border-l border-border bg-background shadow-drawer outline-none',
            'data-[state=open]:animate-[drawer-in_220ms_cubic-bezier(0.32,0.72,0,1)]',
            'data-[state=closed]:animate-[drawer-out_180ms_cubic-bezier(0.32,0.72,0,1)]',
            SIZES[size],
          )}
        >
          <header className="flex items-start gap-4 border-b border-border px-6 py-4">
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="truncate text-base font-semibold tracking-tight">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              ) : (
                <DialogPrimitive.Description className="sr-only">
                  {title}
                </DialogPrimitive.Description>
              )}
            </div>
            {headerAccessory}
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Close drawer">
                <X aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
          </header>

          <div className={cn('rs-scroll-area flex-1 overflow-y-auto px-6 py-5', contentClassName)}>
            {children}
          </div>

          {footer ? (
            <footer className="flex items-center justify-end gap-2 border-t border-border bg-surface px-6 py-4">
              {footer}
            </footer>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

const DrawerOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DrawerOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-60 bg-foreground/25 backdrop-blur-[2px]',
        'data-[state=open]:animate-[fade-in_180ms_ease-out] data-[state=closed]:animate-[fade-out_150ms_ease-in]',
        className,
      )}
      {...props}
    />
  )
})

export const DrawerClose = DialogPrimitive.Close

/** Groups related fields inside a drawer body. */
export function DrawerSection({
  title,
  description,
  children,
  className,
}: {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('mb-8 last:mb-0', className)}>
      {title ? (
        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}
