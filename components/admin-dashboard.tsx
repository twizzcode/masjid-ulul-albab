import {
  Calendar04Icon,
  Clock01Icon,
  TaskDone01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type BookingStatus = "Menunggu" | "Disetujui"

type BookingRequest = {
  id: string
  activity: string
  requester: string
  venue: string
  schedule: string
  status: BookingStatus
}

const SUMMARY = [
  {
    label: "Pengajuan menunggu",
    value: "8",
    description: "Perlu ditinjau pengurus",
    icon: Clock01Icon,
  },
  {
    label: "Peminjaman bulan ini",
    value: "24",
    description: "18 disetujui, 6 menunggu",
    icon: TaskDone01Icon,
  },
  {
    label: "Kegiatan hari ini",
    value: "3",
    description: "Di tiga area masjid",
    icon: Calendar04Icon,
  },
  {
    label: "Pengguna terdaftar",
    value: "126",
    description: "7 pengguna baru bulan ini",
    icon: UserMultiple02Icon,
  },
]

const BOOKING_REQUESTS: BookingRequest[] = [
  {
    id: "PMJ-0261",
    activity: "Kajian Akbar Mahasiswa",
    requester: "UKKI UNNES",
    venue: "Aula Masjid Lantai 1",
    schedule: "16 November 2026, 08.00–12.00",
    status: "Menunggu",
  },
  {
    id: "PMJ-0260",
    activity: "Pelatihan Imam dan Khatib",
    requester: "Takmir Masjid",
    venue: "Ruang Solat Lantai 2",
    schedule: "17 November 2026, 13.00–16.00",
    status: "Disetujui",
  },
  {
    id: "PMJ-0259",
    activity: "Bazar Amal",
    requester: "BEM KM UNNES",
    venue: "Pelataran Masjid",
    schedule: "20 November 2026, 07.00–17.00",
    status: "Menunggu",
  },
  {
    id: "PMJ-0258",
    activity: "Donor Darah",
    requester: "KSR PMI UNNES",
    venue: "Lapangan Parkir",
    schedule: "22 November 2026, 08.00–14.00",
    status: "Disetujui",
  },
]

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={status === "Menunggu" ? "secondary" : "outline"}>
      {status}
    </Badge>
  )
}

function DashboardContent() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-3 sm:p-5 lg:p-6">
      <div>
        <p className="text-sm text-muted-foreground">Sabtu, 14 November 2026</p>
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
          {SUMMARY.map((item) => (
            <Card key={item.label} size="sm">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardDescription>{item.label}</CardDescription>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                  </span>
                </div>
                <CardTitle className="text-2xl">{item.value}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Pengajuan terbaru</CardTitle>
          <CardDescription>
            Pengajuan peminjaman yang baru masuk dan sedang diproses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div role="list" className="divide-y">
            {BOOKING_REQUESTS.map((booking) => (
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
                    {booking.requester}
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
        </CardContent>
      </Card>
    </div>
  )
}

export function AdminDashboard() {
  return (
    <AdminShell page="Dashboard">
      <DashboardContent />
    </AdminShell>
  )
}
