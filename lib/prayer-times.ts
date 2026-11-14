const GUNUNG_PATI = {
  latitude: -7.0747,
  longitude: 110.389,
  city: "Gunung Pati",
  region: "Kota Semarang",
}

// Metode 20 = Kementerian Agama Republik Indonesia (Subuh 20°, Isya 18°).
const KEMENAG_METHOD = 20

export type PrayerTimes = {
  imsak: string
  subuh: string
  syuruq: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
  dateLabel: string
  hijriLabel: string
  locationLabel: string
  isFallback: boolean
}

type AladhanResponse = {
  code: number
  status: string
  data: {
    timings: Record<string, string>
    date: {
      readable: string
      gregorian: { date: string }
      hijri: {
        day: string
        year: string
        month: { number: number; en: string }
      }
    }
  }
}

const FALLBACK: Omit<PrayerTimes, "isFallback"> = {
  imsak: "03:40",
  subuh: "03:50",
  syuruq: "05:07",
  dzuhur: "11:26",
  ashar: "14:46",
  maghrib: "17:38",
  isya: "18:51",
  dateLabel: "",
  hijriLabel: "",
  locationLabel: `${GUNUNG_PATI.city}, ${GUNUNG_PATI.region}`,
}

function todayInJakarta() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date())

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return `${value("day")}-${value("month")}-${value("year")}`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Syaban",
  "Ramadhan",
  "Syawal",
  "Dzulqadah",
  "Dzulhijjah",
]

function formatHijri(hijri: AladhanResponse["data"]["date"]["hijri"]) {
  const month = HIJRI_MONTHS[hijri.month.number - 1] ?? hijri.month.en
  return `${hijri.day} ${month} ${hijri.year} H`
}

function clock(value: string | undefined, fallback: string) {
  if (!value) return fallback
  const match = value.match(/^\d{1,2}:\d{2}/)
  return match ? match[0].padStart(5, "0") : fallback
}

export async function getPrayerTimes(): Promise<PrayerTimes> {
  const url = new URL(
    `https://api.aladhan.com/v1/timings/${todayInJakarta()}`,
  )
  url.searchParams.set("latitude", String(GUNUNG_PATI.latitude))
  url.searchParams.set("longitude", String(GUNUNG_PATI.longitude))
  url.searchParams.set("method", String(KEMENAG_METHOD))

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
      headers: { accept: "application/json" },
    })

    if (!response.ok) throw new Error(`Aladhan ${response.status}`)

    const payload = (await response.json()) as AladhanResponse
    if (payload.code !== 200) throw new Error(`Aladhan code ${payload.code}`)

    const { timings, date } = payload.data

    return {
      imsak: clock(timings.Imsak, FALLBACK.imsak),
      subuh: clock(timings.Fajr, FALLBACK.subuh),
      syuruq: clock(timings.Sunrise, FALLBACK.syuruq),
      dzuhur: clock(timings.Dhuhr, FALLBACK.dzuhur),
      ashar: clock(timings.Asr, FALLBACK.ashar),
      maghrib: clock(timings.Maghrib, FALLBACK.maghrib),
      isya: clock(timings.Isha, FALLBACK.isya),
      dateLabel: formatDate(new Date()),
      hijriLabel: formatHijri(date.hijri),
      locationLabel: `${GUNUNG_PATI.city}, ${GUNUNG_PATI.region}`,
      isFallback: false,
    }
  } catch {
    return {
      ...FALLBACK,
      dateLabel: formatDate(new Date()),
      hijriLabel: "",
      isFallback: true,
    }
  }
}
