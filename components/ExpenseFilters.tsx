"use client"

type ExpenseFiltersProps = {
  categories: string[]
  category: string
  onCategoryChange: (value: string) => void
  sort: 'date_desc'
  onSortChange: (value: 'date_desc') => void
}

export default function ExpenseFilters({ categories, category, onCategoryChange, sort, onSortChange }: ExpenseFiltersProps) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-4 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <label className="flex-1">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Category filter</span>
          <select className="input" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="sm:w-48">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Sort</span>
          <select className="input" value={sort} onChange={(event) => onSortChange(event.target.value as 'date_desc')}>
            <option value="date_desc">Newest first</option>
          </select>
        </label>
      </div>
    </div>
  )
}
