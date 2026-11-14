"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

const slides = [
  {
    src: "/hero/masjid-2.jpeg",
    alt: "Tampak depan Masjid Ulul Albab UNNES",
  },
  {
    src: "/hero/masjid-5.jpeg",
    alt: "Jamaah menuju Masjid Ulul Albab UNNES",
  },
  {
    src: "/hero/masijd-4.jpg",
    alt: "Suasana malam di Masjid Ulul Albab UNNES",
  },
  {
    src: "/hero/masjid-1.png",
    alt: "Papan nama Masjid Jami' Ulul Albab UNNES",
  },
  {
    src: "/hero/masjid-3.jpg",
    alt: "Jamaah shalat berjamaah di dalam masjid",
  },
]

const AUTOPLAY_MS = 5000

export function HeroSlideshow() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(
      () => setIndex((current) => (current + 1) % slides.length),
      AUTOPLAY_MS,
    )
    return () => clearInterval(timer)
  }, [paused])

  return (
    <div
      className="relative h-full w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-full w-full overflow-hidden rounded-xl border bg-muted">
        <AnimatePresence initial={false}>
          <motion.div
            key={slides[index].src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[index].src}
              alt={slides[index].alt}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Tampilkan foto ${slideIndex + 1}`}
              aria-current={slideIndex === index}
              onClick={() => setIndex(slideIndex)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                slideIndex === index
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/60 hover:bg-white",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
