"use client"

import { useLayoutEffect, useRef, type ReactNode } from "react"
import { usePathname } from "next/navigation"

export function ScrollReveal({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const directChildren = Array.from(root.children).filter(
      (element): element is HTMLElement => element instanceof HTMLElement
    )
    const targets = (
      directChildren.length === 1
        ? Array.from(directChildren[0].children)
        : directChildren
    ).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        !element.hasAttribute("data-no-reveal")
    )

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target as HTMLElement
          element.dataset.scrollReveal = "visible"
          observer.unobserve(element)
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8%" }
    )

    for (const element of targets) {
      if (element.getBoundingClientRect().top > window.innerHeight * 0.9) {
        element.dataset.scrollReveal = "pending"
        observer.observe(element)
      }
    }

    return () => {
      observer.disconnect()
      for (const element of targets) delete element.dataset.scrollReveal
    }
  }, [pathname])

  return (
    <div ref={rootRef} className="contents">
      {children}
    </div>
  )
}
