
import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, color, size = 'md', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    const sizes = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-primary/20",
          sizes[size],
          className
        )}
        {...props}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: color || 'linear-gradient(90deg, #8b5cf6, #6366f1)',
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
