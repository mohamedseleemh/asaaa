interface PerformanceMetrics {
  lcp: number | null
  fid: number | null
  cls: number | null
  fcp: number | null
  ttfb: number | null
  timestamp: number
  url: string
  userAgent: string
}

interface SystemHealth {
  cpu: number
  memory: number
  responseTime: number
  errorRate: number
  activeConnections: number
  uptime: number
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetrics[] = []
  private systemHealth: SystemHealth | null = null
  private observers: PerformanceObserver[] = []
  private maxMetrics = 1000

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  initialize() {
    if (typeof window === "undefined") return

    this.setupWebVitalsObservers()
    this.setupResourceObserver()
    this.setupNavigationObserver()
    this.startSystemHealthMonitoring()
  }

  private setupWebVitalsObservers() {
    if ("PerformanceObserver" in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        this.updateMetric("lcp", lastEntry.startTime)
      })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const fid = entry.processingStart - entry.startTime
          this.updateMetric("fid", fid)
        })
      })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        this.updateMetric("cls", clsValue)
      })

      try {
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] })
        fidObserver.observe({ entryTypes: ["first-input"] })
        clsObserver.observe({ entryTypes: ["layout-shift"] })

        this.observers.push(lcpObserver, fidObserver, clsObserver)
      } catch (error) {
        console.warn("Some performance observers not supported:", error)
      }
    }
  }

  private setupResourceObserver() {
    if ("PerformanceObserver" in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.duration > 1000) {
            // موارد بطيئة
            console.warn(`Slow resource detected: ${entry.name} (${entry.duration.toFixed(2)}ms)`)
            this.reportSlowResource(entry)
          }
        })
      })

      try {
        resourceObserver.observe({ entryTypes: ["resource"] })
        this.observers.push(resourceObserver)
      } catch (error) {
        console.warn("Resource observer not supported:", error)
      }
    }
  }

  private setupNavigationObserver() {
    if ("PerformanceObserver" in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          const ttfb = entry.responseStart - entry.requestStart
          this.updateMetric("ttfb", ttfb)

          const fcp = entry.loadEventEnd - entry.fetchStart
          this.updateMetric("fcp", fcp)
        })
      })

      try {
        navigationObserver.observe({ entryTypes: ["navigation"] })
        this.observers.push(navigationObserver)
      } catch (error) {
        console.warn("Navigation observer not supported:", error)
      }
    }
  }

  private updateMetric(type: keyof PerformanceMetrics, value: number) {
    const currentMetric = this.getCurrentMetric()
    currentMetric[type] = value
    currentMetric.timestamp = Date.now()

    // إرسال البيانات إلى الخادم إذا كانت القيم سيئة
    if (this.isPerformancePoor(type, value)) {
      this.reportPoorPerformance(type, value)
    }
  }

  private getCurrentMetric(): PerformanceMetrics {
    if (this.metrics.length === 0 || this.metrics[0].url !== window.location.href) {
      const newMetric: PerformanceMetrics = {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }
      this.metrics.unshift(newMetric)

      // الحفاظ على حد أقصى من المقاييس
      if (this.metrics.length > this.maxMetrics) {
        this.metrics = this.metrics.slice(0, this.maxMetrics)
      }
    }
    return this.metrics[0]
  }

  private isPerformancePoor(type: keyof PerformanceMetrics, value: number): boolean {
    const thresholds = {
      lcp: 2500, // 2.5 seconds
      fid: 100, // 100ms
      cls: 0.1, // 0.1
      fcp: 1800, // 1.8 seconds
      ttfb: 600, // 600ms
    }

    return value > (thresholds[type] || Number.POSITIVE_INFINITY)
  }

  private async reportPoorPerformance(type: string, value: number) {
    try {
      await fetch("/api/monitoring/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          value,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      })
    } catch (error) {
      console.error("Failed to report poor performance:", error)
    }
  }

  private async reportSlowResource(entry: any) {
    try {
      await fetch("/api/monitoring/slow-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
          type: entry.initiatorType,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      })
    } catch (error) {
      console.error("Failed to report slow resource:", error)
    }
  }

  private startSystemHealthMonitoring() {
    setInterval(async () => {
      try {
        const response = await fetch("/api/monitoring/metrics")
        const health = await response.json()
        this.systemHealth = health

        // تحقق من المشاكل الحرجة
        if (health.errorRate > 5 || health.responseTime > 2000) {
          this.reportCriticalIssue(health)
        }
      } catch (error) {
        console.error("Failed to fetch system health:", error)
      }
    }, 30000)
  }

  private async reportCriticalIssue(health: SystemHealth) {
    try {
      await fetch("/api/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "critical_performance",
          health,
          timestamp: Date.now(),
        }),
      })
    } catch (error) {
      console.error("Failed to report critical issue:", error)
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  getSystemHealth(): SystemHealth | null {
    return this.systemHealth
  }

  getPerformanceScore(): number {
    const current = this.getCurrentMetric()
    let score = 100

    // تقليل النقاط بناءً على الأداء
    if (current.lcp && current.lcp > 2500) score -= 20
    if (current.fid && current.fid > 100) score -= 15
    if (current.cls && current.cls > 0.1) score -= 15
    if (current.fcp && current.fcp > 1800) score -= 10
    if (current.ttfb && current.ttfb > 600) score -= 10

    return Math.max(0, score)
  }

  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers = []
  }
}

export { PerformanceMonitor, type PerformanceMetrics, type SystemHealth }
