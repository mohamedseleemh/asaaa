"use client"

import { useEffect } from "react"

export function PerfHints() {
  useEffect(() => {
    // Expanded critical resource preloading
    const preloadLinks = [
      "/images/brand/novapay-logo.png",
      "/images/logos/paypal.png",
      "/images/logos/wise.png",
      "/images/logos/skrill.png",
      "/images/logos/neteller.png",
      "/images/logos/crypto.png",
    ]

    preloadLinks.forEach((href) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.as = "image"
      link.href = href
      document.head.appendChild(link)
    })

    // Enhanced prefetching strategy
    const prefetchLinks = ["/admin", "/dashboard"]
    prefetchLinks.forEach((href) => {
      const link = document.createElement("link")
      link.rel = "prefetch"
      link.href = href
      document.head.appendChild(link)
    })

    // Added DNS prefetch for external domains
    const dnsPrefetchDomains = ["https://wa.me", "https://fonts.googleapis.com", "https://fonts.gstatic.com"]

    dnsPrefetchDomains.forEach((domain) => {
      const link = document.createElement("link")
      link.rel = "dns-prefetch"
      link.href = domain
      document.head.appendChild(link)
    })

    // Enhanced performance observer with more metrics
    if ("PerformanceObserver" in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (process.env.NODE_ENV === "development") {
            switch (entry.entryType) {
              case "largest-contentful-paint":
                console.log("LCP:", entry.startTime)
                break
              case "first-input":
                console.log("FID:", entry.processingStart - entry.startTime)
                break
              case "layout-shift":
                if (!entry.hadRecentInput) {
                  console.log("CLS:", entry.value)
                }
                break
            }
          }
        }
      })

      try {
        observer.observe({ entryTypes: ["largest-contentful-paint", "first-input", "layout-shift"] })
      } catch (e) {
        // Fallback for browsers that don't support all entry types
        observer.observe({ entryTypes: ["largest-contentful-paint"] })
      }
    }

    // Enhanced connection-based optimizations
    if ("connection" in navigator) {
      const connection = (navigator as any).connection
      if (connection) {
        // Reduce animations for slow connections
        if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
          document.documentElement.style.setProperty("--animation-duration", "0s")
          document.documentElement.classList.add("reduce-motion")
        }

        // Preload less on slower connections
        if (connection.effectiveType === "4g" && connection.downlink > 10) {
          // High-speed connection - preload more resources
          const additionalPreloads = ["/images/hero-bg.jpg", "/images/about-image.jpg"]

          additionalPreloads.forEach((href) => {
            const link = document.createElement("link")
            link.rel = "preload"
            link.as = "image"
            link.href = href
            document.head.appendChild(link)
          })
        }
      }
    }

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (prefersReducedMotion.matches) {
      document.documentElement.style.setProperty("--animation-duration", "0.01s")
      document.documentElement.classList.add("reduce-motion")
    }

    // Listen for changes in motion preference
    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.style.setProperty("--animation-duration", "0.01s")
        document.documentElement.classList.add("reduce-motion")
      } else {
        document.documentElement.style.removeProperty("--animation-duration")
        document.documentElement.classList.remove("reduce-motion")
      }
    }

    prefersReducedMotion.addEventListener("change", handleMotionChange)

    return () => {
      prefersReducedMotion.removeEventListener("change", handleMotionChange)
    }
  }, [])

  return null
}
