"use client"

import { useEffect, useState, useCallback } from "react"
import { Particles } from "@/components/ui/particles"

export default function LogoParticles({ onComplete }: { onComplete?: () => void }) {
  const [showEnter, setShowEnter] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const fullText = "SchoolSync"
  const [line2, setLine2] = useState("")

  const handleEnter = useCallback(() => {
    setTimeout(() => onComplete?.(), 500)
  }, [onComplete])

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayedText(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(interval)
        setTimeout(() => {
          setLine2("AI-Powered School Management")
        }, 400)
        setTimeout(() => {
          setShowEnter(true)
        }, 1800)
      }
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-dvh flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
      <Particles
        className="absolute inset-0 z-0"
        quantity={120}
        color="#ffffff"
      />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <h1 className="text-5xl md:text-7xl font-bold text-white font-mono tracking-tight">
          {displayedText}
          <span className="animate-pulse ml-0.5 text-white/80">|</span>
        </h1>
        {line2 && (
          <p className="text-sm md:text-base text-white/40 font-light tracking-wide mt-2">
            {line2}
          </p>
        )}
      </div>
      {showEnter && (
        <button
          onClick={handleEnter}
          className="absolute bottom-16 z-10 px-10 py-3.5 bg-white/5 border border-white/20 text-white/90 rounded-xl text-sm font-medium tracking-wide hover:bg-white/15 hover:border-white/30 transition-all duration-500 animate-pulse backdrop-blur-sm"
        >
          Enter SchoolSync
        </button>
      )}
    </div>
  )
}
