"use client"

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { ExpenseCreateSchema } from '@/lib/validations'

type ExpenseFormValues = z.infer<typeof ExpenseCreateSchema>

type ExpenseFormProps = {
  onCreated?: () => void
}

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
    <form onSubmit={submit} className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm shadow-black/5 dark:border-white/10 dark:bg-white/5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Add expense</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Clean, retry-safe entry form with idempotency protection.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount">
          <input
            type="number"
            step="0.01"
            min="0"
            className="input"
            placeholder="0.00"
            {...form.register('amount', { valueAsNumber: true })}
          />
          <FieldError message={form.formState.errors.amount?.message} />
        </Field>

        <Field label="Category">
          <input className="input" placeholder="Food" {...form.register('category')} />
          <FieldError message={form.formState.errors.category?.message} />
        </Field>

        <Field label="Description" full>
          <input className="input" placeholder="Lunch with team" {...form.register('description')} />
          <FieldError message={form.formState.errors.description?.message} />
        </Field>

        <Field label="Date">
          <input type="date" className="input" {...form.register('date')} />
          <FieldError message={form.formState.errors.date?.message} />
        </Field>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {mutation.isPending ? 'Saving...' : 'Save expense'}
        </button>
        {mutation.isError ? <p className="text-sm text-rose-600 dark:text-rose-400">{mutation.error.message}</p> : null}
      </div>
    </form>
  )
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={full ? 'sm:col-span-2' : ''}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{message}</p>
}
