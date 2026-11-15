"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  CancelCircleIcon,
  MultiplicationSignIcon,
  Search01Icon,
  Tick02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  type ColumnDef,
  type PaginationState,
  useTable,
} from "@tanstack/react-table"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/reui/badge"
import {
  DataGrid,
  DataGridContainer,
  dataGridFeatures,
  type DataGridFeatures,
} from "@/components/reui/data-grid/data-grid"
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header"
import { DataGridPagination } from "@/components/reui/data-grid/data-grid-pagination"
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area"
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import type {
  AdminBookingPage,
  Booking,
  BookingStatus,
} from "@/lib/admin-booking-data"
import { formatBookingMonth } from "@/lib/admin-bookings"

type BookingView = "active" | "archive"

type BookingAction = { type: "approve" | "reject"; booking: Booking } | null

const STATUS_VARIANTS = {
  Menunggu: "warning-light",
  Disetujui: "success-light",
  Ditolak: "destructive-light",
} as const

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} radius="full">
      {status}
    </Badge>
  )
}

function BookingActions({
  booking,
  onAction,
  archived = false,
  showLabels = false,
}: {
  booking: Booking
  onAction: (action: Exclude<BookingAction, null>) => void
  archived?: boolean
  showLabels?: boolean
}) {
  const actions = [
    {
      type: "approve" as const,
      label: "Setujui",
      icon: Tick02Icon,
      variant: "outline" as const,
      className:
        "border-success/20 bg-success/10 text-success-foreground hover:bg-success/20 dark:border-success/30 dark:bg-success/15 dark:text-success dark:hover:bg-success/25",
      disabled: booking.status === "Disetujui",
    },
    {
      type: "reject" as const,
      label: "Tolak",
      icon: CancelCircleIcon,
      variant: "outline" as const,
      className:
        "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 dark:border-destructive/30 dark:bg-destructive/15 dark:hover:bg-destructive/25",
      disabled: booking.status === "Ditolak",
    },
  ]

  return (
    <div
      className={
        showLabels
          ? "grid grid-cols-3 gap-2"
          : "flex items-center justify-end gap-1"
      }
    >
      <Button
        size={showLabels ? "sm" : "icon-sm"}
        variant="outline"
        nativeButton={false}
        aria-label={`Detail ${booking.id}`}
        title={`Detail ${booking.id}`}
        className={showLabels ? "w-full" : undefined}
        render={<Link href={`/admin/peminjaman/${booking.id}`} />}
      >
        <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
        {showLabels && "Detail"}
      </Button>
      {archived
        ? booking.letterUrl && (
            <Button
              size={showLabels ? "sm" : "icon-sm"}
              variant="outline"
              nativeButton={false}
              aria-label={`Buka surat ${booking.id}`}
              title={`Buka surat ${booking.id}`}
              className={showLabels ? "col-span-2 w-full" : undefined}
              render={
                <a
                  href={booking.letterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} />
              {showLabels && "Buka surat"}
            </Button>
          )
        : actions.map((item) => (
            <Button
              key={item.type}
              size={showLabels ? "sm" : "icon-sm"}
              variant={item.variant}
              disabled={item.disabled}
              aria-label={`${item.label} ${booking.id}`}
              title={`${item.label} ${booking.id}`}
              className={
                showLabels ? `w-full ${item.className}` : item.className
              }
              onClick={() => onAction({ type: item.type, booking })}
            >
              <HugeiconsIcon icon={item.icon} strokeWidth={2} />
              {showLabels && item.label}
            </Button>
          ))}
    </div>
  )
}

function ConfirmActionDialog({
  action,
  onCancel,
  onConfirm,
}: {
  action: Exclude<BookingAction, null>
  onCancel: () => void
  onConfirm: () => Promise<void>
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const copy = {
    approve: {
      title: "Setujui peminjaman?",
      description: `Peminjaman ${action.booking.id} akan disetujui dan memblokir jadwal terkait.`,
      button: "Setujui",
    },
    reject: {
      title: "Tolak peminjaman?",
      description: `Peminjaman ${action.booking.id} akan ditolak dan tidak memblokir jadwal.`,
      button: "Tolak",
    },
  }[action.type]

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
          <Button
            variant={action.type === "approve" ? "default" : "destructive"}
            disabled={isSubmitting}
            onClick={async () => {
              setIsSubmitting(true)
              try {
                await onConfirm()
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            {isSubmitting ? "Memproses..." : copy.button}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminBookings({
  initialPage,
}: {
  initialPage: AdminBookingPage
}) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const [bookings, setBookings] = useState(initialPage.bookings)
  const [total, setTotal] = useState(initialPage.total)
  const [activeCount, setActiveCount] = useState(initialPage.activeCount)
  const [archiveCount, setArchiveCount] = useState(initialPage.archiveCount)
  const [pendingCount, setPendingCount] = useState(initialPage.pendingCount)
  const [archiveMonths, setArchiveMonths] = useState(initialPage.archiveMonths)
  const [isLoading, setIsLoading] = useState(false)
  const requestRef = useRef<AbortController | null>(null)
  const isInitialRender = useRef(true)
  const [mutationError, setMutationError] = useState("")
  const [view, setView] = useState<BookingView>("active")
  const [month, setMonth] = useState("")
  const [search, setSearch] = useState("")
  const [action, setAction] = useState<BookingAction>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const effectiveMonth = archiveMonths.includes(month)
    ? month
    : (archiveMonths[0] ?? "")
  const monthIndex = archiveMonths.indexOf(effectiveMonth)

  const rowsPerPage = 10
  const pageIndex = pagination.pageIndex

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }

    const controller = new AbortController()
    requestRef.current?.abort()
    requestRef.current = controller
    const timer = window.setTimeout(
      async () => {
        setIsLoading(true)
        setMutationError("")
        try {
          const params = new URLSearchParams({
            view,
            page: String(pageIndex + 1),
          })
          if (view === "archive" && effectiveMonth) {
            params.set("month", effectiveMonth)
          }
          if (search.trim()) params.set("search", search.trim())

          const response = await fetch(`/api/admin/bookings?${params}`, {
            signal: controller.signal,
          })
          const result = (await response.json()) as AdminBookingPage & {
            message?: string
          }
          if (!response.ok) {
            throw new Error(result.message ?? "Peminjaman gagal dimuat.")
          }
          setBookings(result.bookings)
          setTotal(result.total)
          setActiveCount(result.activeCount)
          setArchiveCount(result.archiveCount)
          setPendingCount(result.pendingCount)
          setArchiveMonths(result.archiveMonths)
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            return
          setMutationError(
            error instanceof Error ? error.message : "Peminjaman gagal dimuat."
          )
        } finally {
          if (requestRef.current === controller) setIsLoading(false)
        }
      },
      search ? 250 : 0
    )

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [effectiveMonth, pageIndex, search, view])

  const handleAction = useCallback(
    (nextAction: Exclude<BookingAction, null>) => setAction(nextAction),
    []
  )

  const columns = useMemo<ColumnDef<DataGridFeatures, Booking>[]>(() => {
    if (isMobile) {
      return [
        {
          id: "status",
          header: "Peminjaman",
          cell: ({ row }) => {
            const booking = row.original

            return (
              <div className="min-w-0 space-y-3 py-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium tabular-nums">{booking.id}</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium wrap-break-word">
                    {booking.activity}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {booking.requester}
                  </p>
                </div>
                <div className="grid gap-1 text-xs text-muted-foreground">
                  <p className="wrap-break-word text-foreground">
                    {booking.venue}
                  </p>
                  <p className="wrap-break-word">{booking.schedule}</p>
                </div>
                <BookingActions
                  booking={booking}
                  onAction={handleAction}
                  archived={view === "archive"}
                  showLabels
                />
              </div>
            )
          },
          size: 280,
          enableResizing: false,
          meta: { cellClassName: "whitespace-normal" },
        },
      ]
    }

    return [
      {
        accessorKey: "id",
        id: "id",
        header: ({ column }) => (
          <DataGridColumnHeader title="ID" column={column} />
        ),
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">{row.original.id}</span>
        ),
        size: 105,
      },
      {
        accessorKey: "activity",
        id: "activity",
        header: ({ column }) => (
          <DataGridColumnHeader title="Peminjaman" column={column} />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.activity}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.requester}
            </p>
          </div>
        ),
        size: 200,
        meta: { fillWidth: true },
      },
      {
        accessorKey: "venue",
        id: "venue",
        header: ({ column }) => (
          <DataGridColumnHeader title="Tempat" column={column} />
        ),
        size: 170,
      },
      {
        accessorKey: "schedule",
        id: "schedule",
        header: ({ column }) => (
          <DataGridColumnHeader title="Jadwal" column={column} />
        ),
        size: 210,
      },
      {
        accessorKey: "status",
        id: "status",
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        size: 100,
      },
      {
        accessorKey: "submittedAt",
        id: "submittedAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Diajukan" column={column} />
        ),
        size: 150,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <BookingActions
            booking={row.original}
            onAction={handleAction}
            archived={view === "archive"}
          />
        ),
        size: 132,
        enableSorting: false,
        enableResizing: false,
      },
    ]
  }, [handleAction, isMobile, view])

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: bookings,
    pageCount: Math.ceil(total / rowsPerPage),
    getRowId: (row: Booking) => row.id,
    state: {
      pagination: { pageIndex, pageSize: rowsPerPage },
    },
    onPaginationChange: (updater) =>
      setPagination((current) => {
        const currentPagination = { ...current, pageSize: rowsPerPage }
        const next =
          typeof updater === "function" ? updater(currentPagination) : updater

        return { pageIndex: next.pageIndex, pageSize: rowsPerPage }
      }),
    manualPagination: true,
    manualSorting: true,
    enableSorting: false,
    autoResetPageIndex: false,
  })

  const confirmAction = async () => {
    if (!action) return

    setMutationError("")
    const response = await fetch(
      `/api/admin/bookings/${encodeURIComponent(action.booking.id)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action.type === "approve" ? "APPROVED" : "REJECTED",
        }),
      }
    )
    const result = (await response.json().catch(() => null)) as {
      message?: string
    } | null
    if (!response.ok) {
      setMutationError(result?.message ?? "Status gagal diubah.")
      return
    }

    const status = action.type === "approve" ? "Disetujui" : "Ditolak"
    setBookings((current) =>
      current.map((item) =>
        item.id === action.booking.id ? { ...item, status } : item
      )
    )
    if (action.booking.status === "Menunggu")
      setPendingCount((count) => Math.max(0, count - 1))
    setAction(null)
    router.refresh()
  }

  return (
    <AdminShell page="Peminjaman" waitingBookings={pendingCount}>
      <div className="flex min-w-0 flex-1 flex-col gap-6 p-3 sm:p-5 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Peminjaman
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Tinjau pengajuan, ubah status, dan kelola riwayat peminjaman tempat
            masjid.
          </p>
        </div>

        {mutationError && (
          <p role="alert" className="text-sm text-destructive">
            {mutationError}
          </p>
        )}

        <DataGrid
          table={table}
          recordCount={total}
          isLoading={isLoading}
          emptyMessage={
            search
              ? `ID peminjaman “${search}” tidak ditemukan.`
              : view === "active"
                ? "Belum ada peminjaman yang masih berlaku."
                : effectiveMonth === ""
                  ? "Belum ada peminjaman dalam arsip."
                  : `Belum ada peminjaman pada ${formatBookingMonth(effectiveMonth)}.`
          }
          i18n={{
            labels: {
              sortAscending: "Urutkan naik",
              sortDescending: "Urutkan turun",
              empty: "Tidak ada data",
              rowsPerPage: "Baris per halaman",
              paginationInfo: ({ from, to, count }) =>
                `${from}–${to} dari ${count}`,
              previousPage: "Halaman sebelumnya",
              nextPage: "Halaman berikutnya",
              goToPage: (page) => `Ke halaman ${page}`,
            },
          }}
          tableLayout={{
            dense: true,
            headerBackground: true,
            columnsResizable: !isMobile,
          }}
          tableClassNames={{
            base: isMobile ? "w-full min-w-0 table-fixed" : "min-w-[1067px]",
          }}
        >
          <Card className="min-w-0 gap-0 py-0">
            <CardHeader className="gap-4 border-b px-3 py-3 sm:px-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Tabs
                  value={view}
                  onValueChange={(value) => {
                    setView(value as BookingView)
                    setPagination((current) => ({
                      ...current,
                      pageIndex: 0,
                    }))
                  }}
                  className="w-full sm:w-auto"
                >
                  <TabsList className="w-full sm:w-fit">
                    <TabsTrigger value="active">
                      Masih berlaku
                      <Badge variant="outline" size="sm" radius="full">
                        {activeCount}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="archive">
                      Arsip
                      <Badge variant="outline" size="sm" radius="full">
                        {archiveCount}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  {view === "archive" && (
                    <div className="flex w-full items-center justify-between gap-1 sm:w-auto">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Bulan sebelumnya"
                        title="Bulan sebelumnya"
                        disabled={monthIndex >= archiveMonths.length - 1}
                        onClick={() => {
                          setMonth(archiveMonths[monthIndex + 1])
                          setPagination((current) => ({
                            ...current,
                            pageIndex: 0,
                          }))
                        }}
                      >
                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
                      </Button>
                      <span className="min-w-32 flex-1 text-center text-sm font-medium tabular-nums sm:flex-none">
                        {effectiveMonth
                          ? formatBookingMonth(effectiveMonth)
                          : "Belum ada arsip"}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Bulan berikutnya"
                        title="Bulan berikutnya"
                        disabled={monthIndex <= 0}
                        onClick={() => {
                          setMonth(archiveMonths[monthIndex - 1])
                          setPagination((current) => ({
                            ...current,
                            pageIndex: 0,
                          }))
                        }}
                      >
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  )}

                  <InputGroup className="w-full sm:w-64">
                    <InputGroupAddon align="inline-start">
                      <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                    </InputGroupAddon>
                    <InputGroupInput
                      aria-label="Cari berdasarkan ID peminjaman"
                      placeholder="Cari ID peminjaman..."
                      maxLength={50}
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value)
                        setPagination((current) => ({
                          ...current,
                          pageIndex: 0,
                        }))
                      }}
                    />
                    {search && (
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="Hapus pencarian"
                          title="Hapus pencarian"
                          size="icon-xs"
                          onClick={() => {
                            setSearch("")
                            setPagination((current) => ({
                              ...current,
                              pageIndex: 0,
                            }))
                          }}
                        >
                          <HugeiconsIcon
                            icon={MultiplicationSignIcon}
                            strokeWidth={2}
                          />
                        </InputGroupButton>
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataGridContainer>
                <DataGridScrollArea
                  orientation={isMobile ? "vertical" : "both"}
                >
                  <DataGridTable />
                </DataGridScrollArea>
              </DataGridContainer>
            </CardContent>
            {total > 0 && (
              <CardFooter className="border-t bg-transparent px-3 py-2 sm:px-4">
                <DataGridPagination
                  sizes={[10]}
                  className="[&>div:first-child]:hidden"
                />
              </CardFooter>
            )}
          </Card>
        </DataGrid>
      </div>

      {action && (
        <ConfirmActionDialog
          action={action}
          onCancel={() => setAction(null)}
          onConfirm={confirmAction}
        />
      )}
    </AdminShell>
  )
}
