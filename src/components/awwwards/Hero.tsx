import { useMemo, useCallback, useState, useEffect } from "react"
import InfiniteGallery from "@/components/ui/3d-gallery-photography"
import NavigationMenu4 from "@/components/ui/navigation-menu-4"
import { GradientDots } from "@/components/ui/gradient-dots"
import { ChevronDown } from "lucide-react"

const Hero = () => {
  const [ready, setReady] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 800)
    return () => clearTimeout(t)
  }, [])

  const handleScrollDown = useCallback(() => {
    setScrolled(true)
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
  }, [])

  const sampleImages = useMemo(() => [
    { src: `${import.meta.env.BASE_URL}farewell/DSC05820.jpg.jpeg`, alt: 'Farewell 1' },
    { src: `${import.meta.env.BASE_URL}farewell/DSC06091.jpg.jpeg`, alt: 'Farewell 2' },
    { src: `${import.meta.env.BASE_URL}farewell/DSC06271.jpg.jpeg`, alt: 'Farewell 3' },
    { src: `${import.meta.env.BASE_URL}farewell/DSC06844.jpg.jpeg`, alt: 'Farewell 4' },
    { src: `${import.meta.env.BASE_URL}farewell/RPB02324-1024x683.jpg.jpeg`, alt: 'Farewell 5' },
    { src: `${import.meta.env.BASE_URL}farewell/RPB02687.jpg.jpeg`, alt: 'Farewell 6' },
    { src: `${import.meta.env.BASE_URL}farewell/RPB03257.jpg.jpeg`, alt: 'Farewell 7' },
  ], [])

  return (
    <div className="relative h-dvh w-full bg-[#FFFDF5] animated-pattern-bg overflow-hidden">
      <NavigationMenu4 />

      <GradientDots
        duration={25}
        dotSize={6}
        spacing={14}
        className="z-[1]"
      />

      <div className="absolute inset-0 z-[2]">
        <InfiniteGallery
          images={sampleImages}
          speed={1.2}
          visibleCount={12}
          className="h-full w-full"
          fadeSettings={{
            fadeIn: { start: 0.05, end: 0.25 },
            fadeOut: { start: 0.4, end: 0.43 },
          }}
          blurSettings={{
            blurIn: { start: 0.0, end: 0.1 },
            blurOut: { start: 0.4, end: 0.43 },
            maxBlur: 8.0,
          }}
        />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <h1
          className={`text-6xl sm:text-7xl md:text-9xl font-boogie tracking-wide transition-all duration-1000 ${
            ready && !scrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-orange-600/90 via-orange-500/80 to-orange-400/70 drop-shadow-[0_2px_8px_rgba(249,115,22,0.25)]">
            SchoolSync
          </span>
        </h1>
      </div>

      <button
        onClick={handleScrollDown}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-orange-400/50 hover:text-orange-500/90 transition-all duration-300 group"
      >
        <span className="text-xs font-medium tracking-widest uppercase">Enter</span>
        <ChevronDown className="w-5 h-5 animate-bounce group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )
}

export default Hero