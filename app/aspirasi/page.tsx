import type { Metadata } from "next"

import { AspirationForm } from "@/components/aspiration-form"

export const metadata: Metadata = {
  title: "Kotak Aspirasi — Masjid Jami' Ulul Albab UNNES",
  description:
    "Sampaikan saran, kritik, dan masukan untuk Masjid Jami' Ulul Albab UNNES.",
}

export default function AspirationPage() {
  return (
    <div className="container mx-auto flex w-full justify-center px-4 pt-28 pb-24 sm:px-6 sm:pt-32">
      <AspirationForm />
    </div>
  )
}
