import { formatDate, formatINR } from '@/lib/utils'
import { Clock3, ReceiptText } from 'lucide-react'

type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

type ExpenseListProps = {
  expenses: Expense[]
  isLoading: boolean
  isError: boolean
}

export default function ExpenseList({ expenses, isLoading, isError }: ExpenseListProps) {
  if (isLoading) {
    return <State title="Loading expenses" message="Syncing your latest visible transactions." />
  }

  if (isError) {
    return <State title="Unable to load expenses" message="Please retry in a moment." />
  }

  if (expenses.length === 0) {
    return <State title="No expenses yet" message="Add your first transaction to start tracking spending." />
  }

  return (
    <div className="panel-dark overflow-hidden ring-1 ring-white/5">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div>
          <p className="section-kicker inline-flex items-center gap-2">
            <ReceiptText className="h-3.5 w-3.5" /> Recent activity
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">Expense timeline</h2>
          <p className="mt-1 text-sm text-white/72">Your newest visible transactions, styled like a premium finance product.</p>
        </div>

        <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75 ring-1 ring-white/10 md:flex">
          <Clock3 className="h-3.5 w-3.5" /> Sorted by newest first
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/7">
            <tr className="text-left text-[11px] uppercase tracking-[0.2em] text-white/58">
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Description</th>
              <th className="px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {expenses.map((expense) => (
              <tr key={expense.id} className="transition hover:bg-white/5">
                <td className="px-6 py-4 font-semibold text-white">{formatINR(expense.amount)}</td>
                <td className="px-6 py-4 text-white/82">
                  <span className="inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1 text-xs font-semibold text-white/88">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-white/76">{expense.description}</td>
                <td className="px-6 py-4 text-white/68">{formatDate(expense.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function State({ title, message }: { title: string; message: string }) {
  return (
    <div className="panel-dark flex flex-col items-center justify-center rounded-3xl px-6 py-12 text-center ring-1 ring-white/5">
      <div className="rounded-xl bg-white/10 p-4 text-white/85 ring-1 ring-white/12">
        <ReceiptText className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-white/72">{message}</p>
    </div>
  )
}
