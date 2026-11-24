"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { TZDate } from "@date-fns/tz"
import {
  IconBuildingCommunity,
  IconCalendarMonth,
  IconCalendarTime,
  IconCalendarWeek,
  IconListDetails,
  IconMapPin,
} from "@tabler/icons-react"
import {
  addDays,
  format,
  isSameMonth,
  isSameYear,
  startOfDay,
  startOfWeek,
  subMilliseconds,
} from "date-fns"
import { id as localeId } from "date-fns/locale"

import type { EventCalendarI18nOverrides } from "@/components/reui/event-calendar/event-calendar-i18n"
import { EventCalendar } from "@/components/reui/event-calendar/event-calendar"
import { EventCalendarContent } from "@/components/reui/event-calendar/event-calendar-content"
import {
  EventCalendarDatePicker,
  EventCalendarNav,
  EventCalendarNavNext,
  EventCalendarNavPrev,
  EventCalendarTitle,
} from "@/components/reui/event-calendar/event-calendar-nav"
import { EventCalendarResourceView } from "@/components/reui/event-calendar/event-calendar-resource-view"
import {
  EventCalendarDaysView,
  EventCalendarDayView,
  EventCalendarWeekView,
} from "@/components/reui/event-calendar/event-calendar-time-grid"
import type {
  CalendarEvent,
  EventCalendarOccurrence,
  EventCalendarRangeInfo,
  EventCalendarResource,
} from "@/components/reui/event-calendar/event-calendar-types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ROOM_NAMES,
  type BookingRoom,
  type BookingStatus as DbBookingStatus,
} from "@/lib/bookings"

const MOBILE_QUERY = "(max-width: 767px)"
type CalendarTab = "month" | "week" | "agenda"

const CALENDAR_VIEWS = {
  week: () => <EventCalendarWeekView showAllDay={false} />,
  day: () => <EventCalendarDayView showAllDay={false} />,
  days: () => <EventCalendarDaysView showAllDay={false} />,
  resource: () => <EventCalendarResourceView showAllDay={false} />,
}

const READ_ONLY_CLASS_NAMES = {
  event: "touch-pan-y",
}

function subscribeToMobile(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/** Agenda reads far better than a 7-column month grid on phones. */
function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
}

const ROOMS: EventCalendarResource[] = [
  {
    id: "aula-lantai-1",
    title: "Aula Masjid Lantai 1",
    color: "var(--color-blue-500)",
  },
  {
    id: "ruang-solat-lantai-2",
    title: "Ruang Solat Lantai 2",
    color: "var(--color-emerald-500)",
  },
  {
    id: "pelataran-masjid",
    title: "Pelataran Masjid",
    color: "var(--color-violet-500)",
  },
  {
    id: "lapangan-parkir",
    title: "Lapangan Parkir",
    color: "var(--color-cyan-500)",
  },
]

const ROOM_COLORS = {
  "aula-lantai-1": "var(--color-blue-500)",
  "ruang-solat-lantai-2": "var(--color-emerald-500)",
  "pelataran-masjid": "var(--color-violet-500)",
  "lapangan-parkir": "var(--color-cyan-500)",
} as const

const STATUS_COLORS = {
  pending: "var(--color-yellow-500)",
} as const

const LEGEND = [
  { label: "Aula Masjid Lantai 1", color: "bg-blue-500" },
  { label: "Ruang Solat Lantai 2", color: "bg-emerald-500" },
  { label: "Pelataran Masjid", color: "bg-violet-500" },
  { label: "Lapangan Parkir", color: "bg-cyan-500" },
  { label: "Menunggu persetujuan", color: "bg-yellow-500" },
]

type Room = BookingRoom
type BookingStatus = "approved" | keyof typeof STATUS_COLORS
type BookingDetails = {
  status: BookingStatus
  room: Room
  organizer: string | null
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  approved: "Disetujui",
  pending: "Menunggu persetujuan",
}

