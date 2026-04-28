"use client"

import { motion } from 'framer-motion'
import { Filter, RotateCcw } from 'lucide-react'

type ExpenseFiltersProps = {
  categories: string[]
  category: string
  onCategoryChange: (value: string) => void
  sort: 'date_desc'
  onSortChange: (value: 'date_desc') => void
}

export default function ExpenseFilters({ categories, category, onCategoryChange, sort, onSortChange }: ExpenseFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="panel p-5 ring-1 ring-white/60 dark:ring-white/5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/40 pb-4 dark:border-white/10">
        <div>
          <p className="section-kicker inline-flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" /> Filter and sort
          </p>
          <h2 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">Refine your view</h2>
          <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">Switch category scope and keep newest expenses on top.</p>
        </div>

        <motion.button
          type="button"
          onClick={() => {
            onCategoryChange('')
            onSortChange('date_desc')
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 rounded-lg border border-violet-200/70 bg-gradient-to-r from-white to-violet-50/45 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-300/80 hover:text-violet-800 dark:border-white/10 dark:from-white/7 dark:to-white/5 dark:text-slate-200 dark:hover:border-purple-400/35 dark:hover:from-white/12 dark:hover:to-white/8"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </motion.button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Category filter</span>
          <select className="input" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <div className="mt-3 flex flex-wrap gap-2">
            <motion.button
              type="button"
              onClick={() => onCategoryChange('')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                category === ''
                  ? 'brand-gradient-bg text-white shadow-lg shadow-purple-600/25'
                  : 'border border-violet-200/70 bg-gradient-to-r from-white to-violet-50/45 text-slate-700 shadow-sm hover:border-violet-300/80 hover:from-violet-50 hover:to-white hover:text-violet-800 dark:border-white/10 dark:from-white/7 dark:to-white/5 dark:text-slate-200 dark:hover:border-purple-400/35 dark:hover:from-white/12 dark:hover:to-white/8'
              }`}
            >
              All
            </motion.button>
            {categories.slice(0, 4).map((value) => (
              <motion.button
                key={value}
                type="button"
                onClick={() => onCategoryChange(value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  category === value
                    ? 'brand-gradient-bg text-white shadow-lg shadow-purple-600/25'
                    : 'border border-violet-200/70 bg-gradient-to-r from-white to-violet-50/45 text-slate-700 shadow-sm hover:border-violet-300/80 hover:from-violet-50 hover:to-white hover:text-violet-800 dark:border-white/10 dark:from-white/7 dark:to-white/5 dark:text-slate-200 dark:hover:border-purple-400/35 dark:hover:from-white/12 dark:hover:to-white/8'
                }`}
              >
                {value}
              </motion.button>
            ))}
          </div>
        </label>

        <label>
          <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Sort</span>
          <select className="input" value={sort} onChange={(event) => onSortChange(event.target.value as 'date_desc')}>
            <option value="date_desc">Newest first</option>
          </select>
        </label>
      </div>
    </motion.div>
  )
}
