"use client"

import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function AdminAspirasiError({ reset }: { reset: () => void }) {
  return (
    <AdminShell page="Aspirasi">
      <div className="flex flex-1 items-center justify-center p-3 sm:p-5 lg:p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Aspirasi gagal dimuat</CardTitle>
            <CardDescription>
              Data belum dapat diambil dari database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={reset}>Coba lagi</Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  )
}
