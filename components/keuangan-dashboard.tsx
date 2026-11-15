"use client"

import { useState } from "react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Calendar03Icon,
  MoneyReceive01Icon,
  MoneySend01Icon,
  TransactionHistoryIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  shiftFinanceMonth,
  type FinanceReport,
  type FinanceType,
} from "@/lib/finance"

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

const monthName = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

function formatMonth(month: string) {
  return monthName.format(new Date(`${month}-01T00:00:00Z`))
}

function formatDate(date: string) {
  return shortDate.format(new Date(`${date}T00:00:00Z`))
}

const TONES = {
  balance: "text-foreground",
  income: "text-emerald-600 dark:text-emerald-400",
  expense: "text-red-600 dark:text-red-400",
} as const

function SummaryCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string
  value: number
  description: string
  icon: typeof Wallet01Icon
  tone: keyof typeof TONES
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <CardAction className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
          <HugeiconsIcon aria-hidden icon={icon} strokeWidth={2} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p
          className={`text-[clamp(1.45rem,3vw,2rem)] font-semibold tracking-tight tabular-nums ${TONES[tone]}`}
        >
          {rupiah.format(value)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function KeuanganDashboard({
  initialReport,
}: {
  initialReport: FinanceReport
}) {
  const [report, setReport] = useState(initialReport)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const label = formatMonth(report.month)

  async function selectMonth(month: string) {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(
        `/api/finance?month=${encodeURIComponent(month)}`,
        { cache: "no-store" }
      )
      const result = (await response.json()) as {
        report?: FinanceReport
        message?: string
      }
      if (!response.ok || !result.report) {
        throw new Error(result.message || "Laporan gagal dimuat.")
      }
      setReport(result.report)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Laporan gagal dimuat."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6" aria-busy={isLoading}>
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground">
              <HugeiconsIcon
                aria-hidden
                icon={Calendar03Icon}
                strokeWidth={2}
                className="size-5"
              />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Laporan {label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isLoading
                  ? "Memuat laporan…"
                  : "Pilih periode dengan tombol sebelumnya atau berikutnya."}
              </p>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              disabled={isLoading}
              aria-label="Bulan sebelumnya"
              title="Bulan sebelumnya"
              onClick={() => selectMonth(shiftFinanceMonth(report.month, -1))}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
            </Button>
            <div
              aria-live="polite"
              className="flex h-9 min-w-0 flex-1 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium capitalize sm:w-44"
            >
              {label}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              disabled={isLoading}
              aria-label="Bulan berikutnya"
              title="Bulan berikutnya"
              onClick={() => selectMonth(shiftFinanceMonth(report.month, 1))}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2">
          <SummaryCard
            label="Saldo akhir"
            value={report.endingBalance}
            description={`Saldo awal ${rupiah.format(report.openingBalance)}`}
            icon={Wallet01Icon}
            tone="balance"
          />
        </div>
        <SummaryCard
          label="Total pemasukan"
          value={report.income}
          description="Penerimaan selama periode ini"
          icon={MoneyReceive01Icon}
          tone="income"
        />
        <SummaryCard
          label="Total pengeluaran"
          value={report.expense}
          description="Penggunaan dana selama periode ini"
          icon={MoneySend01Icon}
          tone="expense"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted text-foreground">
              <HugeiconsIcon
                aria-hidden
                icon={TransactionHistoryIcon}
                strokeWidth={2}
                className="size-4"
              />
            </span>
            Rincian transaksi
          </CardTitle>
          <CardDescription>
            Buku kas masuk, keluar, dan saldo berjalan periode ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {report.transactions.length === 0 ? (
            <Empty className="mx-4 min-h-64 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon
                    aria-hidden
                    icon={TransactionHistoryIcon}
                    strokeWidth={2}
                  />
                </EmptyMedia>
                <EmptyTitle>Belum ada transaksi untuk {label}</EmptyTitle>
                <EmptyDescription>
                  Laporan tampil setelah pengurus mencatat transaksi pada
                  periode ini.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto px-(--card-spacing)">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <caption className="sr-only">
                  Buku kas Masjid Jami&apos; Ulul Albab periode {label}
                </caption>
                <thead>
                  <tr className="text-xs font-semibold tracking-wide uppercase">
                    <th className="w-12 border p-2 text-center">No.</th>
                    <th className="w-28 border p-2 text-center">Tanggal</th>
                    <th className="border p-2 text-center">Uraian</th>
                    <th className="w-36 border bg-emerald-500/10 p-2 text-center text-emerald-700 dark:text-emerald-400">
                      Masuk
                    </th>
                    <th className="w-36 border bg-red-500/10 p-2 text-center text-red-700 dark:text-red-400">
                      Keluar
                    </th>
                    <th className="w-40 border bg-blue-500/10 p-2 text-center text-blue-700 dark:text-blue-400">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-muted/40">
                    <td className="border p-2 text-center text-muted-foreground">
                      —
                    </td>
                    <td className="border p-2 text-center text-muted-foreground">
                      —
                    </td>
                    <td className="border p-2 font-medium">Saldo awal</td>
                    <td className="border p-2 text-center text-muted-foreground">
                      —
                    </td>
                    <td className="border p-2 text-center text-muted-foreground">
                      —
                    </td>
                    <td className="border p-2 text-right font-semibold tabular-nums">
                      {rupiah.format(report.openingBalance)}
                    </td>
                  </tr>
                  {report.transactions.map((transaction, index) => {
                    const isIncome = transaction.type === "INCOME"
                    return (
                      <tr key={transaction.id} className="hover:bg-muted/30">
                        <td className="border p-2 text-center tabular-nums">
                          {index + 1}
                        </td>
                        <td className="border p-2 text-center text-xs whitespace-nowrap text-muted-foreground">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="border p-2">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <HugeiconsIcon
                                aria-hidden
                                icon={
                                  isIncome
                                    ? MoneyReceive01Icon
                                    : MoneySend01Icon
                                }
                                strokeWidth={2}
                                className="size-3.5"
                              />
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium">{transaction.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {transaction.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <AmountCell
                          type="INCOME"
                          transactionType={transaction.type}
                          amount={transaction.amount}
                        />
                        <AmountCell
                          type="EXPENSE"
                          transactionType={transaction.type}
                          amount={transaction.amount}
                        />
                        <td className="border p-2 text-right font-medium tabular-nums">
                          {rupiah.format(transaction.balance)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted font-semibold">
                    <td colSpan={3} className="border p-2 text-center">
                      Jumlah
                    </td>
                    <td className="border p-2 text-right text-emerald-700 tabular-nums dark:text-emerald-400">
                      {rupiah.format(report.income)}
                    </td>
                    <td className="border p-2 text-right text-red-700 tabular-nums dark:text-red-400">
                      {rupiah.format(report.expense)}
                    </td>
                    <td className="border p-2 text-right text-blue-700 tabular-nums dark:text-blue-400">
                      {rupiah.format(report.endingBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function AmountCell({
  type,
  transactionType,
  amount,
}: {
  type: FinanceType
  transactionType: FinanceType
  amount: number
}) {
  return (
    <td
      className={`border p-2 text-right font-medium tabular-nums ${
        type === "INCOME"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {type === transactionType ? rupiah.format(amount) : "—"}
    </td>
  )
}
