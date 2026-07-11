import NavigationMenu4 from "@/components/ui/navigation-menu-4"

const Hero = () => {
  return (
    <div className="relative h-dvh w-full bg-[#FFFDF5] overflow-hidden">
      <NavigationMenu4 />

      <div className="absolute inset-0 z-[2]">
        <video
          src={`${import.meta.env.BASE_URL}videos/hero-1.mp4`}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <h1 className="text-6xl sm:text-7xl md:text-9xl font-boogie tracking-wide">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-orange-600/90 via-orange-500/80 to-orange-400/70">
            CS Connect
          </span>
        </h1>
      </div>
    </div>
  )
}

export default Hero