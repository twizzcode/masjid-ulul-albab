"use client"

import { useCallback, useMemo, useState, type FormEvent } from "react"
import {
  Loading03Icon,
  PlusSignIcon,
  Search01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  type ColumnDef,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table"
import { useRouter } from "next/navigation"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import type { AdminUser, SearchUser } from "@/lib/admin-users"

type SearchState = "idle" | "loading" | "done" | "error"

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function UserCell({ user }: { user: AdminUser }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar>
        {user.image && (
          <AvatarImage
            src={user.image}
            alt=""
            keepMounted
            referrerPolicy="no-referrer"
            className="data-[error]:invisible data-[loading]:invisible"
          />
        )}
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block truncate font-medium">{user.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {user.email}
        </span>
      </span>
    </div>
  )
}

function ResultAction({
  item,
  promoting,
  onPromote,
}: {
  item: SearchUser
  promoting: boolean
  onPromote: (id: string) => void
}) {
  if (item.isAdmin) {
    return <Badge variant="success-light">Admin</Badge>
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={promoting}
      onClick={() => onPromote(item.id)}
      aria-label={`Jadikan ${item.email} admin`}
    >
      <HugeiconsIcon
        icon={promoting ? Loading03Icon : UserAdd01Icon}
        strokeWidth={2}
        className={
          promoting ? "animate-spin motion-reduce:animate-pulse" : undefined
        }
      />
      Jadikan admin
    </Button>
  )
}