const STATUS_CLASSES: Record<BookingStatus, string> = {
  approved:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",
  pending:
    "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-950 dark:text-yellow-300",
}

function bookingColor(room: Room, status: BookingStatus) {
  return status === "approved" ? ROOM_COLORS[room] : STATUS_COLORS[status]
}

const I18N: EventCalendarI18nOverrides = {
  labels: {
    today: "Hari ini",
    previous: "Sebelumnya",
    next: "Berikutnya",
    allDay: "Sepanjang hari",
    noEvents: "Belum ada peminjaman",
    more: (count) => `+${count} lagi`,
    selectView: "Pilih tampilan",
    addEvent: "Tambah peminjaman",
    week: (weekNumber) => `Minggu ${weekNumber}`,
    resources: "Ruang",
  },
  viewNames: {
    month: "Bulan",
    week: "Minggu",
    day: "Hari",
    days: (count) => `${count} hari`,
    agenda: "Agenda",
    resource: "Per ruang",
  },
  formats: {
    dayTitle: "EEEE, d MMMM yyyy",
    timeGridDayHeader: "EEE d",
    agendaDayHeader: "EEEE, d MMMM",
    moreDayHeader: "EEEE, d MMMM",
    timeGutter: "HH:mm",
    timeGutterMinute: "HH:mm",
    eventTime: "HH:mm",
  },
  functions: {
    formatTitle: (view, { date, activeRange, locale }) => {
      const options = { locale }
      if (view === "month") return format(date, "MMMM yyyy", options)
      if (view === "day" || view === "resource") {
        return format(date, "d MMMM yyyy", options)
      }

      const start = activeRange.start
      const end = subMilliseconds(activeRange.end, 1)
      if (isSameMonth(start, end)) {
        return `${format(start, "d", options)} - ${format(end, "d MMMM yyyy", options)}`
      }
      if (isSameYear(start, end)) {
        return `${format(start, "d MMMM", options)} - ${format(end, "d MMMM yyyy", options)}`
      }
      return `${format(start, "d MMMM yyyy", options)} - ${format(end, "d MMMM yyyy", options)}`
    },
  },
}

export type PublicBooking = {
  id: string
  eventName: string
  organizer: string | null
  room: BookingRoom
  startAt: string
  endAt: string
  status: Exclude<DbBookingStatus, "REJECTED">
}

export function splitBookingOccurrences(
  { start, end }: Pick<CalendarEvent, "start" | "end">,
  _range: EventCalendarRangeInfo["range"],
  { timeZone }: { timeZone: string }
) {
  const segments = []
  let cursor = start
  while (cursor < end) {
    const midnight = addDays(startOfDay(new TZDate(cursor, timeZone)), 1)
    const segmentEnd = midnight < end ? midnight : end
    segments.push({ start: cursor, end: segmentEnd })
    cursor = segmentEnd
  }
  return segments
}

