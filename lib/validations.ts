import { z } from 'zod'

export const ExpenseCreateSchema = z.object({
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    category: z.string().trim().min(1, 'Category is required'),
    description: z.string().trim().min(1, 'Description is required').max(200, 'Description is too long'),
    date: z.string().trim().min(1, 'Date is required').refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date'),
    idempotencyKey: z.string().uuid('Invalid idempotency key'),
})

export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>
