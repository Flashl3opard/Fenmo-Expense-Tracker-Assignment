import { formatDate, formatINR } from '@/lib/utils'

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
    return <State message="Loading expenses..." />
  }

  if (isError) {
    return <State message="Unable to load expenses right now." />
  }

  if (expenses.length === 0) {
    return <State message="No expenses yet. Add your first one above." />
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-black/5 px-5 py-4 dark:border-white/10">
        <h2 className="text-lg font-semibold">Expenses</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-black/5 text-sm dark:divide-white/10">
          <thead>
            <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {expenses.map((expense) => (
              <tr key={expense.id} className="transition hover:bg-black/2 dark:hover:bg-white/5">
                <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{formatINR(expense.amount)}</td>
                <td className="px-5 py-4 text-slate-700 dark:text-slate-300">{expense.category}</td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{expense.description}</td>
                <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDate(expense.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function State({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-black/10 bg-white/70 px-5 py-10 text-center text-sm text-slate-600 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
      {message}
    </div>
  )
}
