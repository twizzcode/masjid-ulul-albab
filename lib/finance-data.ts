import { and, asc, gte, lt, sql } from "drizzle-orm"

import { db } from "@/lib/db"
import { financeTransaction } from "@/lib/db/schema"
import {
  buildFinanceLedger,
  isFinanceMonth,
  type FinanceReport,
} from "@/lib/finance"

export async function getFinanceReport(month: string): Promise<FinanceReport> {
  if (!isFinanceMonth(month)) throw new Error("Bulan tidak valid")
  const start = `${month}-01`
  const [year, monthNumber] = month.split("-").map(Number)
  const nextDate = new Date(Date.UTC(year, monthNumber, 1))
  const end = `${nextDate.getUTCFullYear()}-${String(nextDate.getUTCMonth() + 1).padStart(2, "0")}-01`

  const [openingRows, records] = await Promise.all([
    db
      .select({
        balance: sql<number>`coalesce(sum(case when ${financeTransaction.type} = 'INCOME' then ${financeTransaction.amount} else -${financeTransaction.amount} end), 0)::float8`,
      })
      .from(financeTransaction)
      .where(lt(financeTransaction.occurredOn, start)),
    db
      .select()
      .from(financeTransaction)
      .where(
        and(
          gte(financeTransaction.occurredOn, start),
          lt(financeTransaction.occurredOn, end)
        )
      )
      .orderBy(
        asc(financeTransaction.occurredOn),
        asc(financeTransaction.createdAt)
      ),
  ])

  const openingBalance = Number(openingRows[0]?.balance ?? 0)
  const transactions = records.map((record) => ({
    id: record.id,
    date: record.occurredOn,
    title: record.title,
    category: record.category,
    type: record.type as "INCOME" | "EXPENSE",
    amount: record.amount,
  }))
  const income = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + transaction.amount, 0)
  const expense = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + transaction.amount, 0)
  const updatedAt = records.reduce<Date | null>(
    (latest, record) =>
      !latest || record.updatedAt > latest ? record.updatedAt : latest,
    null
  )

  return {
    month,
    openingBalance,
    income,
    expense,
    endingBalance: openingBalance + income - expense,
    transactions: buildFinanceLedger(openingBalance, transactions),
    updatedAt: updatedAt?.toISOString() ?? null,
  }
}
