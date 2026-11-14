"use client"

import { useMemo, useState } from "react"
import {
  MultiplicationSignIcon,
  Search01Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  type PaginationState,
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
import { useIsMobile } from "@/hooks/use-mobile"

export type AdminAspiration = {
  id: string
  sender: string
  isAnonymous: boolean
  message: string
  createdAt: string
  submittedAt: string
}

function DetailButton({
  aspiration,
  onOpen,
}: {
  aspiration: AdminAspiration
  onOpen: (aspiration: AdminAspiration) => void
}) {
  return (
    <Button
      size="icon-sm"
      variant="ghost"
      aria-label={`Lihat aspirasi dari ${aspiration.sender}`}
      title="Lihat aspirasi"
      onClick={() => onOpen(aspiration)}
    >
      <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
    </Button>
  )
}

export function AdminAspirations({
  aspirations,
}: {
  aspirations: AdminAspiration[]
}) {
  const isMobile = useIsMobile()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<AdminAspiration | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ])

  const filteredAspirations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID")
    if (!query) return aspirations

    return aspirations.filter(
      (item) =>
        item.sender.toLocaleLowerCase("id-ID").includes(query) ||
        item.message.toLocaleLowerCase("id-ID").includes(query)
    )
  }, [aspirations, search])

  const rowsPerPage = isMobile ? Math.max(filteredAspirations.length, 1) : 10
  const pageIndex = isMobile ? 0 : pagination.pageIndex

  const columns = useMemo<
    ColumnDef<DataGridFeatures, AdminAspiration>[]
  >(() => {
    if (isMobile) {
      return [
        {
          id: "createdAt",
          accessorKey: "createdAt",
          header: "Aspirasi",
          cell: ({ row }) => {
            const item = row.original

            return (
              <div className="flex min-w-0 items-start gap-3 py-1">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.sender}</span>
                    {item.isAnonymous && (
                      <Badge variant="outline" radius="full">
                        Anonim
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm whitespace-normal">
                    {item.message}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.submittedAt}
                  </p>
                </div>
                <DetailButton aspiration={item} onOpen={setSelected} />
              </div>
            )
          },
          sortingFn: "datetime",
          size: 280,
          enableResizing: false,
          meta: { cellClassName: "whitespace-normal" },
        },
      ]
    }

    return [
      {
        accessorKey: "sender",
        id: "sender",
        header: ({ column }) => (
          <DataGridColumnHeader title="Pengirim" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{row.original.sender}</span>
            {row.original.isAnonymous && (
              <Badge variant="outline" radius="full">
                Anonim
              </Badge>
            )}
          </div>
        ),
        size: 180,
      },
      {
        accessorKey: "message",
        id: "message",
        header: ({ column }) => (
          <DataGridColumnHeader title="Isi aspirasi" column={column} />
        ),
        cell: ({ row }) => (
          <p className="line-clamp-2 whitespace-normal">
            {row.original.message}
          </p>
        ),
        size: 420,
        meta: { fillWidth: true, cellClassName: "whitespace-normal" },
      },
      {
        accessorKey: "createdAt",
        id: "createdAt",
        header: ({ column }) => (
          <DataGridColumnHeader title="Dikirim" column={column} />
        ),
        cell: ({ row }) => row.original.submittedAt,
        sortingFn: "datetime",
        size: 205,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DetailButton aspiration={row.original} onOpen={setSelected} />
          </div>
        ),
        size: 52,
        enableSorting: false,
        enableResizing: false,
      },
    ]
  }, [isMobile])

  const table = useTable({
    features: dataGridFeatures,
    columns,
    data: filteredAspirations,
    pageCount: Math.ceil(filteredAspirations.length / rowsPerPage),
    getRowId: (row: AdminAspiration) => row.id,
    state: {
      pagination: { pageIndex, pageSize: rowsPerPage },
      sorting,
    },
    onPaginationChange: (updater) =>
      setPagination((current) => {
        const next =
          typeof updater === "function"
            ? updater({ ...current, pageSize: rowsPerPage })
            : updater
        return { pageIndex: next.pageIndex, pageSize: rowsPerPage }
      }),
    onSortingChange: setSorting,
    autoResetPageIndex: true,
  })

  return (
    <AdminShell page="Aspirasi">
      <div className="flex min-w-0 flex-1 flex-col gap-6 p-3 sm:p-5 lg:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Aspirasi
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Baca saran dan masukan yang dikirim jamaah.
          </p>
        </div>

        <DataGrid
          table={table}
          recordCount={filteredAspirations.length}
          emptyMessage={
            search
              ? `Aspirasi dengan kata “${search}” tidak ditemukan.`
              : "Belum ada aspirasi yang masuk."
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
            base: isMobile ? "w-full min-w-0 table-fixed" : "min-w-[857px]",
          }}
        >
          <Card className="min-w-0 gap-0 py-0">
            <CardHeader className="border-b px-3 py-3 sm:px-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium tabular-nums">
                  {filteredAspirations.length} aspirasi
                </p>
                <InputGroup className="w-full sm:w-72">
                  <InputGroupAddon align="inline-start">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-label="Cari aspirasi"
                    placeholder="Cari nama atau isi..."
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
                        onClick={() => setSearch("")}
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
            {!isMobile && filteredAspirations.length > 0 && (
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

      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aspirasi dari {selected?.sender}</DialogTitle>
            <DialogDescription>{selected?.submittedAt}</DialogDescription>
          </DialogHeader>
          <p className="max-h-[60svh] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
            {selected?.message}
          </p>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Tutup
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
