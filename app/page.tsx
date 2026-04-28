"use client"

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  LayoutDashboard,
  Home,
  Plus,
  Printer,
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
import { formatINR } from '@/lib/utils'

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

const sectionNavItems = [
  { label: 'Home', href: '#top', icon: Home },
  { label: 'Add expense', href: '#expense-form', icon: Plus },
  { label: 'Metrics', href: '#metrics', icon: LayoutDashboard },
  { label: 'Analytics', href: '#analytics', icon: TrendingUp },
  { label: 'List', href: '#list', icon: Wallet2 },
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
    document.documentElement.classList.toggle('dark', savedTheme !== 'light')
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
  const statementDate = useMemo(
    () =>
      new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    []
  )

  const printStatement = () => {
    window.print()
  }

  return (
    <main id="top" className="bottom-safe-area min-h-screen px-4 py-4 text-slate-900 sm:px-6 lg:px-8 dark:text-slate-100">
      <div className="app-shell mx-auto flex w-full max-w-7xl flex-col gap-8">
        <motion.header {...cardMotion} className="panel relative overflow-hidden p-5 ring-1 ring-white/70 sm:p-8 dark:ring-white/5">
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-indigo-500/18 via-violet-400/12 to-fuchsia-500/14 dark:from-purple-500/18 dark:via-violet-400/10 dark:to-indigo-500/14" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent dark:via-violet-400/20" />
          <div className="relative space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl brand-gradient-bg p-3 text-white shadow-xl shadow-indigo-600/25 ring-1 ring-white/25">
                  <Wallet2 className="h-6 w-6" />
                </div>
                <div className="max-w-2xl">
                  <p className="section-kicker">Fenmo</p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                     Expense Tracker App
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 dark:text-slate-300 sm:text-base">
                    Track expenses effortlessly, monitor spending insights in real time, and manage your finances through a refined, premium dashboard experience.

                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <nav aria-label="Primary sections" className="hidden rounded-2xl border border-violet-200/70 bg-white/90 p-2 shadow-[0_16px_38px_rgba(60,45,120,0.12)] backdrop-blur-xl dark:border-white/12 dark:bg-white/8 lg:flex">
                  <div className="flex items-center gap-1.5">
                    {sectionNavItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          className="group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-violet-50 hover:text-violet-800 hover:shadow-sm focus:outline-none dark:text-slate-200 dark:hover:bg-white/12 dark:hover:text-white"
                        >
                          <Icon className="h-3.5 w-3.5 transition group-hover:scale-110" />
                          {item.label}
                        </a>
                      )
                    })}
                    <span className="mx-1 h-7 w-px bg-violet-200/80 dark:bg-white/12" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={printStatement}
                      className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white shadow-[0_10px_24px_rgba(15,23,42,0.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-[0_14px_32px_rgba(109,40,217,0.34)] focus:outline-none dark:bg-white dark:text-slate-950 dark:hover:bg-purple-100"
                    >
                      <Printer className="h-3.5 w-3.5 transition group-hover:scale-110" />
                      Statement
                    </button>
                  </div>
                </nav>

              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniMetric label="Visible total" value={formatINR(totalAmount)} icon={LayoutDashboard} accent="from-violet-700 via-purple-600 to-indigo-700" />
              <MiniMetric label="This month" value={formatINR(monthTotal)} icon={CalendarDays} accent="from-indigo-600 via-violet-600 to-fuchsia-600" />
              <MiniMetric label="Top category" value={topCategory?.name ?? 'None'} icon={TrendingUp} accent="from-slate-800 via-indigo-700 to-violet-700" />
            </div>
          </div>
        </motion.header>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="space-y-8 min-w-0">
            <motion.section
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
              id="expense-form"
              aria-labelledby="expense-form-heading"
              className="space-y-4"
            >
              <div className="panel px-6 py-5">
                <p className="section-kicker inline-flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5" /> Primary action
                </p>
                <h2 id="expense-form-heading" className="mt-2 text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">
                  Add expense
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Enter the amount first. The form stays above the fold and is the main action on the page.
                </p>
              </div>

              <ExpenseForm />
            </motion.section>

            <motion.div
              {...cardMotion}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 }}
              id="metrics"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              <StatTile label="Visible total" value={formatINR(totalAmount)} helper={`${totalCount} item${totalCount === 1 ? '' : 's'}`} />
              <StatTile label="Average ticket" value={formatINR(averageTicket)} helper="Per expense" />
              <StatTile label="This month" value={formatINR(monthTotal)} helper="All expenses" />
              <StatTile label="Top category" value={topCategory?.name ?? 'None'} helper={topCategory ? formatINR(topCategory.amount) : 'N/A'} />
            </motion.div>

            <motion.div {...cardMotion} transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }} id="analytics">
              <ExpenseAnalytics monthlySeries={monthlySeries} categorySeries={categorySeries} />
            </motion.div>

            <motion.div {...cardMotion} transition={{ duration: 0.35, ease: 'easeOut', delay: 0.12 }} id="list">
              <ExpenseList expenses={visibleExpenses} isLoading={expensesQuery.isLoading} isError={expensesQuery.isError} />
            </motion.div>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-6 xl:self-start" aria-label="Dashboard side panel">
            <motion.div {...cardMotion} transition={{ duration: 0.35, ease: 'easeOut', delay: 0.06 }}>
              <ExpenseSummary totalAmount={totalAmount} itemCount={totalCount} />
            </motion.div>

            <motion.div {...cardMotion} transition={{ duration: 0.35, ease: 'easeOut', delay: 0.09 }} id="filters">
              <ExpenseFilters categories={categories} category={category} onCategoryChange={setCategory} sort={sort} onSortChange={setSort} />
            </motion.div>

            <motion.nav {...cardMotion} transition={{ duration: 0.35, ease: 'easeOut', delay: 0.12 }} className="panel p-5" aria-label="Section shortcuts">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker inline-flex items-center gap-2">
                    <Wallet2 className="h-3.5 w-3.5" /> Page map
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-slate-950 dark:text-white">Jump to a section</h2>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Quick access without crowding the main flow.</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  type="button"
                  onClick={printStatement}
                  className="group flex items-center justify-between rounded-xl border border-violet-300/70 bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-[0_18px_38px_rgba(109,40,217,0.28)] dark:border-white/15 dark:bg-white dark:text-slate-950 dark:hover:bg-purple-100"
                >
                  <span className="inline-flex items-center gap-3">
                    <span className="rounded-lg bg-white/12 p-2 text-white dark:bg-slate-950/10 dark:text-slate-950">
                      <Download className="h-4 w-4" />
                    </span>
                    Print statement
                  </span>
                  <FileText className="h-4 w-4 opacity-80 transition group-hover:translate-x-0.5" />
                </button>
                {sectionNavItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="group flex items-center justify-between rounded-xl border border-violet-200/60 bg-gradient-to-r from-white to-violet-50/45 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-300/80 hover:text-violet-800 hover:shadow-md dark:border-white/10 dark:from-white/7 dark:to-white/5 dark:text-slate-200 dark:hover:border-purple-400/35 dark:hover:text-white"
                    >
                      <span className="inline-flex items-center gap-3">
                        <span className="rounded-lg bg-violet-600/10 p-2 text-violet-700 group-hover:bg-violet-600/18 dark:bg-purple-400/12 dark:text-purple-200">
                          <Icon className="h-4 w-4" />
                        </span>
                        {item.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 dark:text-slate-500" />
                    </a>
                  )
                })}
              </div>
            </motion.nav>
          </aside>
        </section>
      </div>
      <PrintableStatement
        expenses={visibleExpenses}
        totalAmount={totalAmount}
        totalCount={totalCount}
        averageTicket={averageTicket}
        topCategory={topCategory?.name ?? 'None'}
        statementDate={statementDate}
      />
      <div className="theme-toggle-wrap fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <FloatingNav />
    </main>
  )
}

