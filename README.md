# Expense Tracker

A Next.js app for tracking expenses with a small backend that validates, normalizes, and stores expenses in SQLite via Prisma.

## Features

- Create expenses with idempotency support.
- List expenses with optional category filtering.
- Strong backend validation with clear error responses.
- SQLite storage via Prisma.

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Generate Prisma client

```bash
npm run prisma:generate
```

3) Run migrations (creates SQLite db)

```bash
npm run prisma:migrate
```

4) Start the dev server

```bash
npm run dev
```

Open http://localhost:3000

## Backend API

Base URL: `/api/expenses`

### POST /api/expenses

Create a new expense. If an identical request is sent with the same idempotency key, the API returns the existing record instead of creating a duplicate.

Request body (JSON):

```json
{
	"amount": 499.5,
	"category": "Food",
	"description": "Lunch",
	"date": "2026-04-30",
	"idempotencyKey": "optional_key_123"
}
```

Response:

- `201 Created` when a new expense is stored.
- `200 OK` when the idempotency key already exists with the same payload.

Response body:

```json
{
	"id": "uuid",
	"amount": 49950,
	"category": "Food",
	"description": "Lunch",
	"date": "2026-04-30T00:00:00.000Z",
	"createdAt": "2026-04-30T10:42:21.000Z",
	"idempotencyKey": "optional_key_123"
}
```

Notes:

- `amount` is stored in paise (cents) as an integer.
- `date` is normalized to midnight UTC for consistent ordering.

### GET /api/expenses

List expenses, ordered by date desc, createdAt desc, id desc.

Query params:

- `category` (optional): filters by normalized category.
- `sort` (optional): only `date_desc` is accepted; any other value returns 400.

Example:

```
/api/expenses?category=food&sort=date_desc
```

Response:

```json
[
	{
		"id": "uuid",
		"amount": 49950,
		"category": "Food",
		"description": "Lunch",
		"date": "2026-04-30T00:00:00.000Z",
		"createdAt": "2026-04-30T10:42:21.000Z",
		"idempotencyKey": "auto_..."
	}
]
```

## Backend Validation

Validation runs in the API handler before any database write. Errors return `400` with a `message` and `issues` payload that contains field-level details.

### Request body size

- Max JSON payload size: 16 KB.
- If `Content-Length` or actual payload size exceeds the limit, the API returns `413 Payload too large`.

### Required fields and rules

- `amount` (number)
	- Must be a finite number.
	- Must be greater than 0.
	- Must be less than or equal to 1,000,000,000.
	- Must have at most 2 decimal places.
	- Stored as paise using `Math.round(amount * 100)`.

- `category` (string)
	- Required and trimmed.
	- Collapses repeated whitespace.
	- Max length 60.
	- Normalized to Title Case for the first character.

- `description` (string)
	- Required and trimmed.
	- Collapses repeated whitespace.
	- Max length 200.

- `date` (string)
	- Required.
	- Must parse as a valid date.
	- Must be on or after 1900-01-01.
	- Normalized to UTC midnight.

- `idempotencyKey` (string, optional)
	- 8 to 128 characters.
	- Allowed chars: letters, numbers, `_`, `-`, `:`.
	- If omitted, the server generates a deterministic key from amount, category, description, and date.

### Idempotency behavior

- If the same `idempotencyKey` is reused with a different payload, the API returns `409`.
- If the same `idempotencyKey` is reused with the same payload, the API returns the existing record with `200`.

### Error response format

Errors return JSON like:

```json
{
	"message": "Validation failed",
	"issues": {
		"fieldErrors": {
			"amount": ["Amount must be greater than 0"]
		}
	}
}
```

Other API errors:

- `400` - malformed JSON or missing body
- `409` - idempotency key conflict
- `413` - payload too large
- `500` - unexpected server error

## Data Model

The Prisma model is stored in SQLite and uses these fields:

- `id`: UUID
- `amount`: integer paise
- `category`: string
- `description`: string
- `date`: DateTime
- `createdAt`: DateTime (auto)
- `idempotencyKey`: string (unique)

## Scripts

- `npm run dev`: start Next.js dev server
- `npm run build`: generate Prisma client, then build Next.js
- `npm run start`: run Next.js production server
- `npm run lint`: run ESLint
- `npm run test:backend`: run backend tests
- `npm run prisma:generate`: generate Prisma client
- `npm run prisma:migrate`: run Prisma migrations
