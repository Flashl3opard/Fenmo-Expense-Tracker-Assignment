import { formatINR } from '@/lib/utils'

type ExpenseSummaryProps = {
  totalAmount: number
  itemCount: number
}

export default function ExpenseSummary({ totalAmount, itemCount }: ExpenseSummaryProps) {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Visible total</p>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{formatINR(totalAmount)}</div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{itemCount} visible expense{itemCount === 1 ? '' : 's'}</p>
    </div>
  )
}
