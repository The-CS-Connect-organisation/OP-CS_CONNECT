import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  magnetic?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, magnetic = false, ...props }, ref) => {
  const magnetX = useMotionValue(0)
  const magnetY = useMotionValue(0)
  const springMagnetX = useSpring(magnetX, { stiffness: 200, damping: 20 })
  const springMagnetY = useSpring(magnetY, { stiffness: 200, damping: 20 })

  const handleMouseMove = magnetic ? (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    magnetX.set(x * 0.25)
    magnetY.set(y * 0.25)
  } : undefined

  const handleMouseLeave = magnetic ? () => {
    magnetX.set(0)
    magnetY.set(0)
  } : undefined

  const Comp = asChild ? Slot : "button"

  if (magnetic) {
    return (
      <motion.button
        ref={ref as any}
        className={cn(buttonVariants({ variant, size, className }))}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: useTransform([springMagnetX, springMagnetY], ([mx, my]: number[]) =>
            `translate(${mx}px, ${my}px)`
          ),
        } as any}
        {...(props as any)}
      />
    )
  }

  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref as any} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }
