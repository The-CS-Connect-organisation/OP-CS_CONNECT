import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/ui/Navbar'
import { X, ChevronLeft, ChevronRight, Grid3X3, Image as ImageIcon } from 'lucide-react'

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1523050854058-8df90110c7f1?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1588072432836-e10032774350?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1577896851231-70ac1887ce3e?q=80&w=800&auto=format&fit=crop', category: 'Events', title: 'School Event' },
  { src: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=800&auto=format&fit=crop', category: 'Farewell', title: 'Farewell 2023' },
  { src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop', category: 'Farewell', title: 'Farewell 2023' },
  { src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop', category: 'Farewell', title: 'Farewell 2023' },
  { src: 'https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=800&auto=format&fit=crop', category: 'Arts', title: 'Visual Arts' },
  { src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop', category: 'Arts', title: 'Visual Arts' },
  { src: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop', category: 'Arts', title: 'Visual Arts' },
]

const categories = ['All', 'Events', 'Farewell', 'Arts']

export default function PhotosPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered = useMemo(() =>
    activeCategory === 'All'
      ? galleryImages
      : galleryImages.filter(img => img.category === activeCategory),
    [activeCategory]
  )

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Photos</h1>
          <p className="text-white/50 text-lg">Our school memories, captured forever.</p>
        </motion.div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80 border border-white/10'
              }`}
            >
              {cat === 'All' ? <><Grid3X3 className="w-3.5 h-3.5 inline mr-1.5" />All</> : cat}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((img, idx) => (
              <motion.div
                key={img.src}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -4 }}
                onClick={() => setLightboxIndex(galleryImages.indexOf(img))}
                className="relative group cursor-pointer rounded-xl overflow-hidden aspect-[4/3] bg-white/5 border border-white/10"
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium">{img.title}</p>
                  <p className="text-white/60 text-xs">{img.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-white/30">
            <ImageIcon className="w-16 h-16 mb-4" />
            <p className="text-lg">No photos in this category</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {lightboxIndex > 0 && (
              <button
                onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {lightboxIndex < galleryImages.length - 1 && (
              <button
                onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              src={galleryImages[lightboxIndex].src}
              alt={galleryImages[lightboxIndex].title}
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
              onClick={e => e.stopPropagation()}
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {lightboxIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
