"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconCircleCheck,
  IconClipboardCheck,
  IconFileDescription,
  IconSend,
} from "@tabler/icons-react"
import { format, startOfDay } from "date-fns"
import { id as localeId } from "date-fns/locale"

import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper"
import {
  TimePicker,
  TimePickerColumns,
  TimePickerContent,
  TimePickerFooter,
  TimePickerTrigger,
} from "@/components/reui/time-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ROOM_NAMES, type BookingRoom } from "@/lib/bookings"

const MAX_FILE_SIZE = 2 * 1024 * 1024
const STEPS = ["Narahubung", "Detail kegiatan", "Jadwal", "Review"] as const

const TIME_PICKER_I18N = {
  labels: {
    placeholder: "Pilih waktu",
    hour: "Jam",
    minute: "Menit",
    now: "Sekarang",
    clear: "Hapus",
    confirm: "Pilih",
    panelLabel: "Pilih waktu",
    openPicker: "Buka pemilih waktu",
  },
}

type FormState = {
  fullName: string
  whatsapp: string
  organizer: string
  eventName: string
  letter: File | null
  room: BookingRoom | ""
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  agreed: boolean
}

const INITIAL_FORM: FormState = {
  fullName: "",
  whatsapp: "",
  organizer: "",
  eventName: "",
  letter: null,
  room: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  agreed: false,
}

type Errors = Partial<Record<keyof FormState | "schedule", string>>

function isValidWhatsapp(value: string) {
  const number = value.replace(/[\s()-]/g, "")
  return /^(?:\+62|62|0)8[1-9]\d{7,11}$/.test(number)
}

function toDate(date: string, time: string) {
  return date && time ? new Date(`${date}T${time}:00`) : null
}

function getScheduleError(form: FormState) {
  const start = toDate(form.startDate, form.startTime)
  const end = toDate(form.endDate, form.endTime)

  if (!start || !end || !form.room) return undefined
  if (end <= start) return "Waktu selesai harus setelah waktu mulai."
}

function buildPublicPayload(form: FormState) {
  const payload = new FormData()
  payload.set("contactName", form.fullName)
  payload.set("whatsapp", form.whatsapp)
  payload.set("organizer", form.organizer)
  payload.set("eventName", form.eventName)
  if (form.letter) payload.set("letter", form.letter)
  payload.set("room", form.room)
  payload.set("startDate", form.startDate)
  payload.set("startTime", form.startTime)
  payload.set("endDate", form.endDate)
  payload.set("endTime", form.endTime)
  return payload
}

