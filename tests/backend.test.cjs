/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require('node:assert/strict')
const { createJiti } = require('jiti')

const jiti = createJiti(__filename, {
  alias: {
    '@': process.cwd(),
  },
})

const {
  ApiError,
  createExpense,
  listExpenses,
  normalizeExpensePayload,
} = jiti('../lib/expenses.ts')

function createMockClient() {
  const rows = []
  let id = 0

  return {
    rows,
    expense: {
      async findUnique({ where }) {
        return rows.find((row) => row.idempotencyKey === where.idempotencyKey) ?? null
      },
      async create({ data }) {
        if (rows.some((row) => row.idempotencyKey === data.idempotencyKey)) {
          const error = new Error('Unique constraint failed')
          error.code = 'P2002'
          throw error
        }

        const row = {
          id: `expense_${++id}`,
          ...data,
          createdAt: new Date(Date.UTC(2026, 0, id)),
        }
        rows.push(row)
        return row
      },
      async findMany({ where, orderBy }) {
        assert.deepEqual(orderBy, [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }])
        return rows
          .filter((row) => (where?.category ? row.category === where.category : true))
          .sort((left, right) => {
            const dateDiff = right.date.getTime() - left.date.getTime()
            if (dateDiff !== 0) return dateDiff
            const createdDiff = right.createdAt.getTime() - left.createdAt.getTime()
            if (createdDiff !== 0) return createdDiff
            return right.id.localeCompare(left.id)
          })
      },
    },
  }
}

const tests = []

function test(name, run) {
  tests.push({ name, run })
}

test('duplicate POST prevention returns the same row', async () => {
  const client = createMockClient()
  const payload = {
    amount: 12.34,
    category: ' food ',
    description: ' Lunch ',
    date: '2026-04-28',
    idempotencyKey: 'retry_key_123',
  }

  const first = await createExpense(client, payload)
  const second = await createExpense(client, payload)

  assert.equal(first.status, 201)
  assert.equal(second.status, 200)
  assert.equal(client.rows.length, 1)
  assert.equal(first.expense.id, second.expense.id)
})

test('category filter normalizes category input', async () => {
  const client = createMockClient()
  await createExpense(client, { amount: 10, category: ' food ', description: 'Lunch', date: '2026-04-28' })
  await createExpense(client, { amount: 20, category: 'Travel', description: 'Cab', date: '2026-04-27' })

  const expenses = await listExpenses(client, { category: '  food  ', sort: 'date_desc' })

  assert.equal(expenses.length, 1)
  assert.equal(expenses[0].category, 'Food')
})

test('date sorting is descending and stable', async () => {
  const client = createMockClient()
  await createExpense(client, { amount: 10, category: 'Food', description: 'Old', date: '2026-04-26' })
  await createExpense(client, { amount: 20, category: 'Food', description: 'Newer A', date: '2026-04-28' })
  await createExpense(client, { amount: 30, category: 'Food', description: 'Newer B', date: '2026-04-28' })

  const expenses = await listExpenses(client, { sort: 'date_desc' })

  assert.deepEqual(expenses.map((expense) => expense.description), ['Newer B', 'Newer A', 'Old'])
})

test('validation rejects invalid data', async () => {
  const client = createMockClient()

  await assert.rejects(
    () => createExpense(client, { amount: 0, category: '', description: '', date: 'not-a-date' }),
    (error) => error instanceof ApiError && error.status === 400
  )
})

test('money precision converts safely to integer paise', () => {
  const data = normalizeExpensePayload({
    amount: 0.1 + 0.2,
    category: 'Bills',
    description: 'Precision check',
    date: '2026-04-28',
  })

  assert.equal(data.amount, 30)
})

test('idempotency conflict is rejected when payload changes', async () => {
  const client = createMockClient()
  const idempotencyKey = 'same_key_123'

  await createExpense(client, {
    amount: 10,
    category: 'Food',
    description: 'Lunch',
    date: '2026-04-28',
    idempotencyKey,
  })

  await assert.rejects(
    () =>
      createExpense(client, {
        amount: 11,
        category: 'Food',
        description: 'Lunch',
        date: '2026-04-28',
        idempotencyKey,
      }),
    (error) => error instanceof ApiError && error.status === 409
  )
})

async function main() {
  for (const { name, run } of tests) {
    await run()
    console.log(`ok - ${name}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
