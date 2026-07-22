"use client"

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import gsap from 'gsap'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-destructive/60 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 hover:-translate-y-0.5 hover:shadow-lg',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 hover:-translate-y-0.5',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5 hover:shadow-lg',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        glass: 'glass-panel text-primary hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<'button'> &
    VariantProps<typeof buttonVariants> & { asChild?: boolean, magnetic?: boolean }
>(({ className, variant, size, asChild = false, magnetic = true, onClick, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  const internalRef = React.useRef<HTMLButtonElement | null>(null)

  const setRefs = React.useCallback(
    (node: HTMLButtonElement) => {
      internalRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        (ref as any).current = node
      }
    },
    [ref]
  )

  React.useEffect(() => {
    if (!magnetic || !internalRef.current || asChild) return
    const el = internalRef.current

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      gsap.to(el, { x: x * 0.15, y: y * 0.15, duration: 0.3, ease: "power2.out" })
    }
    const onMouseLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" })
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    return () => {
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [magnetic, asChild])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!asChild && internalRef.current) {
      const button = internalRef.current
      const rect = button.getBoundingClientRect()
      const ripple = document.createElement("span")
      
      const diameter = Math.max(button.clientWidth, button.clientHeight)
      const radius = diameter / 2
      
      ripple.style.width = ripple.style.height = `${diameter}px`
      ripple.style.left = `${e.clientX - rect.left - radius}px`
      ripple.style.top = `${e.clientY - rect.top - radius}px`
      ripple.className = "absolute bg-white/20 rounded-full pointer-events-none transform scale-0 z-0"
      
      button.appendChild(ripple)
      
      gsap.to(ripple, {
        scale: 2.5,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove()
      })
    }
    if (onClick) onClick(e)
  }

  return (
    <Comp
      ref={setRefs}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick as any}
      {...props}
    >
      {asChild ? props.children : <span className="relative z-10 flex items-center justify-center gap-2">{props.children}</span>}
    </Comp>
  )
})
Button.displayName = 'Button'

export { Button, buttonVariants }
