"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

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
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200/70 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 shadow-md transition hover:border-purple-300/50 hover:from-white hover:to-white focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 dark:border-white/15 dark:from-white/10 dark:to-white/8 dark:text-slate-200 dark:hover:border-purple-400/30 dark:hover:from-white/15 dark:hover:to-white/12"
    >
      <motion.div
        initial={false}
        animate={{ scale: isDark ? 1 : 0.8, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="h-5 w-5" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ scale: isDark ? 0.8 : 1, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="h-5 w-5" />
      </motion.div>
    </motion.button>
  )
}
