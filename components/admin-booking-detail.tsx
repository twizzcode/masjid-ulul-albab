"use client"

import {
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  Calendar04Icon,
  CancelCircleIcon,
  Clock01Icon,
  Delete02Icon,
  Location01Icon,
  Tick02Icon,
  UserGroupIcon,
  UserIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { useState, useTransition, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/reui/badge"
import { FileType } from "@/components/reui/file-type"
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
import type { Booking, BookingStatus } from "@/lib/admin-booking-data"

const STATUS_VARIANTS = {
  Menunggu: "warning-light",
  Disetujui: "success-light",
  Ditolak: "destructive-light",
} as const satisfies Record<BookingStatus, string>

function DetailItem({
  icon,
  label,
  children,
}: {
  icon: IconSvgElement
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-1 font-medium wrap-break-word">{children}</dd>
      </div>
    </div>
  )
}

export function AdminBookingDetail({
  booking,
  pendingCount,
}: {
  booking: Booking
  pendingCount: number
}) {
  const router = useRouter()
  const whatsappUrl = booking.whatsapp
    ? `https://wa.me/${booking.whatsapp.replace(/\D/g, "")}`
    : null
  const [status, setStatus] = useState(booking.status)
  const [action, setAction] = useState<"approve" | "reject" | "delete" | null>(
    null
  )
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const confirmation = action
    ? {
        approve: {
          title: "Setujui peminjaman?",
          description: `Peminjaman ${booking.id} akan disetujui dan memblokir jadwal terkait.`,
          button: "Setujui",
        },
        reject: {
          title: "Tolak peminjaman?",
          description: `Peminjaman ${booking.id} akan ditolak dan tidak memblokir jadwal.`,
          button: "Tolak",
        },
        delete: {
          title: "Hapus peminjaman?",
          description: `Data ${booking.id} akan dihapus. Tindakan ini tidak dapat dibatalkan.`,
          button: "Hapus",
        },
      }[action]
    : null

  const confirmAction = async () => {
    if (!action) return
    setError("")

    const response = await fetch(
      `/api/admin/bookings/${encodeURIComponent(booking.id)}`,
      action === "delete"
        ? { method: "DELETE" }
        : {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: action === "approve" ? "APPROVED" : "REJECTED",
            }),
          }
    )

    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      setError(result?.message ?? "Tindakan gagal diproses.")
      return
    }

    if (action === "delete") {
      router.replace("/admin/peminjaman")
      router.refresh()
      return
    }

    setStatus(action === "approve" ? "Disetujui" : "Ditolak")
    setAction(null)
    startTransition(() => router.refresh())
  }

  return (
    <AdminShell
      page={booking.id}
      parent={{ label: "Peminjaman", href: "/admin/peminjaman" }}
      waitingBookings={
        pendingCount +
        (booking.status === "Menunggu" ? -1 : 0) +
        (status === "Menunggu" ? 1 : 0)
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-6 p-3 sm:p-5 lg:p-6">
        <div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/peminjaman")}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
            Kembali
          </Button>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {booking.activity}
                </h1>
                <Badge variant={STATUS_VARIANTS[status]} radius="full">
                  {status}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                ID peminjaman <span className="font-medium">{booking.id}</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex lg:justify-end">
              <Button
                variant="outline"
                className="border-success/20 bg-success/10 text-success-foreground hover:bg-success/20 dark:border-success/30 dark:bg-success/15 dark:text-success dark:hover:bg-success/25"
                disabled={status === "Disetujui"}
                onClick={() => setAction("approve")}
              >
                <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
                Setujui
              </Button>
              <Button
                variant="outline"
                className="border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 dark:border-destructive/30 dark:bg-destructive/15 dark:hover:bg-destructive/25"
                disabled={status === "Ditolak"}
                onClick={() => setAction("reject")}
              >
                <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} />
                Tolak
              </Button>
            </div>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(20rem,2fr)]">
          <Card className="min-w-0 lg:col-start-1 lg:row-start-1">
            <CardHeader>
              <CardTitle>
                <h2>Informasi kegiatan</h2>
              </CardTitle>
              <CardDescription>
                Detail pelaksanaan kegiatan dan pengajuan peminjaman.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2">
                <DetailItem icon={Location01Icon} label="Tempat">
                  {booking.venue}
                </DetailItem>
                <DetailItem icon={Calendar04Icon} label="Jadwal">
                  {booking.schedule}
                </DetailItem>
                <DetailItem icon={Clock01Icon} label="Diajukan">
                  {booking.submittedAt}
                </DetailItem>
              </dl>
            </CardContent>
          </Card>

          <Card className="min-w-0 lg:col-start-2 lg:row-start-1">
            <CardHeader>
              <CardTitle>
                <h2>Informasi peminjam</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5">
                {booking.requester && (
                  <DetailItem
                    icon={UserGroupIcon}
                    label="Instansi / organisasi"
                  >
                    {booking.requester}
                  </DetailItem>
                )}
                <DetailItem icon={UserIcon} label="Narahubung">
                  {booking.contactName}
                </DetailItem>
                {whatsappUrl && booking.whatsapp && (
                  <DetailItem icon={WhatsappIcon} label="WhatsApp">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 transition-colors hover:underline"
                      aria-label={`Hubungi ${booking.contactName} melalui WhatsApp`}
                    >
                      {booking.whatsapp}
                    </a>
                  </DetailItem>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card className="min-w-0 lg:col-start-2 lg:row-start-2">
            <CardHeader>
              <CardTitle>
                <h2>Surat permohonan</h2>
              </CardTitle>
              <CardDescription>
                {booking.letterUrl
                  ? "Dokumen PDF yang diunggah bersama pengajuan."
                  : "Peminjaman ini dibuat langsung oleh admin tanpa surat."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {booking.letterUrl ? (
                <>
                  <div className="flex min-w-0 items-center gap-3 rounded-lg border p-3">
                    <FileType type="pdf" size="lg" />
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-medium"
                        title={booking.letterName ?? undefined}
                      >
                        {booking.letterName}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PDF
                        {booking.letterSize ? ` · ${booking.letterSize}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Diunggah {booking.letterUploadedAt}
                      </p>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    nativeButton={false}
                    render={
                      <a
                        href={booking.letterUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    Buka surat
                    <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
                  </Button>
                </>
              ) : (
                <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                  Tanpa surat
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="min-w-0 ring-destructive/30 lg:col-start-1 lg:row-start-2">
            <CardHeader>
              <CardTitle className="text-destructive">
                <h2>Zona berbahaya</h2>
              </CardTitle>
              <CardDescription>
                Tindakan ini permanen dan tidak dapat dibatalkan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Hapus peminjaman</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Hapus data {booking.id} dan referensi surat terkait.
                </p>
              </div>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => setAction("delete")}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                Hapus peminjaman
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmation?.title}</DialogTitle>
            <DialogDescription>{confirmation?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Batal
            </DialogClose>
            <Button
              variant={action === "approve" ? "default" : "destructive"}
              onClick={confirmAction}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : confirmation?.button}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
