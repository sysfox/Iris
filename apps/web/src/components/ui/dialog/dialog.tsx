import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, m } from 'motion/react'
import * as React from 'react'

import { clsxm } from '~/lib/cn'
import { Spring } from '~/lib/spring'

const DialogContext = React.createContext<{ open: boolean }>({ open: false })

const Dialog = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) => {
  const [open, setOpen] = React.useState(props.open || false)

  React.useEffect(() => {
    if (props.open !== undefined) {
      setOpen(props.open)
    }
  }, [props.open])

  return (
    <DialogContext value={React.useMemo(() => ({ open }), [open])}>
      <DialogPrimitive.Root
        {...props}
        open={open}
        onOpenChange={(openState) => {
          setOpen(openState)
          props.onOpenChange?.(openState)
        }}
      >
        {children}
      </DialogPrimitive.Root>
    </DialogContext>
  )
}

const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogPortal = ({
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) => {
  const { open } = React.use(DialogContext)

  return (
    <DialogPrimitive.Portal forceMount {...props}>
      <AnimatePresence>{open && children}</AnimatePresence>
    </DialogPrimitive.Portal>
  )
}

const DialogOverlay = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
  ref?: React.RefObject<React.ElementRef<typeof DialogPrimitive.Overlay> | null>
}) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={clsxm('fixed inset-0 z-[100000000]', className)}
    asChild
    {...props}
  >
    <m.div
      className="bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={Spring.presets.smooth}
    />
  </DialogPrimitive.Overlay>
)
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  ref?: React.RefObject<React.ElementRef<typeof DialogPrimitive.Content> | null>
}) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={clsxm(
        'fixed left-[50%] top-[50%] z-[100000000] w-full max-w-lg',
        className,
      )}
      asChild
      {...props}
    >
      <m.div
        className="border-border bg-material-medium gap-4 rounded-lg border p-6 shadow-lg backdrop-blur-[70px]"
        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }}
        transition={Spring.presets.smooth}
      >
        {children}
      </m.div>
    </DialogPrimitive.Content>
  </DialogPortal>
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsxm(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className,
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsxm(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className,
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
  ref?: React.RefObject<React.ElementRef<typeof DialogPrimitive.Title> | null>
}) => (
  <DialogPrimitive.Title
    ref={ref}
    className={clsxm(
      'text-lg font-semibold leading-none tracking-tight text-white',
      className,
    )}
    {...props}
  />
)
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = ({
  ref,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
  ref?: React.RefObject<React.ElementRef<
    typeof DialogPrimitive.Description
  > | null>
}) => (
  <DialogPrimitive.Description
    ref={ref}
    className={clsxm('text-sm text-white/70', className)}
    {...props}
  />
)
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
