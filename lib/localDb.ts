import { v4 as uuidv4 } from 'uuid'
import { amountToPaise } from './utils'

export type Expense = {
  id: string
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
  idempotencyKey?: string
}

export type ExpenseCreateData = {
  amount: number
  category: string
  description: string
  date: string
  idempotencyKey?: string
}

const STORAGE_KEY = 'fenmo_expenses_db'

function getLocalExpenses(): Expense[] {
  if (typeof window === 'undefined') return []
  try {
    const data = window.localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveLocalExpenses(expenses: Expense[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
}

export async function fetchLocalExpenses(category?: string, sort: string = 'date_desc'): Promise<Expense[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  
  let expenses = getLocalExpenses()
  
  if (category) {
    expenses = expenses.filter(e => e.category === category)
  }
  
  if (sort === 'date_desc') {
    expenses.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      if (dateA !== dateB) return dateB - dateA
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }
  
  return expenses
}

export async function createLocalExpense(data: ExpenseCreateData): Promise<Expense> {
  await new Promise(resolve => setTimeout(resolve, 150))
  
  const expenses = getLocalExpenses()
  
  // Idempotency check
  if (data.idempotencyKey) {
    const existing = expenses.find(e => e.idempotencyKey === data.idempotencyKey)
    if (existing) {
      return existing
    }
  }

  const newExpense: Expense = {
    id: uuidv4(),
    amount: amountToPaise(data.amount),
    category: data.category,
    description: data.description,
    date: new Date(data.date).toISOString(),
    createdAt: new Date().toISOString(),
    idempotencyKey: data.idempotencyKey,
  }
  
  expenses.push(newExpense)
  saveLocalExpenses(expenses)
  
  return newExpense
}
