import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { amountToPaise } from '@/lib/utils'
import { ExpenseCreateSchema } from '@/lib/validations'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = ExpenseCreateSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { message: 'Validation failed', issues: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const { amount, category, description, date, idempotencyKey } = parsed.data

        const existing = await prisma.expense.findUnique({ where: { idempotencyKey } })
        if (existing) {
            return NextResponse.json(existing, { status: 200 })
        }

        const created = await prisma.expense.create({
            data: {
                amount: amountToPaise(amount),
                category,
                description,
                date: new Date(date),
                idempotencyKey,
            },
        })

        return NextResponse.json(created, { status: 201 })
    } catch {
        return NextResponse.json({ message: 'Unable to create expense' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const category = url.searchParams.get('category')?.trim() || undefined
        const sort = url.searchParams.get('sort')

        const expenses = await prisma.expense.findMany({
            where: category ? { category } : undefined,
            orderBy: sort === 'date_desc' ? { date: 'desc' } : { date: 'desc' },
        })

        return NextResponse.json(expenses)
    } catch {
        return NextResponse.json({ message: 'Unable to load expenses' }, { status: 500 })
    }
}
