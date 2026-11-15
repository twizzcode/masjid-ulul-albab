export const FINANCE_TYPES = ["INCOME", "EXPENSE"] as const

export type FinanceType = (typeof FINANCE_TYPES)[number]
export type FinanceTransaction = {
  id: string
  date: string
  title: string
  category: string
  type: FinanceType
  amount: number
}
export type FinanceLedgerEntry = FinanceTransaction & { balance: number }
export type FinanceReport = {
  month: string
  openingBalance: number
  income: number
  expense: number
  endingBalance: number
  transactions: FinanceLedgerEntry[]
  updatedAt: string | null
}

export function isFinanceType(value: unknown): value is FinanceType {
  return value === "INCOME" || value === "EXPENSE"
}

export function isFinanceMonth(value: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return false
  const year = Number(value.slice(0, 4))
  return year >= 2000 && year <= 2100
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const date = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  )
}

export function currentFinanceMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    timeZone: "Asia/Jakarta",
  }).formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  if (!year || !month) throw new Error("Bulan saat ini tidak dapat ditentukan")
  return `${year}-${month}`
}

export function shiftFinanceMonth(value: string, amount: number) {
  if (!isFinanceMonth(value)) throw new Error("Bulan tidak valid")
  const date = new Date(
    Date.UTC(
      Number(value.slice(0, 4)),
      Number(value.slice(5, 7)) - 1 + amount,
      1
    )
  )
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

export function buildFinanceLedger(
  openingBalance: number,
  transactions: FinanceTransaction[]
) {
  let balance = openingBalance
  return transactions.map((transaction) => {
    balance +=
      transaction.type === "INCOME" ? transaction.amount : -transaction.amount
    return { ...transaction, balance }
  })
}
