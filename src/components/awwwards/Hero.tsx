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
          src={`${import.meta.env.BASE_URL}videos/hero-2.mp4`}
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
        <div className="rounded-2xl border border-white/30 bg-white/10 px-8 py-4 md:px-16 md:py-6 backdrop-blur-md shadow-xl">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-pacifico text-white drop-shadow-lg">
            CS Connect
          </h1>
        </div>
      </div>
    </div>
  )
}

export default Hero
