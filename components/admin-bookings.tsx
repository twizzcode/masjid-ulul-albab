"use client"

import { useCallback, useMemo, useState } from "react"
import {
  CancelCircleIcon,
  MultiplicationSignIcon,
  Search01Icon,
  Tick02Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import {
  type ColumnDef,
  type PaginationState,
  type Row,
  type SortingState,
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  ADMIN_BOOKINGS,
  type Booking,
  type BookingStatus,
} from "@/lib/admin-booking-data"
import { isBookingArchived, matchesBookingId } from "@/lib/admin-bookings"

type BookingView = "active" | "archive"

type BookingAction = { type: "approve" | "reject"; booking: Booking } | null

const STATUS_VARIANTS = {
  Menunggu: "warning-light",
  Disetujui: "success-light",
  Ditolak: "destructive-light",
} as const

const STATUS_PRIORITY: Record<BookingStatus, number> = {
  Menunggu: 3,
  Disetujui: 2,
  Ditolak: 1,
}

function sortByStatus(
  rowA: Row<DataGridFeatures, Booking>,
  rowB: Row<DataGridFeatures, Booking>
) {
  return (
    STATUS_PRIORITY[rowA.original.status] -
    STATUS_PRIORITY[rowB.original.status]
  )
}

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
  showLabels = false,
}: {
  booking: Booking
  onAction: (action: Exclude<BookingAction, null>) => void
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
      {actions.map((item) => (
        <Button
          key={item.type}
          size={showLabels ? "sm" : "icon-sm"}
          variant={item.variant}
          disabled={item.disabled}
          aria-label={`${item.label} ${booking.id}`}
          title={`${item.label} ${booking.id}`}
          className={showLabels ? `w-full ${item.className}` : item.className}
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
  onConfirm: () => void
}) {
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
            onClick={onConfirm}
          >
            {copy.button}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminBookings() {
  const isMobile = useIsMobile()
  const [now] = useState(() => Date.now())
  const [bookings, setBookings] = useState(ADMIN_BOOKINGS)
  const [view, setView] = useState<BookingView>("active")
  const [search, setSearch] = useState("")
  const [action, setAction] = useState<BookingAction>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "status", desc: true },
  ])

  const activeCount = bookings.filter(
    (booking) => !isBookingArchived(booking.endAt, now)
  ).length
  const archiveCount = bookings.length - activeCount

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return bookings.filter((booking) => {
      const isArchive = isBookingArchived(booking.endAt, now)
      const matchesView = view === "archive" ? isArchive : !isArchive
      const matchesId =
        normalizedSearch.length === 0 || matchesBookingId(booking.id, search)

      return matchesView && matchesId
    })
  }, [bookings, now, search, view])

  const rowsPerPage = isMobile ? Math.max(filteredBookings.length, 1) : 10
  const pageIndex = isMobile ? 0 : pagination.pageIndex

  const handleAction = useCallback(
    (nextAction: Exclude<BookingAction, null>) => setAction(nextAction),
    []
  )

  const columns = useMemo<ColumnDef<DataGridFeatures, Booking>[]>(
    () => {
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
                    <span className="font-medium tabular-nums">
                      {booking.id}
                    </span>
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
                    showLabels
                  />
                </div>
              )
            },
            size: 280,
            sortingFn: sortByStatus,
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
          sortingFn: sortByStatus,
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
            />
          ),
          size: 132,
          enableSorting: false,
          enableResizing: false,
        },
      ]
    },
    [handleAction, isMobile]
  )

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: filteredBookings,
    pageCount: Math.ceil(filteredBookings.length / rowsPerPage),
    getRowId: (row: Booking) => row.id,
    state: {
      pagination: { pageIndex, pageSize: rowsPerPage },
      sorting,
    },
    onPaginationChange: (updater) =>
      setPagination((current) => {
        const currentPagination = { ...current, pageSize: rowsPerPage }
        const next =
          typeof updater === "function"
            ? updater(currentPagination)
            : updater

        return { pageIndex: next.pageIndex, pageSize: rowsPerPage }
      }),
    onSortingChange: setSorting,
    autoResetPageIndex: true,
  })

  const confirmAction = () => {
    if (!action) return

    const status = action.type === "approve" ? "Disetujui" : "Ditolak"
    setBookings((current) =>
      current.map((booking) =>
        booking.id === action.booking.id ? { ...booking, status } : booking
      )
    )

    setAction(null)
  }

  return (
    <AdminShell page="Peminjaman">
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

        <DataGrid
          table={table}
          recordCount={filteredBookings.length}
          emptyMessage={
            search
              ? `ID peminjaman “${search}” tidak ditemukan.`
              : view === "active"
                ? "Belum ada peminjaman yang masih berlaku."
                : "Belum ada peminjaman dalam arsip."
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
                    setPagination((current) => ({ ...current, pageIndex: 0 }))
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

                <InputGroup className="w-full sm:w-64">
                  <InputGroupAddon align="inline-start">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-label="Cari berdasarkan ID peminjaman"
                    placeholder="Cari ID peminjaman..."
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value)
                      setPagination((current) => ({ ...current, pageIndex: 0 }))
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
            {!isMobile && (
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