function PrintableStatement({
  expenses,
  totalAmount,
  totalCount,
  averageTicket,
  topCategory,
  statementDate,
}: {
  expenses: Expense[]
  totalAmount: number
  totalCount: number
  averageTicket: number
  topCategory: string
  statementDate: string
}) {
  return (
    <section className="print-only" aria-label="Printable expense statement">
      <div className="statement-sheet">
        <header className="statement-header">
          <div>
            <p className="statement-kicker">Fenmo Expense OS</p>
            <h1>Expense Statement</h1>
            <p>Generated on {statementDate}</p>
          </div>
          <div className="statement-logo">₹</div>
        </header>

        <div className="statement-grid">
          <StatementMetric label="Visible total" value={formatINR(totalAmount)} />
          <StatementMetric label="Transactions" value={String(totalCount)} />
          <StatementMetric label="Average ticket" value={formatINR(averageTicket)} />
          <StatementMetric label="Top category" value={topCategory} />
        </div>

        <table className="statement-table">
          <thead>
            <tr>
              <th>Amount</th>
              <th>Category</th>
              <th>Description</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{formatINR(expense.amount)}</td>
                  <td>{expense.category}</td>
                  <td>{expense.description}</td>
                  <td>{new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(expense.date))}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4}>No expenses available for this statement.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function StatementMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
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
    <div className="group rounded-xl border border-violet-200/60 bg-gradient-to-br from-white to-violet-50/50 p-4 shadow-[0_10px_28px_rgba(53,35,112,0.08)] transition duration-200 ease-out hover:-translate-y-1 hover:border-violet-400/80 hover:shadow-[0_22px_46px_rgba(53,35,112,0.18)] dark:border-white/12 dark:from-white/9 dark:to-white/5 dark:hover:border-purple-400/35 dark:hover:shadow-[0_22px_52px_rgba(0,0,0,0.32),0_0_26px_rgba(168,85,247,0.14)]">
      <div className={`inline-flex rounded-lg bg-gradient-to-br ${accent} p-2 text-white shadow-lg shadow-black/20 ring-1 ring-white/20`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function StatTile({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="group rounded-xl border border-violet-200/55 bg-gradient-to-br from-white to-violet-50/40 p-4 shadow-[0_10px_28px_rgba(53,35,112,0.08)] transition duration-200 ease-out hover:-translate-y-1 hover:border-violet-400/80 hover:shadow-[0_22px_46px_rgba(53,35,112,0.18)] dark:border-white/12 dark:from-white/9 dark:to-white/5 dark:hover:border-purple-400/35 dark:hover:shadow-[0_22px_52px_rgba(0,0,0,0.32),0_0_26px_rgba(168,85,247,0.14)]">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{value}</p>
      <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">{helper}</p>
    </div>
  )
}
