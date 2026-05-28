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

const sendDebugLog = (runId: string, hypothesisId: string, location: string, message: string, data: Record<string, unknown>) => {
  // #region agent log
  fetch('http://127.0.0.1:7648/ingest/9083a094-cb0a-4860-b6f2-236bb876b0d0',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'6a311b'},body:JSON.stringify({sessionId:'6a311b',runId,hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
  // #endregion
}

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(({ className, src, alt, fallback, size = "md", ...props }, ref) => {
  const normalizedSrc = src?.trim() || ""
  const shouldRenderImage = isLikelyImageSrc(normalizedSrc)
  const fallbackText = fallback || toInitials(alt)

  React.useEffect(() => {
    // #region agent log
    sendDebugLog("pre-fix", "H1", "Avatar.tsx:source-eval", "Evaluated avatar src for rendering", {
      src: normalizedSrc,
      shouldRenderImage,
      hasFallback: Boolean(fallbackText),
    })
    // #endregion
  }, [normalizedSrc, shouldRenderImage, fallbackText])

  return (
    <AvatarPrimitive.Root ref={ref} className={cn("relative flex shrink-0 overflow-hidden rounded-full", size === "sm" && "h-8 w-8", size === "md" && "h-10 w-10", size === "lg" && "h-12 w-12", className)} {...props}>
      {shouldRenderImage && (
        <AvatarPrimitive.Image
          src={normalizedSrc}
          alt={alt || ''}
          className="aspect-square h-full w-full"
          onError={() => {
            // #region agent log
            sendDebugLog("pre-fix", "H2", "Avatar.tsx:image-error", "Avatar image failed to load", { src: normalizedSrc, alt: alt || "" })
            // #endregion
          }}
        />
      )}
      {fallbackText && <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">{fallbackText}</AvatarPrimitive.Fallback>}
    </AvatarPrimitive.Root>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(({ className, ...props }, ref) => (<AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props} />))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Fallback>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>>(({ className, ...props }, ref) => (<AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props} />))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
