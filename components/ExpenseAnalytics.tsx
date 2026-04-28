"use client"

import { useEffect, useState } from 'react'
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
    setMounted(true)
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="panel-dark overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="section-kicker">Monthly overview</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Spending trend</h2>
            <p className="mt-1 text-sm text-white/65">A smooth view of the last six months of activity.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-white/80 ring-1 ring-white/10">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="h-[320px] px-2 py-4 sm:px-4">
          {mounted && monthlySeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} width={36} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.92)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 16,
                    color: '#fff',
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
                  }}
                  labelStyle={{ color: 'rgba(255,255,255,0.75)' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Expenses']}
                />
                <Area type="monotone" dataKey="amount" stroke="#a78bfa" strokeWidth={3} fill="url(#expenseArea)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart title="No monthly data yet" description="Add a few expenses to unlock your spending trend." />
          )}
        </div>
      </section>

      <section className="panel-dark overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <p className="section-kicker">Category analytics</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Spend mix</h2>
            <p className="mt-1 text-sm text-white/65">See where the visible expenses are concentrated.</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3 text-white/80 ring-1 ring-white/10">
            <PieChart className="h-5 w-5" />
          </div>
        </div>

        <div className="h-[320px] px-2 py-4 sm:px-4">
          {mounted && categorySeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categorySeries} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} width={36} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.92)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 16,
                    color: '#fff',
                    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.35)',
                  }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Category total']}
                />
                <Bar dataKey="amount" radius={[16, 16, 4, 4]} fill="url(#categoryGradient)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart title="No category breakdown yet" description="Visible category spend will appear here once you add expenses." />
          )}
        </div>

        <svg width="0" height="0" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="categoryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </section>
    </div>
  )
}

function EmptyChart({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 px-6 text-center">
      <div className="rounded-2xl bg-white/10 p-4 text-white/70">
        <TrendingUp className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-white/65">{description}</p>
    </div>
  )
}