export function PeminjamanCalendar() {
  const isMobile = useIsMobile()
  const [tab, setTab] = useState<CalendarTab>("week")
  const [bookings, setBookings] = useState<PublicBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const requestRef = useRef<AbortController | null>(null)
  const activeRangeRef = useRef<EventCalendarRangeInfo | null>(null)
  const [selected, setSelected] =
    useState<EventCalendarOccurrence<BookingDetails> | null>(null)

  const loadRange = useCallback(async ({ range }: EventCalendarRangeInfo) => {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    setLoading(true)
    setLoadError("")

    try {
      const params = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      })
      const response = await fetch(`/api/bookings?${params}`, {
        cache: "no-store",
        signal: controller.signal,
      })
      const result = (await response.json()) as {
        bookings?: PublicBooking[]
        message?: string
      }
      if (!response.ok) {
        throw new Error(result.message ?? "Jadwal gagal dimuat.")
      }
      setBookings(result.bookings ?? [])
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return
      setBookings([])
      setLoadError(
        error instanceof Error ? error.message : "Jadwal gagal dimuat."
      )
    } finally {
      if (requestRef.current === controller) {
        setLoading(false)
      }
    }
  }, [])

  const handleRangeChange = useCallback(
    (info: EventCalendarRangeInfo) => {
      activeRangeRef.current = info
      void loadRange(info)
    },
    [loadRange]
  )

  useEffect(() => {
    const start = startOfWeek(
      startOfDay(new TZDate(Date.now(), "Asia/Jakarta")),
      { weekStartsOn: 1 }
    )
    const initialRange: EventCalendarRangeInfo = {
      range: { start, end: addDays(start, 7) },
      activeRange: { start, end: addDays(start, 7) },
      view: "week",
      date: new Date(),
      timeZone: "Asia/Jakarta",
    }
    const range = activeRangeRef.current ?? initialRange
    activeRangeRef.current = range
    void loadRange(range)

    const refresh = () => {
      if (document.visibilityState === "visible" && activeRangeRef.current) {
        void loadRange(activeRangeRef.current)
      }
    }
    window.addEventListener("pageshow", refresh)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      requestRef.current?.abort()
      window.removeEventListener("pageshow", refresh)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [loadRange])

  const events = useMemo<CalendarEvent<BookingDetails>[]>(
    () =>
      bookings.map((item) => {
        const status = item.status === "APPROVED" ? "approved" : "pending"
        return {
          id: item.id,
          title: item.eventName,
          start: new Date(item.startAt),
          end: new Date(item.endAt),
          resourceId: item.room,
          color: bookingColor(item.room, status),
          readOnly: true,
          data: {
            status,
            room: item.room,
            organizer: item.organizer,
          },
        }
      }),
    [bookings]
  )
  const view = tab === "week" && isMobile ? "days" : tab
  const details = selected?.event.data

  return (
    <EventCalendar
      events={events}
      getOccurrences={
        view === "week" || view === "days" ? splitBookingOccurrences : undefined
      }
      onEventClick={(occurrence, event) => {
        event.preventDefault()
        setSelected(occurrence)
      }}
      onRangeChange={handleRangeChange}
      loading={loading}
      view={view}
      views={["month", "week", "days", "agenda"]}
      dayCount={3}
      resources={ROOMS}
      locale={localeId}
      i18n={I18N}
      weekStartsOn={1}
      timeZone="Asia/Jakarta"
      dayStartHour={0}
      dayEndHour={24}
      interactions={{ drag: false, resize: false, selectSlot: false }}
      todayClassName="bg-primary/5"
      eventTooltip={!isMobile}
      renderEvent={({ occurrence }) => (
        <span className="block w-full min-w-0">
          <span className="block truncate font-medium">
            {occurrence.event.title}
          </span>
          {occurrence.event.data?.organizer && (
            <span className="block truncate opacity-80">
              {occurrence.event.data.organizer}
            </span>
          )}
          <span className="block truncate tabular-nums opacity-80">
            {format(new TZDate(occurrence.start, "Asia/Jakarta"), "HH:mm")}
            {"–"}
            {format(
              new TZDate(occurrence.end, "Asia/Jakarta"),
              "HH:mm"
            ).replace(/^00:00$/, "24:00")}
          </span>
        </span>
      )}
      scrollMode="page"
      enableShortcuts={false}
      components={CALENDAR_VIEWS}
      classNames={READ_ONLY_CLASS_NAMES}
      className="relative isolate z-0 w-full"
    >
      <div className="flex flex-col gap-3 border-b bg-muted/20 px-3 py-3 md:flex-row md:items-center md:justify-between md:px-4">
        <Tabs
          value={tab}
          onValueChange={(value) => value && setTab(value as CalendarTab)}
          className="w-full md:w-auto"
        >
          <TabsList className="h-10! w-full border bg-muted p-1 md:w-fit">
            <TabsTrigger
              value="month"
              className="flex-1 hover:bg-background/70 md:flex-none data-active:border-border data-active:bg-background data-active:text-foreground data-active:shadow-sm"
            >
              <IconCalendarMonth aria-hidden data-icon="inline-start" />
              Bulan
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="flex-1 hover:bg-background/70 md:flex-none data-active:border-border data-active:bg-background data-active:text-foreground data-active:shadow-sm"
            >
              <IconCalendarWeek aria-hidden data-icon="inline-start" />
              Minggu
            </TabsTrigger>
            <TabsTrigger
              value="agenda"
              className="flex-1 hover:bg-background/70 md:flex-none data-active:border-border data-active:bg-background data-active:text-foreground data-active:shadow-sm"
            >
              <IconListDetails aria-hidden data-icon="inline-start" />
              Agenda
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <EventCalendarNav
          showViewSwitcher={false}
          className="w-full min-w-0 rounded-lg border bg-muted p-1 md:w-auto"
        >
          <div className="flex w-full min-w-0 items-center gap-1 md:w-auto">
            <EventCalendarNavPrev
              tooltip={null}
              className="size-8! shrink-0 border-border bg-background hover:bg-accent"
            />
            <EventCalendarDatePicker
              tooltip={null}
              className="h-8! w-full! min-w-0 flex-1 border-border bg-background px-2 hover:bg-accent md:w-64! md:flex-none"
            >
              <EventCalendarTitle
                render={<span />}
                className="m-0 w-full text-center"
              />
            </EventCalendarDatePicker>
            <EventCalendarNavNext
              tooltip={null}
              className="size-8! shrink-0 border-border bg-background hover:bg-accent"
            />
          </div>
        </EventCalendarNav>
      </div>
      <EventCalendarContent />
      {loadError && (
        <p role="alert" className="border-t px-4 py-3 text-sm text-destructive">
          {loadError}
        </p>
      )}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 border-t px-4 py-3 text-center text-xs text-muted-foreground">
        {LEGEND.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span aria-hidden className={`size-2 rounded-full ${item.color}`} />
            {item.label}
          </span>
        ))}
      </div>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {selected && details && (
            <>
              <DialogHeader className="border-b bg-muted/40 px-6 py-5 pr-12 sm:px-8 sm:py-6">
                <div>
                  <Badge
                    variant="outline"
                    className={STATUS_CLASSES[details.status]}
                  >
                    {STATUS_LABELS[details.status]}
                  </Badge>
                </div>
                <DialogTitle className="text-xl sm:text-2xl">
                  {selected.event.title}
                </DialogTitle>
                <DialogDescription>
                  Detail jadwal peminjaman tempat
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 p-4 sm:p-6">
                <Card size="sm">
                  <CardContent className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <DetailRow
                      icon={IconMapPin}
                      label="Tempat"
                      value={ROOM_NAMES[details.room]}
                    />
                    {details.organizer && (
                      <DetailRow
                        icon={IconBuildingCommunity}
                        label="Penyelenggara"
                        value={details.organizer}
                      />
                    )}
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardContent className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                    <DetailRow
                      icon={IconCalendarTime}
                      label="Waktu mulai"
                      value={format(
                        new TZDate(selected.event.start, "Asia/Jakarta"),
                        "EEEE, d MMMM yyyy · HH:mm",
                        {
                          locale: localeId,
                        }
                      )}
                    />
                    <DetailRow
                      icon={IconCalendarTime}
                      label="Waktu selesai"
                      value={format(
                        new TZDate(selected.event.end, "Asia/Jakarta"),
                        "EEEE, d MMMM yyyy · HH:mm",
                        { locale: localeId }
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </EventCalendar>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconMapPin
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid min-w-0 grid-cols-[2.25rem_1fr] gap-x-3">
      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon aria-hidden className="size-4" />
      </span>
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-1 leading-snug font-medium">{value}</dd>
      </div>
    </div>
  )
}
