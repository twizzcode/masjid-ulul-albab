import {
  ArrowUpRight01Icon,
  Calendar04Icon,
  Clock01Icon,
  Comment01Icon,
  MoneyReceive01Icon,
  TaskDone01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardBooking, DashboardData } from "@/lib/admin-dashboard"
import type { BookingStatus } from "@/lib/bookings"

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
}

const STATUS_VARIANTS: Record<
  BookingStatus,
  "secondary" | "outline" | "destructive"
> = {
  PENDING: "secondary",
  APPROVED: "outline",
  REJECTED: "destructive",
}

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>{STATUS_LABELS[status]}</Badge>
  )
}

function BookingChart({ months }: { months: DashboardData["months"] }) {
  const max = Math.max(
    ...months.map((month) => month.approved + month.pending),
    1
  )

  return (
    <div>
      <div className="flex h-36 items-end gap-2 sm:gap-3">
        {months.map((month) => {
          const total = month.approved + month.pending
          return (
            <div
              key={month.key}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div
                className="flex h-28 w-full max-w-10 flex-col justify-end overflow-hidden rounded-md bg-muted/50"
                title={`${month.label}: ${month.approved} disetujui, ${month.pending} menunggu`}
              >
                {month.pending > 0 && (
                  <div
                    className="bg-amber-400"
                    style={{ height: `${(month.pending / max) * 100}%` }}
                  />
                )}
                {month.approved > 0 && (
                  <div
                    className="bg-blue-600"
                    style={{ height: `${(month.approved / max) * 100}%` }}
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {month.label}
              </span>
              <span className="sr-only">{`${total} peminjaman`}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-blue-600" />
          Disetujui
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-2 rounded-full bg-amber-400" />
          Menunggu
        </span>
      </div>
    </div>
  )
}

function RecentBookings({ bookings }: { bookings: DashboardBooking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        Belum ada peminjaman yang masuk.
      </p>
    )
  }

  return (
    <div role="list" className="divide-y">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          role="listitem"
          className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] md:items-center"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{booking.activity}</p>
              <span className="text-xs text-muted-foreground">
                {booking.id}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {booking.requester ?? "Takmir Masjid"}
            </p>
          </div>
          <div className="min-w-0 text-xs text-muted-foreground">
            <p className="truncate text-foreground">{booking.venue}</p>
            <p className="mt-1">{booking.schedule}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      ))}
    </div>
  )
}

export function AdminDashboard({ data }: { data: DashboardData }) {
  const summary = [
    {
      label: "Pengajuan menunggu",
      value: data.pendingBookings,
      description: "Perlu ditinjau pengurus",
      icon: Clock01Icon,
    },
    {
      label: "Peminjaman bulan ini",
      value: data.monthBookings,
      description: `${data.monthApproved} disetujui`,
      icon: TaskDone01Icon,
    },
    {
      label: "Kegiatan hari ini",
      value: data.todayBookings,
      description: "Jadwal aktif di masjid",
      icon: Calendar04Icon,
    },
    {
      label: "Pengguna terdaftar",
      value: data.totalUsers,
      description: `${data.newUsers} baru bulan ini`,
      icon: UserMultiple02Icon,
    },
  ]

  const shortcuts = [
    {
      label: "Peminjaman",
      href: "/admin/peminjaman",
      icon: TaskDone01Icon,
      description: `${data.pendingBookings} menunggu`,
    },
    {
      label: "Aspirasi",
      href: "/admin/aspirasi",
      icon: Comment01Icon,
      description: `${data.totalAspirations} masuk`,
    },
    {
      label: "Keuangan",
      href: "/admin/keuangan",
      icon: MoneyReceive01Icon,
      description: "Kas dan laporan",
    },
    {
      label: "Pengguna",
      href: "/admin/pengguna",
      icon: UserMultiple02Icon,
      description: `${data.totalUsers} terdaftar`,
    },
  ]

  return (
    <AdminShell page="Dashboard">
      <div className="flex flex-1 flex-col gap-6 p-3 sm:p-5 lg:p-6">
        <div>
          <p className="text-sm text-muted-foreground">{data.dateLabel}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Assalamu&apos;alaikum, Administrator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Ringkasan kegiatan dan pengajuan peminjaman Masjid Jami&apos; Ulul
            Albab.
          </p>
        </div>

        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">
            Ringkasan administrasi
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <Card key={item.label} size="sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardDescription>{item.label}</CardDescription>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    </span>
                  </div>
                  <CardTitle className="text-2xl tabular-nums">
                    {item.value.toLocaleString("id-ID")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">
                  {item.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-3 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Peminjaman 6 bulan terakhir</CardTitle>
              <CardDescription>
                Jumlah pengajuan per bulan berdasarkan jadwal pemakaian.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingChart months={data.months} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Akses cepat</CardTitle>
              <CardDescription>Menu pengelolaan masjid.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                {shortcuts.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      strokeWidth={2}
                      className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                    />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle>Pengajuan terbaru</CardTitle>
                <CardDescription>
                  Pengajuan peminjaman yang baru masuk dan sedang diproses.
                </CardDescription>
              </div>
              <Link
                href="/admin/peminjaman"
                className="text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline"
              >
                Lihat semua
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <RecentBookings bookings={data.recentBookings} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
