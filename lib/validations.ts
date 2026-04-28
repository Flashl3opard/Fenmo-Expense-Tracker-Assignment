import { z } from 'zod'

const MAX_AMOUNT = 1_000_000_000
const MIN_DATE = new Date('1900-01-01T00:00:00.000Z')
const MAX_DESCRIPTION_LENGTH = 200
const MAX_CATEGORY_LENGTH = 60

export function normalizeText(value: string) {
    return value.trim().replace(/\s+/g, ' ')
}

export function normalizeCategory(value: string) {
    const normalized = normalizeText(value)
    return normalized ? normalized[0].toUpperCase() + normalized.slice(1) : normalized
}

function hasTwoOrFewerDecimals(value: number) {
    return Number.isInteger(Math.round((value + Number.EPSILON) * 100))
}

export const ExpenseCreateSchema = z.object({
    amount: z.number({ error: 'Amount must be a number' })
        .finite('Amount must be a finite number')
        .positive('Amount must be greater than 0')
        .max(MAX_AMOUNT, 'Amount is too large')
        .refine(hasTwoOrFewerDecimals, 'Amount cannot have more than 2 decimal places'),
    category: z.string({ error: 'Category is required' })
        .transform(normalizeCategory)
        .pipe(z.string().min(1, 'Category is required').max(MAX_CATEGORY_LENGTH, 'Category is too long')),
    description: z.string({ error: 'Description is required' })
        .transform(normalizeText)
        .pipe(z.string().min(1, 'Description is required').max(MAX_DESCRIPTION_LENGTH, 'Description is too long')),
    date: z.string({ error: 'Date is required' })
        .trim()
        .min(1, 'Date is required')
        .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date')
        .refine((value) => new Date(value) >= MIN_DATE, 'Date is too old'),
    idempotencyKey: z.string()
        .trim()
        .min(8, 'Invalid idempotency key')
        .max(128, 'Invalid idempotency key')
        .regex(/^[A-Za-z0-9:_-]+$/, 'Invalid idempotency key')
        .optional(),
})

export type ExpenseCreateInput = z.infer<typeof ExpenseCreateSchema>
