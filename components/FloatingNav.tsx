"use client"

import { BarChart3, Home, PlusCircle, Settings2, UserRound } from 'lucide-react'

const items = [
  { label: 'Home', href: '#top', icon: Home },
  { label: 'Analytics', href: '#analytics', icon: BarChart3 },
  { label: 'Add', href: '#expense-form', icon: PlusCircle },
  { label: 'Filters', href: '#filters', icon: Settings2 },
  { label: 'Profile', href: '#top', icon: UserRound },
]

export default function FloatingNav() {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:bottom-6">
      <nav className="floating-nav w-full max-w-[430px] px-3 py-2.5">
        <div className="grid grid-cols-5 gap-1">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <a
                key={item.label}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 rounded-[1.1rem] py-2 text-[11px] font-medium transition ${
                  index === 0
                    ? 'bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-lg shadow-violet-600/25'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