export function PeminjamanForm({
  isAdmin = false,
}: { isAdmin?: boolean } = {}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [furthestStep, setFurthestStep] = useState(1)
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Errors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      schedule: undefined,
    }))
    setSubmitted(false)
  }

  const validateStep = (targetStep: number) => {
    const nextErrors: Errors = {}

    if (targetStep === 1) {
      if (form.fullName.trim().length < 3) {
        nextErrors.fullName = "Masukkan nama lengkap minimal 3 karakter."
      }
      if (!isValidWhatsapp(form.whatsapp)) {
        nextErrors.whatsapp = "Gunakan nomor WhatsApp Indonesia yang valid."
      }
    }

    if (targetStep === 2) {
      if (!isAdmin && form.organizer.trim().length < 3) {
        nextErrors.organizer = "Masukkan nama penyelenggara."
      }
      if (form.eventName.trim().length < 3) {
        nextErrors.eventName = "Masukkan nama kegiatan."
      }
      if (!form.letter && !isAdmin) {
        nextErrors.letter = "Pilih surat peminjaman berformat PDF."
      } else if (form.letter) {
        if (
          form.letter.type !== "application/pdf" &&
          !form.letter.name.toLowerCase().endsWith(".pdf")
        ) {
          nextErrors.letter = "Surat peminjaman harus berformat PDF."
        } else if (form.letter.size > MAX_FILE_SIZE) {
          nextErrors.letter = "Ukuran PDF maksimal 2 MB."
        }
      }
    }

    if (targetStep === 3) {
      if (!form.room) nextErrors.room = "Pilih tempat yang ingin dipinjam."
      if (!form.startDate) nextErrors.startDate = "Pilih tanggal mulai."
      if (!form.startTime) nextErrors.startTime = "Pilih waktu mulai."
      if (!form.endDate) nextErrors.endDate = "Pilih tanggal selesai."
      if (!form.endTime) nextErrors.endTime = "Pilih waktu selesai."

      const scheduleError = getScheduleError(form)
      if (scheduleError) nextErrors.schedule = scheduleError
    }

    if (targetStep === 4 && !form.agreed) {
      nextErrors.agreed = "Setujui ketentuan peminjaman sebelum mengajukan."
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const nextStep = () => {
    if (!validateStep(step)) return
    const next = Math.min(step + 1, 4)
    setStep(next)
    setFurthestStep((current) => Math.max(current, next))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validateStep(4)) return
    if (!form.room) return

    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        body: buildPublicPayload(form),
      })
      const result = (await response.json().catch(() => null)) as {
        message?: string
      } | null
      if (!response.ok) {
        setSubmitMessage(result?.message ?? "Pengajuan gagal dikirim.")
        if (response.status === 409) {
          setErrors((current) => ({ ...current, schedule: result?.message }))
          setStep(3)
        }
        return
      }

      setSubmitted(true)
      setSubmitMessage(result?.message ?? "Pengajuan berhasil dikirim.")
      router.replace("/riwayat")
    } catch {
      setSubmitMessage("Koneksi gagal. Periksa jaringan lalu coba lagi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const start = toDate(form.startDate, form.startTime)
  const end = toDate(form.endDate, form.endTime)
  const scheduleError = getScheduleError(form) ?? errors.schedule

  return (
    <Card className="mt-8 gap-0 py-0">
      <CardHeader className="border-b px-6 py-6 md:px-8">
        <h3 className="text-xl font-semibold">Form pengajuan peminjaman</h3>
        <p className="text-sm text-muted-foreground">
          Lengkapi data berikut. Isi data narahubung, kegiatan, dan jadwal
          pemakaian tempat.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} noValidate>
          <Stepper
            value={step}
            onValueChange={(value) => {
              if (value <= furthestStep) setStep(value)
            }}
            indicators={{
              completed: <IconCircleCheck className="size-4" />,
            }}
            className="grid lg:grid-cols-[17rem_minmax(0,1fr)]"
          >
            <StepperNav className="gap-1 border-b px-4 py-4 lg:min-h-[38rem] lg:flex-col! lg:items-stretch lg:gap-2 lg:border-r lg:border-b-0 lg:p-5">
              {STEPS.map((title, index) => {
                const value = index + 1
                return (
                  <StepperItem
                    key={title}
                    step={value}
                    disabled={value > furthestStep}
                    className="min-w-0 lg:w-full lg:flex-none! lg:flex-row! lg:justify-start!"
                  >
                    <StepperTrigger className="flex min-w-0 flex-col gap-2 rounded-lg p-2 lg:w-full lg:flex-row lg:justify-start lg:p-3 lg:data-[state=active]:bg-background lg:data-[state=active]:shadow-sm">
                      <StepperIndicator className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=completed]:bg-emerald-600 data-[state=completed]:text-white">
                        {value}
                      </StepperIndicator>
                      <span className="hidden min-w-0 text-left lg:block">
                        <span className="block text-xs text-muted-foreground">
                          Langkah {value}
                        </span>
                        <StepperTitle className="mt-1 truncate">
                          {title}
                        </StepperTitle>
                      </span>
                    </StepperTrigger>
                    {value < STEPS.length && (
                      <StepperSeparator className="group-data-[state=completed]/step:bg-emerald-600 lg:hidden" />
                    )}
                  </StepperItem>
                )
              })}
            </StepperNav>

            <div className="flex min-h-[38rem] min-w-0 flex-col px-6 pt-7 md:px-10 md:pt-9">
              <StepperPanel className="flex-1">
                <StepperContent value={1}>
                  <StepHeading
                    title="Informasi narahubung"
                    description="Data orang yang bisa dihubungi pengurus terkait pengajuan ini."
                  />
                  <FieldGroup className="mt-6 gap-5">
                    <Field data-invalid={!!errors.fullName}>
                      <RequiredLabel htmlFor="full-name">
                        Nama lengkap
                      </RequiredLabel>
                      <Input
                        id="full-name"
                        value={form.fullName}
                        onChange={(event) =>
                          update("fullName", event.target.value)
                        }
                        placeholder="Nama lengkap narahubung"
                        autoComplete="name"
                        aria-invalid={!!errors.fullName}
                      />
                      <FieldError>{errors.fullName}</FieldError>
                    </Field>
                    <Field data-invalid={!!errors.whatsapp}>
                      <RequiredLabel htmlFor="whatsapp">
                        Nomor WhatsApp
                      </RequiredLabel>
                      <Input
                        id="whatsapp"
                        type="tel"
                        inputMode="tel"
                        value={form.whatsapp}
                        onChange={(event) =>
                          update("whatsapp", event.target.value)
                        }
                        placeholder="Contoh: 081234567890"
                        autoComplete="tel"
                        aria-invalid={!!errors.whatsapp}
                      />
                      <FieldDescription>
                        Format Indonesia: 08, 62, atau +62.
                      </FieldDescription>
                      <FieldError>{errors.whatsapp}</FieldError>
                    </Field>
                  </FieldGroup>
                </StepperContent>

                <StepperContent value={2}>
                  <StepHeading
                    title="Detail kegiatan"
                    description="Jelaskan penyelenggara dan kegiatan yang akan dilaksanakan."
                  />
                  <FieldGroup className="mt-6 gap-5">
                    <Field data-invalid={!!errors.organizer}>
                      {isAdmin ? (
                        <FieldLabel htmlFor="organizer">
                          Nama penyelenggara (opsional)
                        </FieldLabel>
                      ) : (
                        <RequiredLabel htmlFor="organizer">
                          Nama penyelenggara
                        </RequiredLabel>
                      )}
                      <Input
                        id="organizer"
                        value={form.organizer}
                        onChange={(event) =>
                          update("organizer", event.target.value)
                        }
                        placeholder="Contoh: UKKI UNNES, HIMA Matematika"
                        aria-invalid={!!errors.organizer}
                      />
                      <FieldError>{errors.organizer}</FieldError>
                    </Field>
                    <Field data-invalid={!!errors.eventName}>
                      <RequiredLabel htmlFor="event-name">
                        Nama kegiatan
                      </RequiredLabel>
                      <Input
                        id="event-name"
                        value={form.eventName}
                        onChange={(event) =>
                          update("eventName", event.target.value)
                        }
                        placeholder="Contoh: Kajian, workshop, seminar"
                        aria-invalid={!!errors.eventName}
                      />
                      <FieldError>{errors.eventName}</FieldError>
                    </Field>
                    <Field data-invalid={!!errors.letter}>
                      {isAdmin ? (
                        <FieldLabel htmlFor="letter">
                          Surat peminjaman (opsional)
                        </FieldLabel>
                      ) : (
                        <RequiredLabel htmlFor="letter">
                          Surat peminjaman
                        </RequiredLabel>
                      )}
                      <Input
                        id="letter"
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) =>
                          update("letter", event.target.files?.[0] ?? null)
                        }
                        aria-invalid={!!errors.letter}
                      />
                      <FieldDescription>
                        PDF maksimal 2 MB.{" "}
                        {isAdmin
                          ? "Akun admin boleh mengajukan tanpa surat."
                          : "File ditahan di perangkat dan baru diunggah saat tombol Ajukan peminjaman ditekan."}
                      </FieldDescription>
                      <FieldError>{errors.letter}</FieldError>
                    </Field>
                  </FieldGroup>
                </StepperContent>

                <StepperContent value={3} className="pb-8">
                  <StepHeading
                    title="Jadwal peminjaman"
                    description="Pilih tempat dan rentang waktu. Sistem akan memeriksa bentrok jadwal."
                  />
                  <Field className="mt-6" data-invalid={!!errors.room}>
                    <RequiredLabel>Pilih tempat</RequiredLabel>
                    <div className="grid gap-3">
                      {(
                        Object.entries(ROOM_NAMES) as [BookingRoom, string][]
                      ).map(([value, label]) => (
                        <label
                          key={value}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors has-checked:border-primary has-checked:bg-primary/5"
                        >
                          <input
                            type="radio"
                            name="room"
                            value={value}
                            checked={form.room === value}
                            onChange={() => update("room", value)}
                            className="size-4 accent-primary"
                          />
                          <span className="font-medium">{label}</span>
                        </label>
                      ))}
                    </div>
                    <FieldError>{errors.room}</FieldError>
                  </Field>

                  <FieldGroup className="mt-5 gap-5">
                    <DateTimeFields
                      prefix="start"
                      title="Mulai"
                      date={form.startDate}
                      time={form.startTime}
                      dateError={errors.startDate}
                      timeError={errors.startTime}
                      onDateChange={(value) => update("startDate", value)}
                      onTimeChange={(value) => update("startTime", value)}
                    />
                    <DateTimeFields
                      prefix="end"
                      title="Selesai"
                      date={form.endDate}
                      time={form.endTime}
                      dateError={errors.endDate}
                      timeError={errors.endTime}
                      onDateChange={(value) => update("endDate", value)}
                      onTimeChange={(value) => update("endTime", value)}
                    />
                  </FieldGroup>

                  {scheduleError && (
                    <div
                      role="alert"
                      className="mt-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                    >
                      <IconAlertCircle className="mt-0.5 size-4 shrink-0" />
                      {scheduleError}
                    </div>
                  )}
                </StepperContent>

                <StepperContent value={4}>
                  <StepHeading
                    title="Review & ajukan"
                    description="Periksa kembali data sebelum mengirim pengajuan."
                  />
                  <dl className="mt-6 grid gap-4 rounded-xl border bg-muted/30 p-5">
                    <ReviewItem label="Narahubung" value={form.fullName} />
                    <ReviewItem label="WhatsApp" value={form.whatsapp} />
                    <ReviewItem label="Penyelenggara" value={form.organizer} />
                    <ReviewItem label="Kegiatan" value={form.eventName} />
                    <ReviewItem
                      label="Surat peminjaman"
                      value={form.letter?.name ?? "Tanpa surat"}
                      icon={<IconFileDescription className="size-4" />}
                    />
                    <ReviewItem
                      label="Tempat"
                      value={form.room ? ROOM_NAMES[form.room] : "-"}
                    />
                    <ReviewItem
                      label="Mulai"
                      value={start ? formatDate(start) : "-"}
                    />
                    <ReviewItem
                      label="Selesai"
                      value={end ? formatDate(end) : "-"}
                    />
                  </dl>

                  {isAdmin && (
                    <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                      Sebagai admin, pengajuan langsung disetujui dan boleh
                      tanpa surat.
                    </p>
                  )}

                  <Field className="mt-5" data-invalid={!!errors.agreed}>
                    <FieldLabel className="items-start">
                      <Checkbox
                        checked={form.agreed}
                        onCheckedChange={(checked) => update("agreed", checked)}
                        aria-invalid={!!errors.agreed}
                      />
                      <span>
                        Saya memastikan data benar dan bersedia mematuhi
                        ketentuan penggunaan fasilitas masjid. <RequiredMark />
                      </span>
                    </FieldLabel>
                    <FieldError>{errors.agreed}</FieldError>
                  </Field>

                  {submitted && (
                    <div
                      role="status"
                      className="mt-5 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                    >
                      <IconCircleCheck className="mt-0.5 size-4 shrink-0" />
                      {submitMessage}
                    </div>
                  )}
                  {!submitted && submitMessage && (
                    <div role="alert" className="mt-5 text-sm text-destructive">
                      {submitMessage}
                    </div>
                  )}
                </StepperContent>
              </StepperPanel>

              <div className="sticky bottom-0 z-20 -mx-6 mt-auto flex items-center justify-between gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur-sm md:-mx-10 md:px-10">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="min-w-28"
                  onClick={() => setStep((current) => Math.max(current - 1, 1))}
                  disabled={step === 1}
                >
                  <IconArrowLeft data-icon="inline-start" />
                  Sebelumnya
                </Button>
                {step < 4 ? (
                  <Button
                    type="button"
                    size="lg"
                    className="min-w-28 bg-gradient-to-b from-blue-500 to-blue-700 font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] hover:from-blue-500 hover:to-blue-800"
                    onClick={nextStep}
                  >
                    Selanjutnya
                    <IconArrowRight data-icon="inline-end" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="min-w-40 bg-gradient-to-b from-blue-500 to-blue-700 font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] hover:from-blue-500 hover:to-blue-800"
                    disabled={isSubmitting || submitted}
                  >
                    <IconSend data-icon="inline-start" />
                    {isSubmitting
                      ? "Mengirim..."
                      : submitted
                        ? "Terkirim"
                        : "Ajukan peminjaman"}
                  </Button>
                )}
              </div>
            </div>
          </Stepper>
        </form>
      </CardContent>
    </Card>
  )
}

