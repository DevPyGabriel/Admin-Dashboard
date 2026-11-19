import * as React from 'react'
import { cn } from 'cn'

/** Native select styled to match the rest of the compact form controls. */
function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      data-slot="select"
      className={cn(
        'border-border bg-canvas text-foreground focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-offset-background disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/30 h-8 w-full min-w-0 rounded-md border px-2 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2',
        className,
      )}
      {...props}
    />
  )
}

export { Select }
