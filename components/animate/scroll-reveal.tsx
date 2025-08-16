"use client"

import type * as React from "react"
import { motion } from "framer-motion"
import { memo, useMemo } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  distance?: number
  duration?: number
  once?: boolean
}

const createVariants = (direction: string, distance: number) => {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, opacity: 0 }
      case "down":
        return { y: -distance, opacity: 0 }
      case "left":
        return { x: distance, opacity: 0 }
      case "right":
        return { x: -distance, opacity: 0 }
      default:
        return { y: distance, opacity: 0 }
    }
  }

  const getFinalPosition = () => {
    switch (direction) {
      case "up":
      case "down":
        return { y: 0, opacity: 1 }
      case "left":
      case "right":
        return { x: 0, opacity: 1 }
      default:
        return { y: 0, opacity: 1 }
    }
  }

  return {
    initial: getInitialPosition(),
    animate: getFinalPosition(),
  }
}

const EASING_CURVES = {
  smooth: [0.25, 0.25, 0.25, 0.75] as const,
  easeOut: "easeOut" as const,
} as const

export const ScrollReveal = memo(function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 50,
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  const variants = useMemo(() => createVariants(direction, distance), [direction, distance])

  const transition = useMemo(
    () => ({
      duration,
      delay,
      ease: EASING_CURVES.smooth,
    }),
    [duration, delay],
  )

  return (
    <motion.div
      className={cn(className)}
      initial={variants.initial}
      whileInView={variants.animate}
      viewport={{ once, margin: "-100px" }}
      transition={transition}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  )
})

interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  once?: boolean
}

export const FadeIn = memo(function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.6,
  once = true,
}: FadeInProps) {
  const transition = useMemo(
    () => ({
      duration,
      delay,
      ease: EASING_CURVES.easeOut,
    }),
    [duration, delay],
  )

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once }}
      transition={transition}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  )
})

interface SlideInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "left" | "right"
  distance?: number
  duration?: number
  once?: boolean
}

export const SlideIn = memo(function SlideIn({
  children,
  className,
  delay = 0,
  direction = "left",
  distance = 100,
  duration = 0.6,
  once = true,
}: SlideInProps) {
  const variants = useMemo(
    () => ({
      initial: {
        x: direction === "left" ? -distance : distance,
        opacity: 0,
      },
      animate: {
        x: 0,
        opacity: 1,
      },
    }),
    [direction, distance],
  )

  const transition = useMemo(
    () => ({
      duration,
      delay,
      ease: EASING_CURVES.smooth,
    }),
    [duration, delay],
  )

  return (
    <motion.div
      className={cn(className)}
      initial={variants.initial}
      whileInView={variants.animate}
      viewport={{ once }}
      transition={transition}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  )
})

interface ScaleInProps {
  children: React.ReactNode
  className?: string
  delay?: number
  scale?: number
  duration?: number
  once?: boolean
}

export const ScaleIn = memo(function ScaleIn({
  children,
  className,
  delay = 0,
  scale = 0.8,
  duration = 0.6,
  once = true,
}: ScaleInProps) {
  const variants = useMemo(
    () => ({
      initial: {
        scale,
        opacity: 0,
      },
      animate: {
        scale: 1,
        opacity: 1,
      },
    }),
    [scale],
  )

  const transition = useMemo(
    () => ({
      duration,
      delay,
      ease: EASING_CURVES.smooth,
    }),
    [duration, delay],
  )

  return (
    <motion.div
      className={cn(className)}
      initial={variants.initial}
      whileInView={variants.animate}
      viewport={{ once }}
      transition={transition}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  )
})
