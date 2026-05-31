import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg"
}

const toInitials = (value?: string) =>
  (value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")

const isLikelyImageSrc = (value?: string) => {
  if (!value) return false
  const trimmed = value.trim()
  return /^(https?:\/\/|\/|\.\/|\.\.\/|data:image\/|blob:)/i.test(trimmed)
}

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(({ className, src, alt, fallback, size = "md", ...props }, ref) => {
  const normalizedSrc = src?.trim() || ""
  const shouldRenderImage = isLikelyImageSrc(normalizedSrc)
  const fallbackText = fallback || toInitials(alt)

  return (
    <AvatarPrimitive.Root ref={ref} className={cn("relative flex shrink-0 overflow-hidden rounded-full", size === "sm" && "h-8 w-8", size === "md" && "h-10 w-10", size === "lg" && "h-12 w-12", className)} {...props}>
      {shouldRenderImage && (
        <AvatarPrimitive.Image
          src={normalizedSrc}
          alt={alt || ''}
          className="aspect-square h-full w-full"
        />
      )}
      {fallbackText && <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">{fallbackText}</AvatarPrimitive.Fallback>}
    </AvatarPrimitive.Root>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({ className, alt, ...props }, ref) => (<AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} alt={alt} {...props} />))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...props }, ref) => (<AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }