"use client"

import type React from "react"

import { useRef, useCallback, useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"

export function useParallax(intensity = 10) {
  const ref = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const prefersReduced = useReducedMotion()

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (!ref.current || prefersReduced) return

      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height

      setOffset({
        x: x * intensity,
        y: y * intensity,
      })
    },
    [intensity, prefersReduced],
  )

  const styleFor = useCallback(
    (multiplier = 1) => ({
      transform: prefersReduced ? "none" : `translate3d(${offset.x * multiplier}px, ${offset.y * multiplier}px, 0)`,
      transition: "transform 0.3s ease-out",
    }),
    [offset, prefersReduced],
  )

  return { ref, onMove, styleFor, offset }
}

export function useInViewOnce(threshold = 0.1) {
  const [entered, setEntered] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || entered) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, entered])

  return { ref, entered }
}
