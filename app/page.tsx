"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  LayoutDashboard,
  Plus,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Wallet2,
} from 'lucide-react'
import FloatingNav from '@/components/FloatingNav'
import ExpenseAnalytics from '@/components/ExpenseAnalytics'
import ExpenseFilters from '@/components/ExpenseFilters'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import ExpenseSummary from '@/components/ExpenseSummary'
import ThemeToggle from '@/components/ThemeToggle'

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
    <main id="top" className="bottom-safe-area min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        {/* Premium Header */}
        <motion.header {...cardMotion} className="panel relative overflow-hidden p-5 sm:p-8">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-purple-500/15 via-violet-400/10 to-indigo-500/15" />
          <div className="relative">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl brand-gradient-bg p-3 text-white shadow-xl shadow-purple-600/30">
                  <Wallet2 className="h-6 w-6" />
                </div>
                <div className="max-w-2xl">
                  <p className="section-kicker">Expense control center</p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                    Premium Expense Tracker
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                    Track, analyze, and manage your spending with a fintech-grade dashboard designed for precision and elegance.
                  </p>
                </div>
              </div>

              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <MiniMetric label="Visible total" value={formatINR(totalAmount)} icon={LayoutDashboard} accent="from-violet-700 via-purple-600 to-indigo-700" />
              <MiniMetric label="This month" value={formatINR(monthTotal)} icon={CalendarDays} accent="from-purple-600 via-pink-500 to-red-600" />
              <MiniMetric label="Top category" value={topCategory?.name ?? '—'} icon={TrendingUp} accent="from-indigo-600 via-purple-500 to-violet-600" />
            </div>
          </div>
        </motion.header>

        {/* Main Content Grid */}
        <section className="grid gap-8 xl:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            {/* Premium Stats Row */}
            <motion.div
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <StatTile label="Visible total" value={formatINR(totalAmount)} helper={`${totalCount} item${totalCount === 1 ? '' : 's'}`} />
              <StatTile label="Average ticket" value={formatINR(averageTicket)} helper="Per expense" />
              <StatTile label="This month" value={formatINR(monthTotal)} helper="All expenses" />
              <StatTile label="Top category" value={topCategory?.name ?? 'None'} helper={topCategory ? formatINR(topCategory.amount) : 'N/A'} />
            </motion.div>

            {/* Analytics Section */}
            <motion.div
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
              id="analytics"
            >
              <ExpenseAnalytics monthlySeries={monthlySeries} categorySeries={categorySeries} />
            </motion.div>

            {/* Expense List */}
            <motion.div
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.15 }}
            >
              <ExpenseList expenses={visibleExpenses} isLoading={expensesQuery.isLoading} isError={expensesQuery.isError} />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            {/* Summary Card */}
            <motion.div
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
              id="expense-form"
            >
              <ExpenseSummary totalAmount={totalAmount} itemCount={totalCount} />
            </motion.div>

            {/* Expense Form */}
            <motion.div
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
            >
              <ExpenseForm />
            </motion.div>

            {/* Filters */}
            <motion.div
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.15 }}
              id="filters"
            >
              <ExpenseFilters categories={categories} category={category} onCategoryChange={setCategory} sort={sort} onSortChange={setSort} />
            </motion.div>

            {/* Quick Actions */}
            <motion.section
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.2 }}
              className="panel p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker inline-flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" /> Navigation
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Quick links</h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Jump to dashboard sections</p>
                </div>
                <div className="rounded-xl brand-gradient-bg p-2.5 text-white shadow-lg shadow-purple-600/30">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-4 grid gap-2.5">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <a
                      key={action.label}
                      href={action.href}
                      className="group flex items-center justify-between rounded-xl border border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-50/60 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-purple-300/50 hover:from-white hover:to-white hover:shadow-md dark:border-white/10 dark:from-white/5 dark:to-white/5 dark:text-slate-200 dark:hover:border-purple-400/30 dark:hover:from-white/10 dark:hover:to-white/8 dark:hover:shadow-lg dark:hover:shadow-purple-500/10"
                    >
                      <span className="inline-flex items-center gap-2.5">
                        <span className="rounded-lg bg-purple-600/12 p-1.5 text-purple-600 group-hover:bg-purple-600/20 dark:bg-purple-400/15 dark:text-purple-300">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {action.label}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 dark:text-slate-500" />
                    </a>
                  )
                })}
              </div>
            </motion.section>
          </div>
        </section>
      </div>
      <FloatingNav />
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
    <div className="group rounded-2xl border border-black/8 bg-gradient-to-br from-white to-slate-50/60 p-4 shadow-sm transition hover:shadow-md dark:border-white/12 dark:from-white/8 dark:to-white/5 dark:hover:border-purple-400/20">
      <div className={`inline-flex rounded-xl bg-gradient-to-br ${accent} p-2 text-white shadow-lg shadow-black/20`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function StatTile({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="group rounded-2xl border border-black/8 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-sm transition hover:shadow-md dark:border-white/12 dark:from-white/8 dark:to-white/5 dark:hover:border-purple-400/20">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tighter text-slate-950 dark:text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{helper}</p>
    </div>
  )
}
