interface PerformanceMetric {
  name: string
  value: number
  timestamp: Date
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000

  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date(),
      metadata,
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log critical performance issues
    if (this.isCritical(name, value)) {
      console.warn(`Performance warning: ${name} = ${value}`, metadata)
    }
  }

  private isCritical(name: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      page_load_time: 3000, // 3 seconds
      api_response_time: 1000, // 1 second
      database_query_time: 500, // 500ms
      memory_usage: 85, // 85%
      cpu_usage: 80, // 80%
    }

    return value > (thresholds[name] || Number.POSITIVE_INFINITY)
  }

  getMetrics(name?: string, since?: Date): PerformanceMetric[] {
    let filtered = this.metrics

    if (name) {
      filtered = filtered.filter((m) => m.name === name)
    }

    if (since) {
      filtered = filtered.filter((m) => m.timestamp >= since)
    }

    return filtered
  }

  getAverageMetric(name: string, since?: Date): number {
    const metrics = this.getMetrics(name, since)
    if (metrics.length === 0) return 0

    const sum = metrics.reduce((acc, m) => acc + m.value, 0)
    return sum / metrics.length
  }
}

export const performanceMonitor = new PerformanceMonitor()
