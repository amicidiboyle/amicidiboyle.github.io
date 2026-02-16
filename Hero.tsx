"use client"

import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"

export function Hero() {
  const cardRef = useRef<HTMLDivElement>(null)
  const pixelGridRef = useRef<HTMLDivElement>(null)
  const customCursorRef = useRef<HTMLDivElement>(null)
  const hotspotRef = useRef<HTMLDivElement>(null)
  const [showCustomCursor, setShowCustomCursor] = useState(false)

  // Custom cursor only on the CTA area (desktop only)
  useEffect(() => {
    const hotspot = hotspotRef.current
    const cursor = customCursorRef.current
    if (!hotspot || !cursor) return

    const isCoarse = window.matchMedia("(pointer: coarse)").matches
    if (isCoarse) return // no custom cursor on touch devices

    const onMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX - 14,
        y: e.clientY - 14,
        duration: 0.25,
        ease: "power2.out",
      })
    }

    const onEnter = () => setShowCustomCursor(true)
    const onLeave = () => setShowCustomCursor(false)

    hotspot.addEventListener("mouseenter", onEnter)
    hotspot.addEventListener("mouseleave", onLeave)
    hotspot.addEventListener("mousemove", onMove)

    return () => {
      hotspot.removeEventListener("mouseenter", onEnter)
      hotspot.removeEventListener("mouseleave", onLeave)
      hotspot.removeEventListener("mousemove", onMove)
    }
  }, [])

  // Pixel shimmer on card mouse-leave (ocean colors)
  const handleCardMouseLeave = () => {
    if (!cardRef.current || !pixelGridRef.current) return

    const gridSize = 4
    const pixelSize = 100 / gridSize
    pixelGridRef.current.innerHTML = ""

    const totalPixels = gridSize * gridSize
    const clearIndices = new Set<number>()
    while (clearIndices.size < 3) clearIndices.add(Math.floor(Math.random() * totalPixels))

    let pixelIndex = 0
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (clearIndices.has(pixelIndex)) {
          pixelIndex++
          continue
        }

        const pixel = document.createElement("div")
        const isCyan = Math.random() < 0.55 // more cyan than deep

        const normalizedPosition = (col + (gridSize - 1 - row)) / ((gridSize - 1) * 2)
        const targetOpacity = 0.35 + normalizedPosition * 0.55

        pixel.className = `absolute ${isCyan ? "bg-cyan-400/80" : "bg-sky-950/80"}`
        pixel.style.width = `${pixelSize}%`
        pixel.style.height = `${pixelSize}%`
        pixel.style.left = `${col * pixelSize}%`
        pixel.style.top = `${row * pixelSize}%`
        pixel.style.opacity = "0"
        pixel.style.display = "block"
        pixel.setAttribute("data-target-opacity", targetOpacity.toString())
        pixelGridRef.current.appendChild(pixel)

        pixelIndex++
      }
    }

    const pixels = Array.from(pixelGridRef.current.children)
    const animationStepDuration = 0.45
    const actualPixelCount = pixels.length
    const staggerDuration = animationStepDuration / Math.max(1, actualPixelCount)

    const tl = gsap.timeline()

    tl.to(cardRef.current, { scale: 0.995, duration: 0.18, ease: "power2.in" })

    tl.to(
      pixels,
      {
        opacity: (_, target) => (target as HTMLElement).getAttribute("data-target-opacity") || "1",
        duration: 0.45,
        ease: "power2.in",
        stagger: { each: staggerDuration, from: "random" },
      },
      "<",
    )

    tl.to(pixels, { opacity: 0, duration: 0.28, ease: "power2.out" }, `+=${animationStepDuration}`)

    tl.to(cardRef.current, { scale: 1, duration: 0.28, ease: "power2.in" }, "<")

    tl.set(pixels, { display: "none" })
  }

  return (
    <section className="p-[1.5%] bg-zinc-950">
      {/* Mask definition */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <mask id="heroMask" maskContentUnits="objectBoundingBox">
            <rect width="1" height="1" fill="black" />
            <path
              d="M0 0.1474 V0.9863 C0 0.9938 0.0038 0.9996 0.0085 0.9996 H0.9912 C0.9958 0.9996 1 0.9863 1 0.9863 V0.0581 C1 0.0506 0.9958 0.0444 0.9912 0.0444 H0.9255 C0.9208 0.0444 0.9165 0.0383 0.9165 0.0307 V0.0149 C0.9165 0.0074 0.9132 0.0013 0.9084 0.0013 L0.2060 0.0000 C0.2012 -0.0000 0.1975 0.0061 0.1975 0.0137 V0.0312 C0.1975 0.0387 0.1936 0.0448 0.1889 0.0448 H0.0915 C0.0868 0.0448 0.0830 0.0510 0.0830 0.0585 V0.1201 C0.0830 0.1276 0.0792 0.1337 0.0745 0.1337 H0.0085 C0.0038 0.1337 0 0.1399 0 0.1474 Z"
              fill="white"
            />
          </mask>
        </defs>
      </svg>

      <div className="relative isolate w-full min-h-[calc(100svh-3vh)]">
        {/* Masked scene */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ mask: "url(#heroMask)", WebkitMask: "url(#heroMask)" }}
        >
          {/* Your ocean video: put a local file in /public and change src accordingly */}
          <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover">
            {/* BEST: /ocean.mp4 in public/ */}
            <source src="/ocean.mp4" type="video/mp4" />
          </video>

          {/* Color grading + ocean overlays */}
          <div className="pointer-events-none absolute inset-0">
            {/* Top-to-bottom depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-transparent to-sky-950/60" />
            {/* Left shadow for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-950/70 via-sky-950/25 to-transparent" />
            {/* Glow (surface light) */}
            <div className="absolute inset-0 [background:radial-gradient(80%_55%_at_35%_15%,rgba(34,211,238,.25)_0%,transparent_60%)]" />
            {/* Subtle particles overlay */}
            <div className="absolute inset-0 ocean-particles opacity-70" />
            {/* Light beams overlay */}
            <div className="absolute inset-0 ocean-beams opacity-60" />
          </div>

          {/* Content card */}
          <div className="absolute bottom-6 left-6 right-6 max-w-[min(52rem,92vw)] md:bottom-8 md:left-8 z-10">
            <div
              ref={hotspotRef}
              className="inline-block"
            >
              <div
                ref={cardRef}
                onMouseLeave={handleCardMouseLeave}
                className="relative overflow-hidden backdrop-blur-md bg-white/6 border border-white/12 rounded-2xl p-6 md:p-8 transition-transform duration-500 ease-in hover:scale-[1.01]"
              >
                <div ref={pixelGridRef} className="absolute inset-0 pointer-events-none z-10" />

                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80 shadow-[0_0_18px_rgba(34,211,238,.75)]" />
                  Diving & Hyperbaric Medicine · Research & Education
                </div>

                <h1 className="mt-4 text-balance text-3xl/tight sm:text-4xl/tight md:text-5xl/tight tracking-tight text-cyan-50">
                  Gli Amici di Boyle
                </h1>

                <p className="mt-3 text-sm/6 sm:text-base/7 text-cyan-50/80 max-w-prose">
                  Human Performance & Safety in Extreme Environments. Scienza applicata: verificabile, replicabile, utile.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="#ricerca"
                    className="inline-flex items-center rounded-full border border-cyan-300/35 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-50 backdrop-blur hover:bg-cyan-400/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    Esplora la Ricerca
                  </Link>

                  <Link
                    href="#formazione"
                    className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                  >
                    Formazione
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom cursor */}
        <div
          ref={customCursorRef}
          className={`fixed h-[28px] w-[28px] rounded-full bg-cyan-300/80 pointer-events-none z-50 transition-opacity duration-200 ${
            showCustomCursor ? "opacity-100" : "opacity-0"
          }`}
          style={{ left: 0, top: 0, boxShadow: "0 0 26px rgba(34,211,238,.55)" }}
        />
      </div>
    </section>
  )
}
