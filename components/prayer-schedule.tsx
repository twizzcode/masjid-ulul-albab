"use client"

import {
  IconMoon,
  IconMoonStars,
  IconSun,
  IconSunrise,
  IconSunset2,
} from "@tabler/icons-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

export type PrayerItem = {
  name: "Subuh" | "Dzuhur" | "Ashar" | "Maghrib" | "Isya"
  time: string
}

const ICONS: Record<PrayerItem["name"], typeof IconSun> = {
  Subuh: IconSunrise,
  Dzuhur: IconSun,
  Ashar: IconSunset2,
  Maghrib: IconMoonStars,
  Isya: IconMoon,
}

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

function secondsOfDay(date: Date) {
  const [hour, minute, second] = clockFormat.format(date).split(":").map(Number)
  return hour * 3600 + minute * 60 + second
}

function toSeconds(time: string) {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 3600 + minute * 60
}

function formatCountdown(total: number) {
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":")
}

type PrayerScheduleProps = {
  prayers: PrayerItem[]
  imsak: string
  syuruq: string
}

export function PrayerSchedule({
  prayers,
  imsak,
  syuruq,
}: PrayerScheduleProps) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const update = () => setNow(new Date())
    const initial = window.setTimeout(update, 0)
    const timer = window.setInterval(update, 1000)
    return () => {
      window.clearTimeout(initial)
      window.clearInterval(timer)
    }
  }, [])

  const currentSeconds = now ? secondsOfDay(now) : null

  let nextIndex = -1
  let countdown = 0

  if (currentSeconds !== null) {
    nextIndex = prayers.findIndex(
      (prayer) => toSeconds(prayer.time) > currentSeconds
    )

    if (nextIndex === -1) {
      nextIndex = 0
      countdown = 86400 - currentSeconds + toSeconds(prayers[0].time)
    } else {
      countdown = toSeconds(prayers[nextIndex].time) - currentSeconds
    }
  }

  const nextPrayer = nextIndex >= 0 ? prayers[nextIndex] : null

  return (
    <div className="mt-10">
      <div className="flex flex-col overflow-hidden rounded-2xl border bg-background sm:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-6 text-center">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Sekarang
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tracking-tight tabular-nums">
            {now ? clockFormat.format(now) : "--:--:--"}
          </p>
          <p className="text-xs text-muted-foreground">WIB</p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center border-t px-6 py-6 text-center sm:border-t-0 sm:border-l">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Berikutnya
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight">
            {nextPrayer ? nextPrayer.name : "—"}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {now && nextPrayer
              ? `${nextPrayer.time} · dalam ${formatCountdown(countdown)}`
              : "menghitung…"}
          </p>
        </div>

        <div className="grid flex-1 grid-cols-2 items-center border-t px-6 py-6 text-center sm:border-t-0 sm:border-l">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Imsak
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
              {imsak}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Terbit
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
              {syuruq}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {prayers.map((prayer, index) => {
          const Icon = ICONS[prayer.name]
          const isNext = index === nextIndex

          return (
            <div
              key={prayer.name}
              className={cn(
                "flex flex-col gap-4 rounded-xl border bg-background p-5 transition-colors",
                isNext && "border-blue-500/40 bg-blue-50/60 dark:bg-blue-950/20"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground",
                    isNext && "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {isNext ? (
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Berikutnya
                  </span>
                ) : null}
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {prayer.name}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                  {prayer.time}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
