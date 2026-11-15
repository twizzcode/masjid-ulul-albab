import {
  isFinanceMonth,
  isFinanceType,
  isIsoDate,
  type FinanceType,
} from "@/lib/finance"

export type FinanceInput = {
  date: string
  title: string
  category: string
  type: FinanceType
  amount: number
}

export function parseFinanceInput(body: unknown): FinanceInput | null {
  if (!body || typeof body !== "object") return null
  const value = body as Record<string, unknown>
  const title = typeof value.title === "string" ? value.title.trim() : ""
  const category =
    typeof value.category === "string" ? value.category.trim() : ""
  const amount = typeof value.amount === "number" ? value.amount : NaN

  if (
    !isIsoDate(value.date) ||
    !isFinanceMonth(value.date.slice(0, 7)) ||
    !isFinanceType(value.type) ||
    title.length < 3 ||
    title.length > 150 ||
    category.length < 2 ||
    category.length > 100 ||
    !Number.isSafeInteger(amount) ||
    amount < 1 ||
    amount > 9_000_000_000_000
  ) {
    return null
  }

  return { date: value.date, title, category, type: value.type, amount }
}
