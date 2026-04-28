import { motion } from 'framer-motion'
import { formatINR } from '@/lib/utils'
import { Wallet2, Lock } from 'lucide-react'

type ExpenseSummaryProps = {
  totalAmount: number
  itemCount: number
}

export default function ExpenseSummary({ totalAmount, itemCount }: ExpenseSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="panel-dark relative overflow-hidden p-6"
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-purple-500/15 via-violet-400/10 to-indigo-500/15" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker">Visible overview</p>
            <h2 className="mt-2.5 text-3xl font-bold tracking-tight text-white">{formatINR(totalAmount)}</h2>
            <p className="mt-2 text-sm text-white/70">{itemCount} visible expense{itemCount === 1 ? '' : 's'}</p>
          </div>

          <div className="rounded-xl brand-gradient-bg p-2.5 text-white shadow-lg shadow-purple-600/30">
            <Wallet2 className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/12 bg-white/8 p-4 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Items</p>
            <p className="mt-2 text-2xl font-bold text-white">{itemCount}</p>
          </div>
          <div className="rounded-xl border border-white/12 bg-white/8 p-4 backdrop-blur">
            <p className="mt-0 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              <Lock className="h-3 w-3" /> Protected
            </p>
            <p className="mt-2 text-sm font-semibold text-emerald-200">Retry-safe</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
