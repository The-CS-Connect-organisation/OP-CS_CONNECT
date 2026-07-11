import { motion } from 'framer-motion'
import { Construction } from 'lucide-react'

export default function CampusDesk() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EC8037]/10 mb-4">
          <Construction className="w-8 h-8 text-[#EC8037]" />
        </div>
        <h2 className="text-xl font-semibold text-[#3A2E28] dark:text-[#F2F0EE] mb-2">
          CampusDesk
        </h2>
        <p className="text-[#8C8884] max-w-sm">
          This section is under development. You will be redirected once it&apos;s ready.
        </p>
      </motion.div>
    </div>
  )
}
