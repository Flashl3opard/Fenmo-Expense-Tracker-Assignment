"use client"

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
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <p className="section-kicker inline-flex items-center gap-2">
            <Filter className="h-3.5 w-3.5" /> Filter and sort
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Refine your view</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Switch category scope and keep newest expenses on top.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            onCategoryChange('')
            onSortChange('date_desc')
          }}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
        >
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <label>
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category filter</span>
          <select className="input" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange('')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                category === ''
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                  : 'border border-black/10 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
              }`}
            >
              All
            </button>
            {categories.slice(0, 4).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onCategoryChange(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  category === value
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                    : 'border border-black/10 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </label>

        <label>
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Sort</span>
          <select className="input" value={sort} onChange={(event) => onSortChange(event.target.value as 'date_desc')}>
            <option value="date_desc">Newest first</option>
          </select>
        </label>
      </div>
    </div>
  )
}
