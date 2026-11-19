import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 hover:scale-95 transition-transform duration-200",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/80 active:bg-primary-active',
        white: 'bg-neutral-50 text-primary-foreground active:bg-primary-active',
        outline:
          'border-border bg-canvas text-foreground hover:bg-surface hover:text-foreground active:bg-border aria-expanded:bg-surface-muted aria-expanded:text-foreground',
        secondary:
          'bg-surface-muted text-foreground hover:bg-border active:bg-border-strong aria-expanded:bg-surface-muted aria-expanded:text-foreground',
        ghost:
          'hover:bg-surface-muted hover:text-foreground active:bg-border aria-expanded:bg-surface-muted aria-expanded:text-foreground',
        destructive:
          'bg-danger-soft text-danger-soft-foreground hover:bg-danger-hover hover:text-danger-hover-foreground active:bg-danger-active active:text-danger-active-foreground focus-visible:border-danger focus-visible:ring-danger',
        link: 'text-primary underline-offset-4 hover:text-primary-hover hover:underline active:text-primary-active',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        xs: "h-7 gap-1 px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        lg: 'h-9 gap-2 px-3.5 text-sm',
        icon: 'size-8',
        'icon-xs': "size-7 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-7',
        'icon-lg': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'sm',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}

export { Button, buttonVariants }
