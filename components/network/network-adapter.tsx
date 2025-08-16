"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { cdnOptimizer } from "@/lib/network/cdn-optimizer"

interface NetworkConditions {
  effectiveType: string
  downlink: number
  rtt: number
  saveData: boolean
}

interface AdaptiveSettings {
  imageQuality: number
  enableAnimations: boolean
  preloadImages: boolean
  lazyLoadThreshold: string
}

export function NetworkAdapter({ children }: { children: React.ReactNode }) {
  const [networkConditions, setNetworkConditions] = useState<NetworkConditions | null>(null)
  const [adaptiveSettings, setAdaptiveSettings] = useState<AdaptiveSettings>({
    imageQuality: 85,
    enableAnimations: true,
    preloadImages: true,
    lazyLoadThreshold: "200px",
  })

  useEffect(() => {
    const updateNetworkConditions = async () => {
      const conditions = await cdnOptimizer.measureNetworkQuality()
      setNetworkConditions(conditions)

      const settings = await cdnOptimizer.adaptToNetworkConditions()
      setAdaptiveSettings(settings)

      // تطبيق الإعدادات على المستند
      document.documentElement.style.setProperty("--image-quality", settings.imageQuality.toString())
      document.documentElement.style.setProperty("--lazy-threshold", settings.lazyLoadThreshold)

      if (!settings.enableAnimations) {
        document.documentElement.classList.add("reduce-motion")
      } else {
        document.documentElement.classList.remove("reduce-motion")
      }
    }

    updateNetworkConditions()

    // مراقبة تغييرات الشبكة
    if ("connection" in navigator) {
      const connection = (navigator as any).connection
      connection.addEventListener("change", updateNetworkConditions)

      return () => {
        connection.removeEventListener("change", updateNetworkConditions)
      }
    }
  }, [])

  // إضافة context للإعدادات التكيفية
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).__ADAPTIVE_SETTINGS__ = adaptiveSettings
    }
  }, [adaptiveSettings])

  return (
    <>
      {children}
      {networkConditions && (
        <div className="sr-only" aria-live="polite">
          Network: {networkConditions.effectiveType}, Quality: {adaptiveSettings.imageQuality}%
        </div>
      )}
    </>
  )
}

// Hook لاستخدام الإعدادات التكيفية
export function useAdaptiveSettings(): AdaptiveSettings {
  const [settings, setSettings] = useState<AdaptiveSettings>({
    imageQuality: 85,
    enableAnimations: true,
    preloadImages: true,
    lazyLoadThreshold: "200px",
  })

  useEffect(() => {
    const updateSettings = () => {
      if (typeof window !== "undefined" && (window as any).__ADAPTIVE_SETTINGS__) {
        setSettings((window as any).__ADAPTIVE_SETTINGS__)
      }
    }

    updateSettings()
    const interval = setInterval(updateSettings, 5000)

    return () => clearInterval(interval)
  }, [])

  return settings
}
