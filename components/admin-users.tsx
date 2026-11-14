"use client"

import { useState, type FormEvent } from "react"
import {
  Loading03Icon,
  PlusSignIcon,
  Search01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useRouter } from "next/navigation"

import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/reui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

export function AdminUsers({ admins }: { admins: AdminUser[] }) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [searchState, setSearchState] = useState<SearchState>("idle")
  const [results, setResults] = useState<SearchUser[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [actionError, setActionError] = useState("")
  const [promotingId, setPromotingId] = useState<string | null>(null)

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

  async function handlePromote(id: string) {
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

        <Card className="min-w-0 gap-0 py-0">
          <CardHeader className="border-b">
            <CardTitle>Admin</CardTitle>
            <CardDescription>
              {admins.length} akun memiliki akses admin.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {admins.length === 0 ? (
              <Empty className="border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={UserAdd01Icon} strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle>Belum ada admin</EmptyTitle>
                  <EmptyDescription>
                    Tambahkan admin lewat pencarian email.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Pengguna</TableHead>
                    <TableHead>Terdaftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="pl-4">
                        <UserCell user={admin} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {admin.createdAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent>
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

          <div aria-live="polite" className="min-h-24">
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-0">Pengguna</TableHead>
                    <TableHead className="pr-0 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-0">
                        <UserCell user={item} />
                      </TableCell>
                      <TableCell className="pr-0 text-right">
                        {item.isAdmin ? (
                          <Badge variant="success-light">Admin</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={promotingId === item.id}
                            onClick={() => handlePromote(item.id)}
                            aria-label={`Jadikan ${item.email} admin`}
                          >
                            <HugeiconsIcon
                              icon={
                                promotingId === item.id
                                  ? Loading03Icon
                                  : UserAdd01Icon
                              }
                              strokeWidth={2}
                              className={
                                promotingId === item.id
                                  ? "animate-spin motion-reduce:animate-pulse"
                                  : undefined
                              }
                            />
                            Jadikan admin
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
