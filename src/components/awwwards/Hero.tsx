import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import NavigationMenu4 from "@/components/ui/navigation-menu-4"

const words = [
  { text: "Welcome", lang: "English" },
  { text: "स्वागत है", lang: "Hindi" },
  { text: "స్వాగతం", lang: "Telugu" },
  { text: "வரவேற்பு", lang: "Tamil" },
]

const Hero = () => {
  const [videoReady, setVideoReady] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)
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

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

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
        <div className="relative h-28 sm:h-32 md:h-40 lg:h-48 flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1.0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, filter: "blur(2px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-sans font-thin tracking-wide text-white/80 drop-shadow-[0_2px_12px_rgba(255,255,255,0.3)]"
            >
              {words[wordIndex].text}
            </motion.span>
          </AnimatePresence>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-zentry font-black uppercase tracking-wider text-white/90 drop-shadow-[0_4px_30px_rgba(255,255,255,0.5)]">
          SchoolSync
        </h1>
      </div>
    </div>
  )
}

export default Hero
