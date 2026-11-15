import type { Metadata } from "next"

import { AdminKeuangan } from "@/components/admin-keuangan"
import { currentFinanceMonth } from "@/lib/finance"
import { getFinanceReport } from "@/lib/finance-data"

export const metadata: Metadata = {
  title: "Keuangan",
  description: "Kelola catatan dan laporan keuangan masjid.",
}

export default async function AdminKeuanganPage() {
  const report = await getFinanceReport(currentFinanceMonth())
  return <AdminKeuangan initialReport={report} />
}
