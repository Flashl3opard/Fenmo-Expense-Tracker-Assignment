export function amountToPaise(amount: number) {
    return Math.round(amount * 100)
}

export function paiseToAmount(amount: number) {
    return amount / 100
}

export function formatINR(amountPaise: number) {
    return paiseToAmount(amountPaise).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

export function formatDate(value: string | Date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(new Date(value))
}
