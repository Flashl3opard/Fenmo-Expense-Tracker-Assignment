"use client"

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeIndianRupee, CalendarDays, Layers3, Sparkles } from 'lucide-react'
import { ExpenseCreateSchema } from '@/lib/validations'

type ExpenseFormValues = z.infer<typeof ExpenseCreateSchema>

type ExpenseFormProps = {
  onCreated?: () => void
}

const suggestedCategories = ['Food', 'Transport', 'Shopping', 'Bills', 'Subscriptions', 'Travel']

export default function ExpenseForm({ onCreated }: ExpenseFormProps) {
  const queryClient = useQueryClient()
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => uuidv4())

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
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to save expense')
      }

      return payload
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

  return (
    <motion.form
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onSubmit={submit}
      className="panel relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-violet-500/20 via-cyan-400/10 to-emerald-400/20" />
      <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Quick entry
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Add expense</h2>
            <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
              Premium form with retry-safe idempotency, validation states, and fast entry helpers.
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 p-3 text-slate-700 shadow-sm shadow-black/5 ring-1 ring-black/5 backdrop-blur dark:bg-white/10 dark:text-white dark:ring-white/10">
            <BadgeIndianRupee className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Amount" icon={<BadgeIndianRupee className="h-4 w-4" />}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input !pl-9 text-lg font-semibold tracking-tight"
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
                  className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-400/40 hover:bg-violet-50 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {category}
                </button>
              ))}
            </div>
            <FieldError message={form.formState.errors.category?.message} />
          </Field>

          <Field label="Description" full>
            <textarea className="input min-h-28 resize-none" placeholder="Lunch with the team" {...form.register('description')} />
            <FieldError message={form.formState.errors.description?.message} />
          </Field>

          <Field label="Date" icon={<CalendarDays className="h-4 w-4" />}>
            <input type="date" className="input" {...form.register('date')} />
            <FieldError message={form.formState.errors.date?.message} />
          </Field>
        </div>

        <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:scale-[1.01] hover:shadow-violet-600/35 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? 'Saving...' : 'Save expense'}
          {!mutation.isPending ? <ArrowRight className="h-4 w-4" /> : null}
        </button>
        {mutation.isError ? <p className="text-sm text-rose-600 dark:text-rose-400">{mutation.error.message}</p> : null}
        </div>
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
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
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
