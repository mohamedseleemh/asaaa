"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface LoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  skeleton?: React.ReactNode
  delay?: number
  minDuration?: number
  className?: string
}

export function LoadingState({
  isLoading,
  children,
  skeleton,
  delay = 0,
  minDuration = 500,
  className,
}: LoadingStateProps) {
  const [showLoading, setShowLoading] = useState(false)
  const [showContent, setShowContent] = useState(!isLoading)

  useEffect(() => {
    let delayTimer: NodeJS.Timeout
    let minDurationTimer: NodeJS.Timeout

    if (isLoading) {
      setShowContent(false)

      if (delay > 0) {
        delayTimer = setTimeout(() => {
          setShowLoading(true)
        }, delay)
      } else {
        setShowLoading(true)
      }
    } else {
      setShowLoading(false)

      if (minDuration > 0) {
        minDurationTimer = setTimeout(() => {
          setShowContent(true)
        }, minDuration)
      } else {
        setShowContent(true)
      }
    }

    return () => {
      clearTimeout(delayTimer)
      clearTimeout(minDurationTimer)
    }
  }, [isLoading, delay, minDuration])

  if (showLoading) {
    return <div className={cn("animate-pulse", className)}>{skeleton || <DefaultSkeleton />}</div>
  }

  if (showContent) {
    return <div className={cn("animate-fade-in-up", className)}>{children}</div>
  }

  return null
}

function DefaultSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex space-x-2 space-x-reverse">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 space-x-reverse">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
