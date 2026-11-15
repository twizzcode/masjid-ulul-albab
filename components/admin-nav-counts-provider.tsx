"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type AdminNavCounts = {
  waitingBookings: number
  aspirations: number
}

type AdminNavCountsContextValue = AdminNavCounts & {
  /** Perbarui sebagian hitungan tanpa kehilangan nilai lain. */
  setCounts: (counts: Partial<AdminNavCounts>) => void
  /** Baca ulang dari server tanpa mengosongkan badge saat request berjalan. */
  refresh: () => void
}

const AdminNavCountsContext = createContext<AdminNavCountsContextValue | null>(
  null
)

const EMPTY_COUNTS: AdminNavCounts = { waitingBookings: 0, aspirations: 0 }

/** Satu sumber hitungan badge untuk seluruh panel admin. */
export function AdminNavCountsProvider({
  initialCounts,
  children,
}: {
  initialCounts: AdminNavCounts
  children: ReactNode
}) {
  const [counts, setCountsState] = useState(initialCounts)
  const [version, setVersion] = useState(0)
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (version === 0) return

    const controller = new AbortController()
    controllerRef.current = controller

    void fetch("/api/admin/navigation-counts", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return
        setCountsState((await response.json()) as AdminNavCounts)
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Navigation counts failed to load", error)
        }
      })

    return () => controller.abort()
  }, [version])

  useEffect(() => () => controllerRef.current?.abort(), [])

  const refresh = useCallback(() => setVersion((current) => current + 1), [])
  const setCounts = useCallback(
    (next: Partial<AdminNavCounts>) =>
      setCountsState((current) => ({ ...current, ...next })),
    []
  )

  const value = useMemo(
    () => ({ ...counts, setCounts, refresh }),
    [counts, refresh, setCounts]
  )

  return (
    <AdminNavCountsContext.Provider value={value}>
      {children}
    </AdminNavCountsContext.Provider>
  )
}

const FALLBACK_VALUE: AdminNavCountsContextValue = {
  ...EMPTY_COUNTS,
  setCounts: () => {},
  refresh: () => {},
}

export function useAdminNavCounts() {
  return useContext(AdminNavCountsContext) ?? FALLBACK_VALUE
}
