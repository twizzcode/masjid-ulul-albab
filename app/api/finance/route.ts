import { currentFinanceMonth, isFinanceMonth } from "@/lib/finance"
import { getFinanceReport } from "@/lib/finance-data"

export async function GET(request: Request) {
  const requestedMonth = new URL(request.url).searchParams.get("month")
  const month = requestedMonth ?? currentFinanceMonth()
  if (!isFinanceMonth(month)) {
    return Response.json({ message: "Periode tidak valid." }, { status: 400 })
  }

  try {
    return Response.json({ report: await getFinanceReport(month) })
  } catch (error) {
    console.error("Gagal membaca laporan keuangan", error)
    return Response.json(
      { message: "Laporan keuangan gagal dimuat." },
      { status: 500 }
    )
  }
}
