"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  breakpoints?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
    "2xl"?: number
  }
  adaptive?: boolean
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

export function ResponsiveContainer({
  children,
  className,
  breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    "2xl": 1536,
  },
  adaptive = true,
  maxWidth = "xl",
}: ResponsiveContainerProps) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>("sm")
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  const updateBreakpoint = useCallback(() => {
    const width = window.innerWidth

    if (width >= breakpoints["2xl"]!) {
      setCurrentBreakpoint("2xl")
    } else if (width >= breakpoints.xl!) {
      setCurrentBreakpoint("xl")
    } else if (width >= breakpoints.lg!) {
      setCurrentBreakpoint("lg")
    } else if (width >= breakpoints.md!) {
      setCurrentBreakpoint("md")
    } else {
      setCurrentBreakpoint("sm")
    }
  }, [breakpoints])

  const updateContainerWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  useEffect(() => {
    updateBreakpoint()
    updateContainerWidth()

    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        updateBreakpoint()
        updateContainerWidth()
      })

      if (containerRef.current) {
        resizeObserverRef.current.observe(containerRef.current)
      }
    }

    // Fallback for older browsers
    const handleResize = () => {
      updateBreakpoint()
      updateContainerWidth()
    }

    window.addEventListener("resize", handleResize, { passive: true })

    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
  }, [updateBreakpoint, updateContainerWidth])

  const getResponsiveClasses = () => {
    const baseClasses = "w-full mx-auto"

    // Mobile-first padding
    let paddingClasses = "px-4 sm:px-6"

    // Max width based on prop and current breakpoint
    let maxWidthClasses = ""

    switch (maxWidth) {
      case "sm":
        maxWidthClasses = "max-w-sm"
        break
      case "md":
        maxWidthClasses = "max-w-md sm:max-w-2xl"
        break
      case "lg":
        maxWidthClasses = "max-w-lg sm:max-w-2xl lg:max-w-4xl"
        break
      case "xl":
        maxWidthClasses = "max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
        break
      case "2xl":
        maxWidthClasses = "max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl"
        break
      case "full":
        maxWidthClasses = "max-w-full"
        break
      default:
        maxWidthClasses = "max-w-xl sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl"
    }

    // Enhanced padding for larger screens
    switch (currentBreakpoint) {
      case "2xl":
        paddingClasses = "px-4 sm:px-6 lg:px-8 xl:px-12"
        break
      case "xl":
        paddingClasses = "px-4 sm:px-6 lg:px-8"
        break
      case "lg":
        paddingClasses = "px-4 sm:px-6 lg:px-8"
        break
      case "md":
        paddingClasses = "px-4 sm:px-6"
        break
      default:
        paddingClasses = "px-4"
    }

    return `${baseClasses} ${maxWidthClasses} ${paddingClasses}`
  }

  const getAdaptiveStyles = () => {
    if (!adaptive) return {}

    const baseSize = 16
    const minScale = 0.875 // 14px minimum
    const maxScale = 1.125 // 18px maximum
    const scaleFactor = Math.min(maxScale, Math.max(minScale, containerWidth / 1200))

    return {
      fontSize: `${baseSize * scaleFactor}px`,
      lineHeight: 1.6,
      // Better text rendering
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(getResponsiveClasses(), className)}
      style={getAdaptiveStyles()}
      data-breakpoint={currentBreakpoint}
      data-container-width={containerWidth}
      data-max-width={maxWidth}
    >
      {children}
    </div>
  )
}
