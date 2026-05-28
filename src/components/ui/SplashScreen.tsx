
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedText } from '@/components/ui/AnimatedText'
import { Sparkles, GraduationCap } from 'lucide-react'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'namaste' | 'eduvault' | 'done'>('namaste')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('eduvault'), 1500)
    const t2 = setTimeout(() => setPhase('done'), 3000)
    const t3 = setTimeout(() => onComplete(), 3500)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
        >
          {/* Animated background orbs - black & white */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-[128px]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full filter blur-[128px]"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

          <div className="relative z-10 flex flex-col items-center gap-8">
            <AnimatePresence mode="wait">
              {phase === 'namaste' && (
                <motion.div
                  key="namaste"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-4"
                >
                  <AnimatedText
                    text="Namaste World 🙏"
                    textClassName="text-5xl md:text-6xl text-white"
                    underlineClassName="text-white/50"
                    underlineDuration={1.2}
                  />
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted-foreground text-sm mt-6"
                  >
                    Initializing AI systems...
                  </motion.p>
                </motion.div>
              )}

              {phase === 'eduvault' && (
                <motion.div
                  key="eduvault"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-orange-500/30"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                  >
                    <GraduationCap className="w-10 h-10 text-white" />
                  </motion.div>
                  <AnimatedText
                    text="Cornerstone AI"
                    textClassName="text-4xl md:text-5xl font-bold"
                    underlineClassName="text-orange-500"
                    underlineDuration={1}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">AI-Powered Learning Platform</span>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading bar */}
            <motion.div
              className="w-48 h-1 rounded-full bg-secondary overflow-hidden mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-600"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