function StepHeading({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <IconClipboardCheck className="size-5 text-muted-foreground" />
        <h4 className="text-lg font-semibold">{title}</h4>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="text-destructive">
      *
    </span>
  )
}

function RequiredLabel({
  children,
  ...props
}: React.ComponentProps<typeof FieldLabel>) {
  return (
    <FieldLabel {...props}>
      {children} <RequiredMark />
    </FieldLabel>
  )
}

function DateTimeFields({
  prefix,
  title,
  date,
  time,
  dateError,
  timeError,
  onDateChange,
  onTimeChange,
}: {
  prefix: string
  title: string
  date: string
  time: string
  dateError?: string
  timeError?: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
}) {
  const [dateOpen, setDateOpen] = useState(false)

  return (
    <fieldset className="grid gap-3 rounded-xl border p-4">
      <legend className="px-1 text-sm font-medium">{title}</legend>
      <Field data-invalid={!!dateError}>
        <RequiredLabel htmlFor={`${prefix}-date`}>Tanggal</RequiredLabel>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger
            className="w-full"
            render={
              <Button
                id={`${prefix}-date`}
                type="button"
                variant="outline"
                aria-invalid={!!dateError}
                className="h-10 w-full cursor-pointer justify-between px-3 font-normal"
              />
            }
          >
            <span className={date ? undefined : "text-muted-foreground"}>
              {date
                ? format(new Date(`${date}T00:00:00`), "d MMMM yyyy", {
                    locale: localeId,
                  })
                : "Pilih tanggal"}
            </span>
            <IconCalendar aria-hidden className="text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="single"
              locale={localeId}
              disabled={{ before: startOfDay(new Date()) }}
              selected={date ? new Date(`${date}T00:00:00`) : undefined}
              onSelect={(selected) => {
                if (!selected) return
                onDateChange(format(selected, "yyyy-MM-dd"))
                setDateOpen(false)
              }}
            />
          </PopoverContent>
        </Popover>
        <FieldError>{dateError}</FieldError>
      </Field>
      <Field data-invalid={!!timeError}>
        <RequiredLabel id={`${prefix}-time-label`} htmlFor={`${prefix}-time`}>
          Waktu
        </RequiredLabel>
        <TimePicker
          id={`${prefix}-time`}
          value={time || null}
          onValueChange={(value) => onTimeChange(value ?? "")}
          hourCycle={24}
          invalid={!!timeError}
          aria-labelledby={`${prefix}-time-label`}
          i18n={TIME_PICKER_I18N}
        >
          <TimePickerTrigger className="h-10 w-full cursor-pointer px-3" />
          <TimePickerContent align="start">
            <TimePickerColumns />
            <TimePickerFooter />
          </TimePickerContent>
        </TimePicker>
        <FieldError>{timeError}</FieldError>
      </Field>
    </fieldset>
  )
}

function ReviewItem({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-center gap-1.5 font-medium break-words">
        {icon}
        {value}
      </dd>
    </div>
  )
}

function formatDate(date: Date) {
  return format(date, "EEEE, d MMMM yyyy · HH:mm", { locale: localeId })
}
