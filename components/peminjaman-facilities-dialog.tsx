"use client"

import {
  IconAirConditioning,
  IconBuilding,
  IconBuildingMosque,
  IconChalkboard,
  IconCheck,
  IconDesk,
  IconDeviceProjector,
  IconHeartHandshake,
  IconLayoutBoard,
  IconListDetails,
  IconMicrophone2,
  IconPresentation,
  IconSofa,
  IconWind,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const ROOM_FACILITIES = [
  {
    name: "Aula Masjid Lantai 1",
    description: "Ruang utama untuk kajian, seminar, dan kegiatan jamaah.",
    icon: IconBuildingMosque,
    items: [
      { label: "AC", detail: "4 unit", icon: IconAirConditioning },
      { label: "Proyektor dan layar", icon: IconDeviceProjector },
      { label: "Hijab (pembatas)", icon: IconLayoutBoard },
      { label: "Meja kecil", icon: IconDesk },
      { label: "Sound system", detail: "2 mic", icon: IconMicrophone2 },
    ],
  },
  {
    name: "Ruang Solat Lantai 2",
    description: "Ruang ibadah dan kegiatan dengan suasana lebih tenang.",
    icon: IconBuilding,
    items: [
      { label: "Sound system", detail: "2 mic", icon: IconMicrophone2 },
      { label: "Sofa", detail: "4 unit", icon: IconSofa },
      { label: "Panggung", detail: "4 unit", icon: IconPresentation },
      { label: "Meja kecil", icon: IconDesk },
      { label: "Papan tulis", icon: IconChalkboard },
      { label: "Hijab (pembatas)", icon: IconLayoutBoard },
      { label: "Kipas angin", icon: IconWind },
    ],
  },
] as const

export function PeminjamanFacilitiesDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="h-9 w-full rounded-md border-input bg-gradient-to-b from-white to-neutral-100 px-5 font-bold text-neutral-900 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.9)_inset] transition duration-200 hover:-translate-y-0.5 hover:from-white hover:to-neutral-200 sm:w-auto dark:from-neutral-800 dark:to-neutral-950 dark:text-white dark:shadow-[0px_2px_0px_0px_rgba(255,255,255,0.12)_inset] dark:hover:from-neutral-800 dark:hover:to-black"
          />
        }
      >
        <IconListDetails aria-hidden className="size-4" />
        Lihat fasilitas
      </DialogTrigger>

      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-muted/40 px-6 py-5 pr-12">
          <DialogTitle className="text-lg">Fasilitas ruang</DialogTitle>
          <DialogDescription>
            Fasilitas berikut dapat digunakan selama kegiatan. Sampaikan
            kebutuhan tambahan saat konfirmasi dengan pengurus.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65svh] overflow-y-auto p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {ROOM_FACILITIES.map((room) => {
              const RoomIcon = room.icon

              return (
                <Card key={room.name} className="h-full gap-0 py-0">
                  <CardHeader className="border-b px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <RoomIcon className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {room.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 py-3">
                    <ul className="flex flex-col gap-2.5">
                      {room.items.map((item) => {
                        const ItemIcon = item.icon

                        return (
                          <li
                            key={item.label}
                            className="flex items-center gap-2.5 text-sm"
                          >
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <ItemIcon className="size-4" aria-hidden />
                            </span>
                            <span className="flex-1">{item.label}</span>
                            {"detail" in item && item.detail ? (
                              <span className="text-xs text-muted-foreground">
                                {item.detail}
                              </span>
                            ) : null}
                          </li>
                        )
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-4 grid gap-4 rounded-lg border bg-muted/40 p-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                <IconCheck className="size-4" aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-medium">Konfirmasi pengajuan</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Setelah form dikirim, pengurus akan menghubungi narahubung
                  lewat WhatsApp untuk mengonfirmasi jadwal dan kesiapan
                  fasilitas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground">
                <IconHeartHandshake className="size-4" aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-medium">Infaq sukarela</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Peminjaman tidak dipungut biaya. Penyelenggara dan jamaah
                  dipersilakan menyalurkan infaq sukarela untuk perawatan
                  masjid.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
