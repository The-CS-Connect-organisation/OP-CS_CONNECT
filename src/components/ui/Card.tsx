import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform, type HTMLMotionProps, MotionStyle } from 'framer-motion';
import React, { useCallback } from 'react';

interface CardProps extends HTMLMotionProps<"div"> {
  glow?: boolean
  tilt?: boolean
  spotlight?: boolean
}

function Card({ className, glow, tilt = false, spotlight = true, children, ...props }: CardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 150, damping: 15 })
  const springY = useSpring(y, { stiffness: 150, damping: 15 })

  const rotateX = useSpring(0, { stiffness: 300, damping: 30 })
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 })

  const spotlightX = useTransform(springX, [0, 1], [0, 100])
  const spotlightY = useTransform(springY, [0, 1], [0, 100])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mx = (e.clientX - rect.left) / rect.width
    const my = (e.clientY - rect.top) / rect.height
    x.set(mx)
    y.set(my)

    if (tilt) {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const tx = (e.clientX - centerX) / (rect.width / 2)
      const ty = (e.clientY - centerY) / (rect.height / 2)
      rotateX.set(-ty * 4)
      rotateY.set(tx * 4)
    }
  }, [tilt, x, y, rotateX, rotateY])

  const handleMouseLeave = useCallback(() => {
    x.set(0.5)
    y.set(0.5)
    if (tilt) {
      rotateX.set(0)
      rotateY.set(0)
    }
  }, [tilt, x, y, rotateX, rotateY])

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm group/card",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={tilt ? {
        transform: useTransform([rotateX, rotateY], ([rx, ry]) =>
          `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
        ),
        transformStyle: "preserve-3d",
      } as any : undefined}
      {...props}
    >
      {spotlight && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
          style={{
            background: useTransform(
              [springX, springY],
              ([px, py]) => `radial-gradient(800px circle at ${(px as number) * 100}% ${(py as number) * 100}%, rgba(249,115,22,0.08), transparent 40%)`
            )
          }}
        />
      )}
      {children}
    </motion.div>
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}
function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
}
function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}
function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />
}
function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
