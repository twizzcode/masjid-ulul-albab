"use client"

import { useState, type FormEvent } from "react"
import {
  ArrowUpRight01Icon,
  Delete02Icon,
  Edit02Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { BookingHistoryItem } from "@/lib/booking-history"
import {
  canUserModifyBooking,
  ROOM_NAMES,
  type BookingRoom,
} from "@/lib/bookings"

type EditForm = Pick<
  BookingHistoryItem,
  | "contactName"
  | "whatsapp"
  | "organizer"
  | "eventName"
  | "roomValue"
  | "startDate"
  | "startTime"
  | "endDate"
  | "endTime"
>

function initialForm(booking: BookingHistoryItem): EditForm {
  return {
    contactName: booking.contactName,
    whatsapp: booking.whatsapp ?? "",
    organizer: booking.organizer ?? "",
    eventName: booking.eventName,
    roomValue: booking.roomValue,
    startDate: booking.startDate,
    startTime: booking.startTime,
    endDate: booking.endDate,
    endTime: booking.endTime,
  }
}

export function BookingHistoryActions({
  booking,
}: {
  booking: BookingHistoryItem
}) {
  const router = useRouter()
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState(() => initialForm(booking))
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const editable = canUserModifyBooking(booking.status)

  const update = <K extends keyof EditForm>(key: K, value: EditForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError("")
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")

    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(booking.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, room: form.roomValue }),
        }
      )
      const result = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      if (!response.ok) {
        setError(result?.message ?? "Perubahan gagal disimpan.")
        return
      }
      setEditOpen(false)
      router.refresh()
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.")
    } finally {
      setPending(false)
    }
  }

  async function remove() {
    setPending(true)
    setError("")

    try {
      const response = await fetch(
        `/api/bookings/${encodeURIComponent(booking.id)}`,
        { method: "DELETE" }
      )
      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as {
          message?: string
        } | null
        setError(result?.message ?? "Pengajuan gagal dihapus.")
        return
      }
      setDeleteOpen(false)
      router.refresh()
    } catch {
      setError("Koneksi gagal. Silakan coba lagi.")
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t pt-4">
        {booking.letterUrl && (
          <Button
            variant="outline"
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
        )}
        {editable && (
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              Hapus
            </Button>
          </>
        )}
        {editable && booking.confirmationUrl && (
          <Button
            nativeButton={false}
            render={
              <a
                href={booking.confirmationUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <HugeiconsIcon icon={WhatsappIcon} strokeWidth={2} />
            Konfirmasi ke admin
          </Button>
        )}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open)
          if (open) {
            setForm(initialForm(booking))
            setError("")
          }
        }}
      >
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit pengajuan {booking.id}</DialogTitle>
            <DialogDescription>
              Perubahan hanya dapat dilakukan selama status masih menunggu.
              Surat yang sudah diunggah tetap digunakan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save}>
            <FieldGroup className="gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`contact-${booking.id}`}>
                    Nama narahubung
                  </FieldLabel>
                  <Input
                    id={`contact-${booking.id}`}
                    value={form.contactName}
                    minLength={3}
                    maxLength={100}
                    onChange={(event) =>
                      update("contactName", event.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`whatsapp-${booking.id}`}>
                    Nomor WhatsApp
                  </FieldLabel>
                  <Input
                    id={`whatsapp-${booking.id}`}
                    type="tel"
                    value={form.whatsapp ?? ""}
                    onChange={(event) => update("whatsapp", event.target.value)}
                    required
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor={`organizer-${booking.id}`}>
                  Penyelenggara
                </FieldLabel>
                <Input
                  id={`organizer-${booking.id}`}
                  value={form.organizer ?? ""}
                  minLength={3}
                  maxLength={150}
                  onChange={(event) => update("organizer", event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`event-${booking.id}`}>
                  Nama kegiatan
                </FieldLabel>
                <Input
                  id={`event-${booking.id}`}
                  value={form.eventName}
                  minLength={3}
                  maxLength={150}
                  onChange={(event) => update("eventName", event.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`room-${booking.id}`}>Tempat</FieldLabel>
                <select
                  id={`room-${booking.id}`}
                  value={form.roomValue}
                  onChange={(event) =>
                    update("roomValue", event.target.value as BookingRoom)
                  }
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  required
                >
                  {Object.entries(ROOM_NAMES).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`start-date-${booking.id}`}>
                    Tanggal mulai
                  </FieldLabel>
                  <Input
                    id={`start-date-${booking.id}`}
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      update("startDate", event.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`start-time-${booking.id}`}>
                    Waktu mulai
                  </FieldLabel>
                  <Input
                    id={`start-time-${booking.id}`}
                    type="time"
                    value={form.startTime}
                    onChange={(event) =>
                      update("startTime", event.target.value)
                    }
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`end-date-${booking.id}`}>
                    Tanggal selesai
                  </FieldLabel>
                  <Input
                    id={`end-date-${booking.id}`}
                    type="date"
                    value={form.endDate}
                    onChange={(event) => update("endDate", event.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor={`end-time-${booking.id}`}>
                    Waktu selesai
                  </FieldLabel>
                  <Input
                    id={`end-time-${booking.id}`}
                    type="time"
                    value={form.endTime}
                    onChange={(event) => update("endTime", event.target.value)}
                    required
                  />
                </Field>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </FieldGroup>
            <DialogFooter className="mt-4">
              <DialogClose render={<Button type="button" variant="outline" />}>
                Batal
              </DialogClose>
              <Button type="submit" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (open) setError("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus pengajuan {booking.id}?</DialogTitle>
            <DialogDescription>
              Pengajuan, jadwal, dan surat terkait akan dihapus permanen.
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Batal
            </DialogClose>
            <Button variant="destructive" onClick={remove} disabled={pending}>
              {pending ? "Menghapus..." : "Hapus permanen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