export function AdminUsers({ admins }: { admins: AdminUser[] }) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [searchState, setSearchState] = useState<SearchState>("idle")
  const [results, setResults] = useState<SearchUser[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [actionError, setActionError] = useState("")
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const [adminPagination, setAdminPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [adminSorting, setAdminSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ])

  const adminRowsPerPage = isMobile ? Math.max(admins.length, 1) : 10
  const adminPageIndex = isMobile ? 0 : adminPagination.pageIndex

  function handleDialogChange(open: boolean) {
    setDialogOpen(open)
    if (!open) {
      setEmail("")
      setResults([])
      setErrorMessage("")
      setActionError("")
      setSearchState("idle")
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = email.trim()
    if (query.length < 3) {
      setResults([])
      setSearchState("error")
      setErrorMessage("Masukkan minimal 3 karakter email.")
      return
    }

    setSearchState("loading")
    setErrorMessage("")
    setActionError("")

    try {
      const response = await fetch(
        `/api/admin/users?email=${encodeURIComponent(query)}`
      )
      const result = (await response.json()) as {
        message?: string
        users?: SearchUser[]
      }

      if (!response.ok) {
        throw new Error(result.message || "Pencarian pengguna gagal.")
      }

      setResults(result.users ?? [])
      setSearchState("done")
    } catch (error) {
      setResults([])
      setSearchState("error")
      setErrorMessage(
        error instanceof Error ? error.message : "Pencarian pengguna gagal."
      )
    }
  }

  const handlePromote = useCallback(
    async (id: string) => {
      setPromotingId(id)
      setActionError("")

      try {
        const response = await fetch(
          `/api/admin/users/${encodeURIComponent(id)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "ADMIN" }),
          }
        )
        const result = (await response.json()) as {
          message?: string
          user?: AdminUser
        }

        if (!response.ok) {
          throw new Error(result.message || "Pengguna gagal dijadikan admin.")
        }

        setResults((current) =>
          current.map((item) =>
            item.id === id ? { ...item, isAdmin: true } : item
          )
        )
        router.refresh()
      } catch (error) {
        setActionError(
          error instanceof Error
            ? error.message
            : "Pengguna gagal dijadikan admin."
        )
      } finally {
        setPromotingId(null)
      }
    },
    [router]
  )

  const adminColumns = useMemo<ColumnDef<DataGridFeatures, AdminUser>[]>(() => {
    if (isMobile) {
      return [
        {
          id: "name",
          accessorKey: "name",
          header: "Admin",
          cell: ({ row }) => (
            <div className="space-y-2 py-1">
              <UserCell user={row.original} />
              <p className="text-xs text-muted-foreground">
                Terdaftar {row.original.createdAt}
              </p>
            </div>
          ),
          size: 280,
          meta: { cellClassName: "whitespace-normal" },
          enableResizing: false,
        },
      ]
    }

    return [
      {
        accessorKey: "name",
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Pengguna" column={column} />
        ),
        cell: ({ row }) => <UserCell user={row.original} />,
        size: 280,
        meta: { fillWidth: true },
      },
      {
        accessorKey: "email",
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        cell: ({ row }) => (
          <span className="block max-w-72 truncate">{row.original.email}</span>
        ),
        size: 280,
      },
      {
        accessorKey: "createdAtIso",
        id: "createdAtIso",
        header: ({ column }) => (
          <DataGridColumnHeader title="Terdaftar" column={column} />
        ),
        cell: ({ row }) => row.original.createdAt,
        sortingFn: "datetime",
        size: 190,
      },
    ]
  }, [isMobile])

  const resultColumns = useMemo<
    ColumnDef<DataGridFeatures, SearchUser>[]
  >(() => {
    if (isMobile) {
      return [
        {
          id: "name",
          accessorKey: "name",
          header: "Pengguna",
          cell: ({ row }) => (
            <div className="space-y-3 py-1">
              <UserCell user={row.original} />
              <ResultAction
                item={row.original}
                promoting={promotingId === row.original.id}
                onPromote={handlePromote}
              />
            </div>
          ),
          size: 280,
          meta: { cellClassName: "whitespace-normal" },
          enableResizing: false,
        },
      ]
    }

    return [
      {
        accessorKey: "name",
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader title="Pengguna" column={column} />
        ),
        cell: ({ row }) => <UserCell user={row.original} />,
        size: 280,
        meta: { fillWidth: true },
      },
      {
        accessorKey: "email",
        id: "email",
        header: ({ column }) => (
          <DataGridColumnHeader title="Email" column={column} />
        ),
        cell: ({ row }) => (
          <span className="block max-w-64 truncate">{row.original.email}</span>
        ),
        size: 240,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <ResultAction
              item={row.original}
              promoting={promotingId === row.original.id}
              onPromote={handlePromote}
            />
          </div>
        ),
        size: 150,
        enableSorting: false,
        enableResizing: false,
      },
    ]
  }, [handlePromote, isMobile, promotingId])

  const adminTable = useTable({
    features: dataGridFeatures,
    columns: adminColumns,
    data: admins,
    pageCount: Math.ceil(admins.length / adminRowsPerPage),
    getRowId: (row: AdminUser) => row.id,
    state: {
      pagination: {
        pageIndex: adminPageIndex,
        pageSize: adminRowsPerPage,
      },
      sorting: adminSorting,
    },
    onPaginationChange: (updater) =>
      setAdminPagination((current) => {
        const next =
          typeof updater === "function"
            ? updater({ ...current, pageSize: adminRowsPerPage })
            : updater
        return { pageIndex: next.pageIndex, pageSize: adminRowsPerPage }
      }),
    onSortingChange: setAdminSorting,
    autoResetPageIndex: true,
  })

  const resultTable = useTable({
    features: dataGridFeatures,
    columns: resultColumns,
    data: results,
    pageCount: 1,
    getRowId: (row: SearchUser) => row.id,
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: Math.max(results.length, 1),
      },
    },
  })

  const gridI18n = {
    labels: {
      sortAscending: "Urutkan naik",
      sortDescending: "Urutkan turun",
      empty: "Tidak ada data",
      rowsPerPage: "Baris per halaman",
      paginationInfo: ({
        from,
        to,
        count,
      }: {
        from: number
        to: number
        count: number
      }) => `${from}–${to} dari ${count}`,
      previousPage: "Halaman sebelumnya",
      nextPage: "Halaman berikutnya",
      goToPage: (page: number) => `Ke halaman ${page}`,
    },
  }

  return (
    <AdminShell page="Pengguna">
      <div className="flex min-w-0 flex-1 flex-col gap-6 p-3 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Pengguna
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Kelola akun yang memiliki akses admin ke panel masjid.
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
            Tambah admin
          </Button>
        </div>

        <DataGrid
          table={adminTable}
          recordCount={admins.length}
          emptyMessage="Belum ada admin."
          i18n={gridI18n}
          tableLayout={{
            dense: true,
            headerBackground: true,
            columnsResizable: !isMobile,
          }}
          tableClassNames={{
            base: isMobile ? "w-full min-w-0 table-fixed" : "min-w-[760px]",
          }}
        >
          <Card className="min-w-0 gap-0 py-0">
            <CardHeader className="border-b px-3 py-3 sm:px-4">
              <CardTitle>Admin</CardTitle>
              <CardDescription>
                {admins.length} akun memiliki akses admin.
              </CardDescription>
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
            {!isMobile && admins.length > 0 && (
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

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tambah admin</DialogTitle>
            <DialogDescription>
              Cari pengguna berdasarkan email, lalu jadikan admin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <InputGroup className="min-w-0 flex-1">
              <InputGroupAddon align="inline-start">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                type="text"
                name="email"
                inputMode="email"
                spellCheck={false}
                aria-label="Email pengguna"
                placeholder="nama@email.com"
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </InputGroup>
            <Button
              type="submit"
              variant="outline"
              disabled={searchState === "loading"}
            >
              Cari
            </Button>
          </form>

          <div aria-live="polite" className="min-h-28">
            {searchState === "loading" && (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            )}

            {searchState === "error" && (
              <p role="alert" className="text-sm text-destructive">
                {errorMessage}
              </p>
            )}

            {searchState === "done" && results.length === 0 && (
              <Empty className="border-0 p-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle>Pengguna tidak ditemukan</EmptyTitle>
                  <EmptyDescription>
                    Tidak ada akun dengan email tersebut.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

            {searchState === "done" && results.length > 0 && (
              <DataGrid
                table={resultTable}
                recordCount={results.length}
                i18n={gridI18n}
                tableLayout={{
                  dense: true,
                  headerBackground: true,
                  columnsResizable: false,
                }}
                tableClassNames={{
                  base: isMobile
                    ? "w-full min-w-0 table-fixed"
                    : "min-w-[640px]",
                }}
              >
                <Card className="min-w-0 gap-0 py-0">
                  <CardContent className="p-0">
                    <DataGridContainer>
                      <DataGridScrollArea
                        orientation={isMobile ? "vertical" : "both"}
                      >
                        <DataGridTable />
                      </DataGridScrollArea>
                    </DataGridContainer>
                  </CardContent>
                </Card>
              </DataGrid>
            )}
          </div>

          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}

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
