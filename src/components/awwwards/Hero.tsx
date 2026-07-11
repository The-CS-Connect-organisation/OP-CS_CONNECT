import { useState } from "react"
import NavigationMenu4 from "@/components/ui/navigation-menu-4"

const Hero = () => {
  const [videoReady, setVideoReady] = useState(false)

  return (
    <div className="relative h-dvh w-full bg-[#FFFDF5] overflow-hidden">
      <NavigationMenu4 />

      <div className="absolute inset-0 z-[2]">
        <img
          src={`${import.meta.env.BASE_URL}img/csfeviconbgfreeedition.png`}
          alt=""
          className="absolute inset-0 h-full w-full object-contain p-12 opacity-10"
        />
        <video
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
        <h1 className="text-6xl sm:text-7xl md:text-9xl font-boogie tracking-wide">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-orange-600/90 via-orange-500/80 to-orange-400/70 drop-shadow-[0_2px_12px_rgba(249,115,22,0.3)]">
            CS Connect
          </span>
        </h1>
      </div>
    </div>
  )
}

export default Hero