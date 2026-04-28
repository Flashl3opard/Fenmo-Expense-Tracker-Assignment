"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Home, PlusCircle, Settings2, TrendingUp } from 'lucide-react'

const items = [
  { label: 'Home', href: '#top', icon: Home, id: 'top' },
  { label: 'Analytics', href: '#analytics', icon: BarChart3, id: 'analytics' },
  { label: 'Add', href: '#expense-form', icon: PlusCircle, id: 'expense-form' },
  { label: 'Filters', href: '#filters', icon: Settings2, id: 'filters' },
  { label: 'Expenses', href: '#list', icon: TrendingUp, id: 'list' },
]

export default function FloatingNav() {
  const [activeId, setActiveId] = useState('top')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { threshold: 0.3 }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => {
      items.forEach((item) => {
        const element = document.getElementById(item.id)
        if (element) observer.unobserve(element)
      })
    }
  }, [])

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 sm:bottom-5 lg:hidden">
      <nav className="floating-nav w-full max-w-[480px] px-3 py-2" aria-label="Mobile section navigation">
        <div className="grid grid-cols-5 gap-1">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeId === item.id
            return (
              <motion.a
                key={item.label}
                href={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-bold transition ${
                  isActive
                    ? 'text-violet-800 dark:text-purple-200'
                    : 'text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-violet-100 shadow-sm ring-1 ring-violet-200/70 dark:bg-white/12 dark:ring-white/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5" />
                <span className="relative z-10">{item.label}</span>
              </motion.a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
