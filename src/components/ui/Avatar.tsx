import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
}

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(({ className, src, alt, fallback, size = "md", ...props }, ref) => (
  <AvatarPrimitive.Root ref={ref} className={cn("relative flex shrink-0 overflow-hidden rounded-full", size === "sm" && "h-8 w-8", size === "md" && "h-10 w-10", size === "lg" && "h-12 w-12", className)} {...props}>
    {src && <AvatarPrimitive.Image src={src} alt={alt || ''} className="aspect-square h-full w-full" />}
    {fallback && <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">{fallback}</AvatarPrimitive.Fallback>}
  </AvatarPrimitive.Root>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({ className, ...props }, ref) => (<AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...props }, ref) => (<AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
