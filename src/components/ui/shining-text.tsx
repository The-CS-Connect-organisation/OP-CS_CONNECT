import React from 'react'
import { cn } from '@/lib/utils'

interface ShiningTextProps {
  children: React.ReactNode
  className?: string
  speed?: 'slow' | 'normal' | 'fast'
  gradient?: 'orange' | 'blue' | 'rainbow' | 'white'
}

export default function ShiningText({ children, className, speed = 'normal', gradient = 'orange' }: ShiningTextProps) {
  const speedMap = { slow: '4s', normal: '2.5s', fast: '1.5s' }
  const duration = speedMap[speed]

  const gradientMap = {
    orange: 'linear-gradient(90deg, #f97316 0%, #fb923c 25%, #ffffff 50%, #fb923c 75%, #f97316 100%)',
    blue: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 25%, #ffffff 50%, #60a5fa 75%, #3b82f6 100%)',
    rainbow: 'linear-gradient(90deg, #f97316 0%, #f59e0b 20%, #10b981 40%, #3b82f6 60%, #8b5cf6 80%, #f97316 100%)',
    white: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.3) 100%)',
  }

  return (
    <span
      className={cn('inline-block bg-clip-text text-transparent font-semibold', className)}
      style={{
        backgroundImage: gradientMap[gradient],
        backgroundSize: '200% 100%',
        animation: `shine-text ${duration} ease-in-out infinite`,
      }}
    >
      {children}
    </span>
  )
}
