"use client"

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import ExpenseFilters from '@/components/ExpenseFilters'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import ExpenseSummary from '@/components/ExpenseSummary'

type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

async function fetchExpenses(category: string, sort: 'date_desc') {
  const params = new URLSearchParams()
  if (category) params.set('category', category)
  params.set('sort', sort)

  const response = await fetch(`/api/expenses?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Unable to load expenses')
  }

  return (await response.json()) as Expense[]
}

export default function Page() {
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<'date_desc'>('date_desc')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  })

  const expensesQuery = useQuery({
    queryKey: ['expenses', category, sort],
    queryFn: () => fetchExpenses(category, sort),
  })

  const allExpensesQuery = useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: () => fetchExpenses('', 'date_desc'),
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('theme', theme)
  }, [theme])

  const categories = useMemo(() => {
    const values = allExpensesQuery.data?.map((expense) => expense.category) ?? []
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right))
  }, [allExpensesQuery.data])

  const totalAmount = useMemo(
    () => (expensesQuery.data ?? []).reduce((sum, expense) => sum + expense.amount, 0),
    [expensesQuery.data]
  )

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_36%),linear-gradient(to_bottom,_var(--background),_var(--background))] px-4 py-8 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-black/5 bg-white/80 px-6 py-5 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Personal finance</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Expense Tracker</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Minimal, retry-safe expense tracking with idempotent writes and visible totals.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-black/5 transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ExpenseForm />
          <ExpenseSummary totalAmount={totalAmount} itemCount={expensesQuery.data?.length ?? 0} />
        </section>

        <ExpenseFilters
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
        />

        <ExpenseList
          expenses={expensesQuery.data ?? []}
          isLoading={expensesQuery.isLoading}
          isError={expensesQuery.isError}
        />
      </div>
    </main>
  )
}
