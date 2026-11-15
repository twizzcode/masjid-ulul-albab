"use client"

import { useState } from "react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ChartIncreaseIcon,
  Delete02Icon,
  Edit02Icon,
  MoneyReceive01Icon,
  MoneySend01Icon,
  PlusSignIcon,
  TransactionHistoryIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  shiftFinanceMonth,
  type FinanceLedgerEntry,
  type FinanceReport,
  type FinanceType,
} from "@/lib/finance"

type FormState = {
  id: string | null
  date: string
  title: string
  category: string
  type: FinanceType
  amount: string
}

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

function SummaryCard({
  label,
  value,
  description,
  icon,
}: {
  label: string
  value: number
  description: string
  icon: typeof Wallet01Icon
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <CardDescription>{label}</CardDescription>
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <HugeiconsIcon aria-hidden icon={icon} strokeWidth={2} />
          </span>
        </div>
        <CardTitle className="text-xl tabular-nums sm:text-2xl">
          {rupiah.format(value)}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {description}
      </CardContent>
    </Card>
  )
}

function KeuanganContent({ initialReport }: { initialReport: FinanceReport }) {
  const [report, setReport] = useState(initialReport)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    id: null,
    date: "",
    title: "",
    category: "",
    type: "INCOME",
    amount: "",
  })
  const label = formatMonth(report.month)

  async function loadReport(month: string) {
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

  function openCreateDialog() {
    setForm({
      id: null,
      date: `${report.month}-01`,
      title: "",
      category: "",
      type: "INCOME",
      amount: "",
    })
    setError("")
    setOpen(true)
  }

  function openEditDialog(entry: FinanceLedgerEntry) {
    setForm({
      id: entry.id,
      date: entry.date,
      title: entry.title,
      category: entry.category,
      type: entry.type,
      amount: String(entry.amount),
    })
    setError("")
    setOpen(true)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amount = Number(form.amount)
    if (
      !form.date ||
      form.title.trim().length < 3 ||
      form.category.trim().length < 2 ||
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      setError("Lengkapi tanggal, uraian, kategori, dan nominal dengan benar.")
      return
    }

    setIsSaving(true)
    setError("")
    try {
      const response = await fetch(
        form.id
          ? `/api/admin/finance/${encodeURIComponent(form.id)}`
          : "/api/admin/finance",
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: form.date,
            title: form.title,
            category: form.category,
            type: form.type,
            amount,
          }),
        }
      )
      const result = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      if (!response.ok) {
        throw new Error(result?.message || "Transaksi gagal disimpan.")
      }
      setOpen(false)
      await loadReport(report.month)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Transaksi gagal disimpan."
      )
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(entry: FinanceLedgerEntry) {
    if (!window.confirm(`Hapus transaksi “${entry.title}”?`)) return

    setDeletingId(entry.id)
    setError("")
    try {
      const response = await fetch(
        `/api/admin/finance/${encodeURIComponent(entry.id)}`,
        { method: "DELETE" }
      )
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string
        } | null
        throw new Error(result?.message || "Transaksi gagal dihapus.")
      }
      await loadReport(report.month)
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Transaksi gagal dihapus."
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div
      className="flex flex-1 flex-col gap-6 p-3 sm:p-5 lg:p-6"
      aria-busy={isLoading}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Keuangan
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Kelola buku kas masjid. Semua perubahan disimpan langsung ke basis
            data dan tampil pada laporan publik.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto">
          <HugeiconsIcon aria-hidden icon={PlusSignIcon} strokeWidth={2} />
          Tambah transaksi
        </Button>
      </div>

      <Card size="sm">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <HugeiconsIcon
                aria-hidden
                icon={TransactionHistoryIcon}
                strokeWidth={2}
              />
            </span>
            <div>
              <p className="font-medium">Periode {label}</p>
              <p className="text-xs text-muted-foreground">
                {isLoading
                  ? "Memuat…"
                  : `${report.transactions.length} transaksi tercatat`}
              </p>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading}
              aria-label="Bulan sebelumnya"
              onClick={() => loadReport(shiftFinanceMonth(report.month, -1))}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
            </Button>
            <div className="flex h-8 min-w-0 flex-1 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium capitalize sm:w-40">
              {label}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={isLoading}
              aria-label="Bulan berikutnya"
              onClick={() => loadReport(shiftFinanceMonth(report.month, 1))}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && !open ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section aria-labelledby="ringkasan-keuangan-heading">
        <h2 id="ringkasan-keuangan-heading" className="sr-only">
          Ringkasan keuangan
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Saldo akhir"
            value={report.endingBalance}
            description={`Saldo awal ${rupiah.format(report.openingBalance)}`}
            icon={Wallet01Icon}
          />
          <SummaryCard
            label="Pemasukan"
            value={report.income}
            description="Total penerimaan periode ini"
            icon={MoneyReceive01Icon}
          />
          <SummaryCard
            label="Pengeluaran"
            value={report.expense}
            description="Total penggunaan dana periode ini"
            icon={MoneySend01Icon}
          />
          <SummaryCard
            label="Arus kas bersih"
            value={report.income - report.expense}
            description="Pemasukan dikurangi pengeluaran"
            icon={ChartIncreaseIcon}
          />
        </div>
      </section>

      <Card className="gap-0 py-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Buku kas</CardTitle>
          <CardDescription>
            Saldo berjalan dihitung otomatis dari seluruh riwayat transaksi.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {report.transactions.length === 0 ? (
            <Empty className="m-4 min-h-56 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon
                    aria-hidden
                    icon={TransactionHistoryIcon}
                    strokeWidth={2}
                  />
                </EmptyMedia>
                <EmptyTitle>Belum ada transaksi pada {label}</EmptyTitle>
                <EmptyDescription>
                  Catat pemasukan atau pengeluaran pertama untuk periode ini.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <caption className="sr-only">Buku kas periode {label}</caption>
                <thead>
                  <tr className="bg-muted/60 text-xs font-semibold tracking-wide uppercase">
                    <th className="w-12 border p-2 text-center">No.</th>
                    <th className="w-28 border p-2 text-center">Tanggal</th>
                    <th className="border p-2 text-center">Uraian</th>
                    <th className="w-32 border p-2 text-center">Masuk</th>
                    <th className="w-32 border p-2 text-center">Keluar</th>
                    <th className="w-36 border p-2 text-center">Saldo</th>
                    <th className="w-20 border p-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-muted/30">
                    <td className="border p-2 text-center">—</td>
                    <td className="border p-2 text-center">—</td>
                    <td className="border p-2 font-medium">Saldo awal</td>
                    <td className="border p-2 text-center">—</td>
                    <td className="border p-2 text-center">—</td>
                    <td className="border p-2 text-right font-semibold tabular-nums">
                      {rupiah.format(report.openingBalance)}
                    </td>
                    <td className="border p-2" />
                  </tr>
                  {report.transactions.map((entry, index) => {
                    const isIncome = entry.type === "INCOME"
                    return (
                      <tr key={entry.id} className="hover:bg-muted/30">
                        <td className="border p-2 text-center tabular-nums">
                          {index + 1}
                        </td>
                        <td className="border p-2 text-center text-xs whitespace-nowrap text-muted-foreground">
                          {formatDate(entry.date)}
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
                            <div>
                              <p className="font-medium">{entry.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {entry.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="border p-2 text-right font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                          {isIncome ? rupiah.format(entry.amount) : "—"}
                        </td>
                        <td className="border p-2 text-right font-medium text-red-600 tabular-nums dark:text-red-400">
                          {isIncome ? "—" : rupiah.format(entry.amount)}
                        </td>
                        <td className="border p-2 text-right font-medium tabular-nums">
                          {rupiah.format(entry.balance)}
                        </td>
                        <td className="border p-2">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Ubah ${entry.title}`}
                              onClick={() => openEditDialog(entry)}
                            >
                              <HugeiconsIcon
                                icon={Edit02Icon}
                                strokeWidth={2}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                              disabled={deletingId === entry.id}
                              aria-label={`Hapus ${entry.title}`}
                              onClick={() => handleDelete(entry)}
                            >
                              <HugeiconsIcon
                                icon={Delete02Icon}
                                strokeWidth={2}
                              />
                            </Button>
                          </div>
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
                    <td className="border p-2" />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {form.id ? "Ubah transaksi" : "Tambah transaksi"}
            </DialogTitle>
            <DialogDescription>
              Data tersimpan langsung ke basis data dan laporan publik.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="finance-date">Tanggal</FieldLabel>
                <Input
                  id="finance-date"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="finance-title">Uraian</FieldLabel>
                <Input
                  id="finance-title"
                  value={form.title}
                  maxLength={150}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="finance-category">Kategori</FieldLabel>
                <Input
                  id="finance-category"
                  value={form.category}
                  maxLength={100}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  required
                />
              </Field>
              <Field>
                <FieldLabel>Jenis</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={form.type === "INCOME" ? "secondary" : "outline"}
                    aria-pressed={form.type === "INCOME"}
                    onClick={() =>
                      setForm((current) => ({ ...current, type: "INCOME" }))
                    }
                  >
                    <HugeiconsIcon icon={MoneyReceive01Icon} strokeWidth={2} />
                    Masuk
                  </Button>
                  <Button
                    type="button"
                    variant={form.type === "EXPENSE" ? "secondary" : "outline"}
                    aria-pressed={form.type === "EXPENSE"}
                    onClick={() =>
                      setForm((current) => ({ ...current, type: "EXPENSE" }))
                    }
                  >
                    <HugeiconsIcon icon={MoneySend01Icon} strokeWidth={2} />
                    Keluar
                  </Button>
                </div>
              </Field>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="finance-amount">Nominal (Rp)</FieldLabel>
                <Input
                  id="finance-amount"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={form.amount}
                  aria-invalid={Boolean(error)}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  required
                />
                {error ? (
                  <p role="alert" className="text-xs text-destructive">
                    {error}
                  </p>
                ) : null}
              </Field>
            </FieldGroup>
            <DialogFooter className="mt-4">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Batal
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Menyimpan…" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function AdminKeuangan({
  initialReport,
}: {
  initialReport: FinanceReport
}) {
  return (
    <AdminShell page="Keuangan">
      <KeuanganContent initialReport={initialReport} />
    </AdminShell>
  )
}
