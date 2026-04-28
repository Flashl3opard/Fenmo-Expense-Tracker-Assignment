"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PieChart, Activity, TrendingUp } from 'lucide-react'

type MonthlyPoint = {
  label: string
  amount: number
}

type CategoryPoint = {
  name: string
  amount: number
}

type ExpenseAnalyticsProps = {
  monthlySeries: MonthlyPoint[]
  categorySeries: CategoryPoint[]
}

export default function ExpenseAnalytics({ monthlySeries, categorySeries }: ExpenseAnalyticsProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0 }}
        className="panel-dark overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="section-kicker">Monthly overview</p>
            <h2 className="mt-2 text-xl font-bold text-white">Spending trend</h2>
            <p className="mt-1 text-sm text-white/70">Last 6 months of activity with smooth trend visualization.</p>
          </div>
          <div className="rounded-xl brand-gradient-bg p-2.5 text-white shadow-lg shadow-purple-600/30">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="h-[320px] px-2 py-4 sm:px-4">
          {mounted && monthlySeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} width={40} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 5, 21, 0.95)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: 12,
                    color: '#fff',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                    padding: '12px 16px',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Expenses']}
                />
                <Area type="monotone" dataKey="amount" stroke="#c084fc" strokeWidth={3} fill="url(#expenseArea)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart title="No monthly data yet" description="Add a few expenses to see your spending trend." />
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
        className="panel-dark overflow-hidden"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="section-kicker">Category breakdown</p>
            <h2 className="mt-2 text-xl font-bold text-white">Spend mix</h2>
            <p className="mt-1 text-sm text-white/70">Top 5 categories by total spend.</p>
          </div>
          <div className="rounded-xl brand-gradient-bg p-2.5 text-white shadow-lg shadow-purple-600/30">
            <PieChart className="h-5 w-5" />
          </div>
        </div>

        <div className="h-[320px] px-2 py-4 sm:px-4">
          {mounted && categorySeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 12 }} width={40} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 5, 21, 0.95)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: 12,
                    color: '#fff',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
                    padding: '12px 16px',
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Category total']}
                />
                <Bar dataKey="amount" radius={[12, 12, 4, 4]} fill="url(#categoryGradient)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart title="No category data yet" description="Add expenses to see category breakdown." />
          )}
        </div>

        <svg width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
      </motion.section>
    </div>
  )
}

function EmptyChart({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/5 px-6 text-center">
      <div className="rounded-xl brand-gradient-bg p-3 text-white shadow-lg shadow-purple-600/20">
        <TrendingUp className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-xs text-white/65">{description}</p>
    </div>
  )
}
