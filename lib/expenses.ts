import { createHash } from 'crypto'
import type { PrismaClient } from '@prisma/client'
import { amountToPaise } from '@/lib/utils'
import { ExpenseCreateSchema, normalizeCategory } from '@/lib/validations'

export const MAX_EXPENSE_PAYLOAD_BYTES = 16 * 1024

type ExpenseClient = Pick<PrismaClient, 'expense'>

type PrismaConflictError = {
    code?: string
}

export type ExpensePayload = {
    amount: number
    category: string
    description: string
    date: string
    idempotencyKey?: string
}

export type ExpenseCreateData = {
    amount: number
    category: string
    description: string
    date: Date
    idempotencyKey: string
}

export type ExpenseQuery = {
    category?: string
    sort?: string | null
}

export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public details?: unknown
    ) {
        super(message)
    }
}

export function canonicalDate(value: string) {
    const date = new Date(value)
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function expenseFingerprint(data: Omit<ExpenseCreateData, 'idempotencyKey'>) {
    return [
        data.amount,
        data.category.toLowerCase(),
        data.description,
        data.date.toISOString(),
    ].join('|')
}

export function buildIdempotencyKey(data: Omit<ExpenseCreateData, 'idempotencyKey'>, requestedKey?: string) {
    if (requestedKey) return requestedKey

    const digest = createHash('sha256').update(expenseFingerprint(data)).digest('hex')
    return `auto_${digest}`
}

export function normalizeExpensePayload(payload: unknown): ExpenseCreateData {
    const parsed = ExpenseCreateSchema.safeParse(payload)
    if (!parsed.success) {
        throw new ApiError(400, 'Validation failed', parsed.error.flatten())
    }

    const amount = amountToPaise(parsed.data.amount)
    const date = canonicalDate(parsed.data.date)
    const data = {
        amount,
        category: parsed.data.category,
        description: parsed.data.description,
        date,
    }

    return {
        ...data,
        idempotencyKey: buildIdempotencyKey(data, parsed.data.idempotencyKey),
    }
}

export function isSameExpense(existing: ExpenseCreateData, incoming: ExpenseCreateData) {
    return (
        existing.amount === incoming.amount &&
        existing.category === incoming.category &&
        existing.description === incoming.description &&
        existing.date.getTime() === incoming.date.getTime() &&
        existing.idempotencyKey === incoming.idempotencyKey
    )
}

export async function parseJsonRequest(request: Request) {
    const contentLength = request.headers.get('content-length')
    if (contentLength && Number(contentLength) > MAX_EXPENSE_PAYLOAD_BYTES) {
        throw new ApiError(413, 'Payload too large')
    }

    const rawBody = await request.text()
    if (!rawBody.trim()) {
        throw new ApiError(400, 'Request body is required')
    }

    if (new TextEncoder().encode(rawBody).length > MAX_EXPENSE_PAYLOAD_BYTES) {
        throw new ApiError(413, 'Payload too large')
    }

    try {
        return JSON.parse(rawBody) as unknown
    } catch {
        throw new ApiError(400, 'Malformed JSON')
    }
}

export async function createExpense(client: ExpenseClient, payload: unknown) {
    const data = normalizeExpensePayload(payload)
    const existing = await client.expense.findUnique({ where: { idempotencyKey: data.idempotencyKey } })

    if (existing) {
        if (!isSameExpense(existing, data)) {
            throw new ApiError(409, 'Idempotency key already used for a different expense')
        }

        return { expense: existing, status: 200 }
    }

    try {
        const created = await client.expense.create({ data })
        return { expense: created, status: 201 }
    } catch (error) {
        if ((error as PrismaConflictError).code === 'P2002') {
            const duplicate = await client.expense.findUnique({ where: { idempotencyKey: data.idempotencyKey } })
            if (duplicate && isSameExpense(duplicate, data)) {
                return { expense: duplicate, status: 200 }
            }
            throw new ApiError(409, 'Idempotency key already used for a different expense')
        }

        throw error
    }
}

export function normalizeExpenseQuery(query: ExpenseQuery) {
    const sort = query.sort ?? 'date_desc'
    if (sort !== 'date_desc') {
        throw new ApiError(400, 'Unsupported sort parameter')
    }

    const category = query.category ? normalizeCategory(query.category) : undefined
    return { category, sort }
}

export async function listExpenses(client: ExpenseClient, query: ExpenseQuery) {
    const normalized = normalizeExpenseQuery(query)

    return client.expense.findMany({
        where: normalized.category ? { category: normalized.category } : undefined,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
    })
}
