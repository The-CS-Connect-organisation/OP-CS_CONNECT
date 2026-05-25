import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dots' | 'spinner' | 'pulse' | 'wave'
  className?: string
}

export default function Loader({ size = 'md', variant = 'dots', className }: LoaderProps) {
  const sizeMap = { sm: 6, md: 10, lg: 16 }
  const dotSize = sizeMap[size]

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-gradient-to-br from-orange-500 to-amber-600',
              size === 'sm' && 'w-1.5 h-1.5',
              size === 'md' && 'w-2.5 h-2.5',
              size === 'lg' && 'w-4 h-4'
            )}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.15, 0.7] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </div>
    )
  }

  if (variant === 'spinner') {
    return (
      <motion.div
        className={cn(
          'rounded-full border-2 border-orange-500/20 border-t-orange-500',
          size === 'sm' && 'w-4 h-4',
          size === 'md' && 'w-6 h-6',
          size === 'lg' && 'w-10 h-10'
        )}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        <motion.div
          className={cn(
            'rounded-full bg-gradient-to-br from-orange-500 to-amber-600',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-5 h-5',
            size === 'lg' && 'w-8 h-8'
          )}
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    )
  }

  if (variant === 'wave') {
    return (
      <div className={cn('flex items-end gap-1', className)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'w-1 rounded-full bg-gradient-to-t from-orange-500 to-amber-400',
              size === 'sm' && 'h-3',
              size === 'md' && 'h-5',
              size === 'lg' && 'h-8'
            )}
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
          />
        ))}
      </div>
    )
  }

  return null
}
