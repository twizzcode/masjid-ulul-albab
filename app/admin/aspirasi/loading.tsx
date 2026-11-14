import { AdminShell } from "@/components/admin-shell"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminAspirasiLoading() {
  return (
    <AdminShell page="Aspirasi">
      <div className="flex min-w-0 flex-1 flex-col gap-6 p-3 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <Card className="gap-0 py-0">
          <CardHeader className="border-b">
            <Skeleton className="h-8 w-full sm:w-72" />
          </CardHeader>
          <CardContent className="flex flex-col gap-3 py-4">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
