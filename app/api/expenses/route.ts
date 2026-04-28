import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { ApiError, createExpense, listExpenses, parseJsonRequest } from '@/lib/expenses'

function errorResponse(error: unknown, fallbackMessage: string) {
    if (error instanceof ApiError) {
        return NextResponse.json(
            { message: error.message, issues: error.details },
            { status: error.status }
        )
    }

    return NextResponse.json({ message: fallbackMessage }, { status: 500 })
}

export async function POST(request: Request) {
    try {
        const body = await parseJsonRequest(request)
        const { expense, status } = await createExpense(prisma, body)
        return NextResponse.json(expense, { status })
    } catch (error) {
        return errorResponse(error, 'Unable to create expense')
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const expenses = await listExpenses(prisma, {
            category: url.searchParams.get('category') ?? undefined,
            sort: url.searchParams.get('sort'),
        })

        return NextResponse.json(expenses)
    } catch (error) {
        return errorResponse(error, 'Unable to load expenses')
    }
}
