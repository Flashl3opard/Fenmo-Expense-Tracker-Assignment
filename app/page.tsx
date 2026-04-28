"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Filter,
  LayoutDashboard,
  Plus,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Wallet2,
} from 'lucide-react'
import ExpenseAnalytics from '@/components/ExpenseAnalytics'
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

type MonthlyPoint = {
  label: string
  amount: number
}

type CategoryPoint = {
  name: string
  amount: number
}

const cardMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: 'easeOut' as const },
}

const quickActions = [
  { label: 'Add expense', href: '#expense-form', icon: Plus },
  { label: 'Jump to analytics', href: '#analytics', icon: TrendingUp },
  { label: 'Reset filters', href: '#filters', icon: RefreshCcw },
]

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

function buildMonthlySeries(expenses: Expense[]): MonthlyPoint[] {
  const today = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today)
    date.setDate(1)
    date.setMonth(date.getMonth() - (5 - index))
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
      amount: 0,
    }
  })

  const lookup = new Map(months.map((month) => [month.key, month]))

  for (const expense of expenses) {
    const date = new Date(expense.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const bucket = lookup.get(key)
    if (bucket) bucket.amount += expense.amount
  }

  return months.map(({ label, amount }) => ({ label, amount }))
}

function buildCategorySeries(expenses: Expense[]): CategoryPoint[] {
  const categoryMap = new Map<string, number>()
  for (const expense of expenses) {
    categoryMap.set(expense.category, (categoryMap.get(expense.category) ?? 0) + expense.amount)
  }

  return Array.from(categoryMap.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }))
}

function formatINR(amount: number) {
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })
}

export default function Page() {
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState<'date_desc'>('date_desc')

  const expensesQuery = useQuery({
    queryKey: ['expenses', category, sort],
    queryFn: () => fetchExpenses(category, sort),
  })

  const allExpensesQuery = useQuery({
    queryKey: ['expenses', 'all'],
    queryFn: () => fetchExpenses('', 'date_desc'),
  })

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme')
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  const categories = useMemo(() => {
    const values = allExpensesQuery.data?.map((expense) => expense.category) ?? []
    return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right))
  }, [allExpensesQuery.data])

  const visibleExpenses = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data])
  const allExpenses = useMemo(() => allExpensesQuery.data ?? [], [allExpensesQuery.data])

  const totalAmount = useMemo(
    () => visibleExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [visibleExpenses]
  )

  const totalCount = visibleExpenses.length

  const averageTicket = totalCount > 0 ? totalAmount / totalCount : 0
  const topCategory = useMemo(() => buildCategorySeries(visibleExpenses)[0], [visibleExpenses])
  const monthlySeries = useMemo(() => buildMonthlySeries(allExpenses), [allExpenses])
  const categorySeries = useMemo(() => buildCategorySeries(visibleExpenses), [visibleExpenses])
  const monthTotal = monthlySeries[monthlySeries.length - 1]?.amount ?? 0

  return (
    <main className="min-h-screen px-4 py-5 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <motion.header {...cardMotion} className="panel overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-[1.4rem] bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-3 text-white shadow-xl shadow-violet-600/25">
                <Wallet2 className="h-6 w-6" />
              </div>
              <div className="max-w-2xl">
                <p className="section-kicker">Expense control center</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  A premium fintech dashboard for everyday spending.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                  Track expenses, inspect trends, and filter what matters with a polished wallet-style interface designed to feel investor-demo ready.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark')
                window.localStorage.setItem('theme', isDark ? 'dark' : 'light')
              }}
              className="glass-btn inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:shadow-lg dark:text-slate-200"
            >
              <Sparkles className="h-4 w-4 text-violet-500" />
              Toggle theme
            </button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <MiniMetric label="Visible expenses" value={formatINR(totalAmount)} icon={LayoutDashboard} accent="from-violet-600 to-indigo-600" />
            <MiniMetric label="This month" value={formatINR(monthTotal)} icon={CalendarDays} accent="from-cyan-500 to-teal-500" />
            <MiniMetric label="Top category" value={topCategory?.name ?? '—'} icon={TrendingUp} accent="from-emerald-500 to-lime-500" />
          </div>
        </motion.header>

        <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6">
            <motion.div {...cardMotion} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Visible total" value={formatINR(totalAmount)} helper={`${totalCount} item${totalCount === 1 ? '' : 's'}`} />
              <StatTile label="Average ticket" value={formatINR(averageTicket)} helper="Across the filtered set" />
              <StatTile label="This month" value={formatINR(monthTotal)} helper="From all recorded expenses" />
              <StatTile label="Top category" value={topCategory?.name ?? 'None'} helper={topCategory ? formatINR(topCategory.amount) : 'No spend yet'} />
            </motion.div>

            <div id="analytics">
              <ExpenseAnalytics monthlySeries={monthlySeries} categorySeries={categorySeries} />
            </div>

            <ExpenseList expenses={visibleExpenses} isLoading={expensesQuery.isLoading} isError={expensesQuery.isError} />
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <div id="expense-form">
              <ExpenseSummary totalAmount={totalAmount} itemCount={totalCount} />
            </div>

            <ExpenseForm />

            <div id="filters">
              <ExpenseFilters categories={categories} category={category} onCategoryChange={setCategory} sort={sort} onSortChange={setSort} />
            </div>

            <motion.section {...cardMotion} className="panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker inline-flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" /> Quick actions
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Focus mode</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Navigate the dashboard without leaving the product flow.</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 p-3 text-white shadow-lg shadow-violet-500/25">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <a
                      key={action.label}
                      href={action.href}
                      className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-violet-300/40 hover:bg-white hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="rounded-xl bg-violet-600/10 p-2 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300">
                          <Icon className="h-4 w-4" />
                        </span>
                        {action.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </a>
                  )
                })}
              </div>
            </motion.section>
          </div>
        </section>
      </div>
    </main>
  )
}

function MiniMetric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accent} p-2 text-white shadow-lg shadow-black/10`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function StatTile({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white/75 p-4 shadow-sm shadow-black/5 backdrop-blur dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{helper}</p>
    </div>
  )
}
