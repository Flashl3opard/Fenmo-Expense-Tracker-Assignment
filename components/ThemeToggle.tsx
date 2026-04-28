"use client"

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoonStar, SunMedium } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme')
    const nextDark = savedTheme === 'dark'
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(nextDark)
    document.documentElement.classList.toggle('dark', nextDark)
  }, [])

  const toggleTheme = () => {
    setIsDark((current) => {
      const next = !current
      document.documentElement.classList.toggle('dark', next)
      window.localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-violet-500/20 bg-white/75 px-2 py-2 text-sm font-medium text-slate-700 shadow-lg shadow-violet-500/10 backdrop-blur transition dark:bg-white/10 dark:text-white"
    >
      <motion.span
        layout
        className="absolute inset-y-1 left-1 w-1/2 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 shadow-lg shadow-violet-500/20"
        animate={{ x: isDark ? '100%' : '0%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      />

      <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-violet-700 shadow-sm shadow-violet-500/10 dark:bg-slate-950 dark:text-violet-300">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span key="moon" initial={{ opacity: 0, rotate: -90, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 90, scale: 0.7 }}>
              <MoonStar className="h-4 w-4" />
            </motion.span>
          ) : (
            <motion.span key="sun" initial={{ opacity: 0, rotate: 90, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: -90, scale: 0.7 }}>
              <SunMedium className="h-4 w-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span className="relative z-10 pr-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-100">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </motion.button>
  )
}
