import { useState, useRef, useEffect } from "react"
import NavigationMenu4 from "@/components/ui/navigation-menu-4"

const Hero = () => {
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden && videoRef.current && videoReady) {
        videoRef.current.play().catch(() => {})
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [videoReady])

  return (
    <div className="relative h-dvh w-full bg-[#FFFDF5] overflow-hidden">
      <div className="relative z-20 isolate">
        <NavigationMenu4 />
      </div>

      <div className="absolute inset-0 z-[2] will-change-transform">
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/iextksqn/video/upload/v1783787771/hero-2_npn9ku.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${videoReady ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="relative text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-pacifico italic [transform:skewX(-6deg)] text-transparent bg-clip-text bg-gradient-to-br from-white/95 via-white/70 to-white/30 bg-[length:200%_200%] animate-liquid-shine drop-shadow-[0_4px_30px_rgba(255,255,255,0.5)]">
          SchoolSync
        </h1>
      </div>
    </div>
  )
}

export default Hero
