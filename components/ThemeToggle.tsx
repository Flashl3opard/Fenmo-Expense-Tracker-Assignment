"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme')
    const nextDark = savedTheme !== 'light'
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
      className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-violet-400 bg-white text-slate-950 shadow-[0_14px_34px_rgba(67,56,140,0.28)] ring-1 ring-white/90 transition duration-200 hover:-translate-y-0.5 hover:border-violet-600 hover:bg-violet-50 hover:text-violet-950 hover:shadow-[0_18px_44px_rgba(67,56,140,0.38)] focus:outline-none dark:border-white/15 dark:bg-white/12 dark:text-white dark:ring-white/10 dark:hover:border-purple-400/35 dark:hover:bg-white/16"
    >
      <motion.div
        initial={false}
        animate={{ scale: isDark ? 1 : 0.8, opacity: isDark ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="h-5 w-5 text-white [stroke:#ffffff] stroke-[2.8]" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ scale: isDark ? 0.8 : 1, opacity: isDark ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-slate-950 [stroke:#0f172a] stroke-[3]" />
      </motion.div>
    </motion.button>
  )
}
