import { formatINR } from '@/lib/utils'
import { ArrowUpRight, Wallet2 } from 'lucide-react'

type ExpenseSummaryProps = {
  totalAmount: number
  itemCount: number
}

export default function ExpenseSummary({ totalAmount, itemCount }: ExpenseSummaryProps) {
  return (
    <div className="panel-dark overflow-hidden p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Visible total</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{formatINR(totalAmount)}</h2>
          <p className="mt-2 text-sm text-white/65">{itemCount} visible expense{itemCount === 1 ? '' : 's'}</p>
        </div>

        <div className="rounded-2xl bg-white/10 p-3 text-white/80 ring-1 ring-white/10">
          <Wallet2 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/75">
        <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
          <p className="text-white/55">Visible items</p>
          <p className="mt-1 text-lg font-semibold text-white">{itemCount}</p>
        </div>
        <div className="rounded-2xl bg-white/8 border border-white/10 p-4">
          <p className="text-white/55">Protection</p>
          <p className="mt-1 inline-flex items-center gap-1 text-lg font-semibold text-emerald-300">
            Retry-safe <ArrowUpRight className="h-4 w-4" />
          </p>
        </div>
      </div>
    </div>
  )
}
