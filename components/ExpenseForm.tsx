"use client"

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeIndianRupee, CalendarDays, FileSpreadsheet, Layers3, Sparkles, Upload } from 'lucide-react'
import { ExpenseCreateSchema } from '@/lib/validations'
import { createLocalExpense } from '@/lib/localDb'

type ExpenseFormValues = z.infer<typeof ExpenseCreateSchema>

type ExpenseFormProps = {
  onCreated?: () => void
}

const suggestedCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Subscriptions', 'Travel']

function parseCsvLine(line: string) {
  const cells: string[] = []
  let value = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"' && nextCharacter === '"') {
      value += '"'
      index += 1
    } else if (character === '"') {
      inQuotes = !inQuotes
    } else if (character === ',' && !inQuotes) {
      cells.push(value.trim())
      value = ''
    } else {
      value += character
    }
  }

  cells.push(value.trim())
  return cells
}

function normalizeCsvDate(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const parsed = new Date(trimmed)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return trimmed
}

function parseExpenseCsv(text: string): ExpenseFormValues[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  const firstRow = parseCsvLine(lines[0]).map((cell) => cell.toLowerCase())
  const hasHeader = ['amount', 'category', 'description', 'date'].some((field) => firstRow.includes(field))
  const headers = hasHeader ? firstRow : ['amount', 'category', 'description', 'date']
  const rows = hasHeader ? lines.slice(1) : lines

  return rows.map((line) => {
    const cells = parseCsvLine(line)
    const row = new Map(headers.map((header, index) => [header, cells[index] ?? '']))
    const amount = Number(String(row.get('amount') ?? '').replace(/[₹,\s]/g, ''))

    return {
      amount,
      category: row.get('category') ?? '',
      description: row.get('description') ?? '',
      date: normalizeCsvDate(row.get('date') ?? ''),
      idempotencyKey: uuidv4(),
    }
  })
}

export default function ExpenseForm({ onCreated }: ExpenseFormProps) {
  const queryClient = useQueryClient()
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => uuidv4())
  const [importStatus, setImportStatus] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseCreateSchema),
    defaultValues: {
      amount: 0,
      category: '',
      description: '',
      date: '',
      idempotencyKey,
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: ExpenseFormValues) => {
      return createLocalExpense(values as any)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      const nextKey = uuidv4()
      setIdempotencyKey(nextKey)
      form.reset({
        amount: 0,
        category: '',
        description: '',
        date: '',
        idempotencyKey: nextKey,
      })
      onCreated?.()
    },
  })

  const submit = form.handleSubmit((values) => {
    mutation.mutate({
      ...values,
      idempotencyKey,
    })
  })

  const importCsv = async (file: File) => {
    setIsImporting(true)
    setImportStatus('Reading CSV...')

    try {
      const rows = parseExpenseCsv(await file.text())
      if (rows.length === 0) {
        setImportStatus('No rows found in CSV.')
        return
      }

      let imported = 0
      for (const row of rows) {
        const parsed = ExpenseCreateSchema.safeParse(row)
        if (!parsed.success) {
          throw new Error(`Row ${imported + 1} is invalid. Use amount, category, description, date.`)
        }

        await createLocalExpense(parsed.data as any)

        imported += 1
        setImportStatus(`Imported ${imported} of ${rows.length}...`)
      }

      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      setImportStatus(`Imported ${imported} expense${imported === 1 ? '' : 's'} from CSV.`)
      onCreated?.()
    } catch (error) {
      setImportStatus(error instanceof Error ? error.message : 'Unable to import CSV.')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onSubmit={submit}
      className="panel relative overflow-hidden ring-1 ring-white/60 dark:ring-white/5"
    >
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-indigo-500/16 via-violet-400/12 to-fuchsia-500/12 dark:from-purple-500/18 dark:via-violet-400/10 dark:to-indigo-500/14" />
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Quick entry
            </p>
            <h2 className="mt-2.5 text-2xl font-bold text-slate-950 dark:text-white">Add expense</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Fast, secure entry with retry-safe protection and smart category suggestions.
            </p>
          </div>
          <div className="rounded-xl brand-gradient-bg p-2.5 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-white/20">
            <BadgeIndianRupee className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Amount" icon={<BadgeIndianRupee className="h-4 w-4" />}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-600 dark:text-slate-300">&#8377;</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input !pl-9 text-lg font-bold tracking-tight"
                placeholder="0.00"
                {...form.register('amount', { valueAsNumber: true })}
              />
            </div>
            <FieldError message={form.formState.errors.amount?.message} />
          </Field>

          <Field label="Category" icon={<Layers3 className="h-4 w-4" />}>
            <input className="input" placeholder="Food" list="expense-category-options" {...form.register('category')} />
            <datalist id="expense-category-options">
              {suggestedCategories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedCategories.slice(0, 4).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => form.setValue('category', category, { shouldValidate: true })}
                  className="rounded-lg border border-violet-200/70 bg-gradient-to-r from-white to-violet-50/50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-violet-300/80 hover:from-violet-50 hover:to-white hover:text-violet-800 dark:border-white/10 dark:from-white/7 dark:to-white/5 dark:text-slate-200 dark:hover:border-purple-400/35 dark:hover:from-white/12 dark:hover:to-white/8 dark:hover:text-purple-200"
                >
                  {category}
                </button>
              ))}
            </div>
            <FieldError message={form.formState.errors.category?.message} />
          </Field>

          <Field label="Description" full>
            <textarea className="input min-h-24 resize-none" placeholder="Lunch with the team" {...form.register('description')} />
            <FieldError message={form.formState.errors.description?.message} />
          </Field>

          <Field label="Date" icon={<CalendarDays className="h-4 w-4" />}>
            <input type="date" className="input" {...form.register('date')} />
            <FieldError message={form.formState.errors.date?.message} />
          </Field>
        </div>

        <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary min-w-[200px] justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? 'Saving...' : 'Save expense'}
            {!mutation.isPending ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void importCsv(file)
            }}
          />
          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl border border-violet-200/70 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-[0_10px_24px_rgba(53,35,112,0.1)] transition hover:-translate-y-0.5 hover:border-violet-400 hover:text-violet-800 hover:shadow-[0_16px_34px_rgba(53,35,112,0.16)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/12 dark:bg-white/10 dark:text-white dark:hover:border-purple-300/40"
          >
            {isImporting ? <FileSpreadsheet className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
            {isImporting ? 'Importing...' : 'Import CSV'}
          </button>
          {mutation.isError ? <p className="text-sm font-medium text-rose-600 dark:text-rose-400">{mutation.error.message}</p> : null}
        </div>
        {importStatus ? (
          <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
            {importStatus}
          </p>
        ) : null}
      </div>
    </motion.form>
  )
}

function Field({
  label,
  children,
  full = false,
  icon,
}: {
  label: string
  children: React.ReactNode
  full?: boolean
  icon?: React.ReactNode
}) {
  return (
    <label className={full ? 'sm:col-span-2' : ''}>
      <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
        {icon}
        {label}
      </span>
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{message}</p>
}
