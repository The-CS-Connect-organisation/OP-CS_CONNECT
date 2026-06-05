import { cn } from "@/lib/utils"
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useCallback } from 'react';

interface CardProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
  glow?: boolean
  tilt?: boolean
  spotlight?: boolean
  onClick?: React.MouseEventHandler<HTMLDivElement>
  key?: React.Key
}

function Card({ className, glow, tilt = false, spotlight = true, children, ...props }: CardProps) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useSpring(0, { stiffness: 300, damping: 30 });
  const rotateY = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width;
      const my = (e.clientY - rect.top) / rect.height;
      x.set(mx);
      y.set(my);
      if (tilt) {
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        rotateX.set(-((e.clientY - cy) / (rect.height / 2)) * 4);
        rotateY.set(((e.clientX - cx) / (rect.width / 2)) * 4);
      }
    },
    [tilt, x, y, rotateX, rotateY]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
    if (tilt) {
      rotateX.set(0);
      rotateY.set(0);
    }
  }, [tilt, x, y, rotateX, rotateY]);

  const motionProps: Record<string, any> = {};
  if (tilt) {
    motionProps.style = {
      transform: useTransform([rotateX, rotateY], ([rx, ry]: number[]) =>
        `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`
      ),
      transformStyle: 'preserve-3d',
    };
  }

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm group/card",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...motionProps}
    >
      {spotlight && (
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
          style={
            {
              background: useTransform(
                [springX, springY],
                ([px, py]: number[]) =>
                  `radial-gradient(800px circle at ${(px as number) * 100}% ${(py as number) * 100}%, rgba(249,115,22,0.08), transparent 40%)`
              ),
            } as any
          }
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
