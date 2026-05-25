"use client"
import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const toggleMenu = () => setIsOpen(!isOpen)

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Photos", path: "/photos" },
  ]

  return (
    <div className="flex justify-center w-full py-4 px-4 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-3 bg-white/60 backdrop-blur-2xl rounded-full shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(255,255,255,0.9),inset_-3px_-3px_0.5px_-3px_rgba(255,255,255,0.85),inset_0_0_6px_6px_rgba(255,255,255,0.12),0_0_12px_rgba(249,115,22,0.08)] w-full max-w-3xl border border-white/40">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <motion.img
            src="/logo.png"
            alt="Cornerstone"
            className="h-8 mr-2 object-contain"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={() => navigate(item.path)}
                className={`text-sm transition-colors font-medium ${
                  location.pathname === item.path
                    ? 'text-orange-600 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            </motion.div>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <motion.div
          className="hidden md:block"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-full hover:from-orange-400 hover:to-amber-400 transition-all shadow-lg shadow-orange-500/25"
          >
            Sign In
          </button>
        </motion.div>

        {/* Mobile Menu Button */}
        <motion.button className="md:hidden flex items-center" onClick={toggleMenu} whileTap={{ scale: 0.9 }}>
          {isOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
        </motion.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-gray-700" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <button
                    onClick={() => { navigate(item.path); toggleMenu(); }}
                    className={`text-lg font-medium ${
                      location.pathname === item.path ? 'text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </button>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6"
              >
                <button
                  onClick={() => { navigate('/login'); toggleMenu(); }}
                  className="inline-flex items-center justify-center w-full px-5 py-3 text-base text-white bg-gradient-to-r from-orange-500 to-rose-500 rounded-full hover:from-orange-400 hover:to-rose-400 transition-all"
                >
                  Sign In
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
