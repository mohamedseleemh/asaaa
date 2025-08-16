interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  category: "core-web-vitals" | "custom" | "network" | "resource"
  threshold: {
    good: number
    needsImprovement: number
    poor: number
  }
}

interface PerformanceReport {
  score: number
  grade: "A" | "B" | "C" | "D" | "F"
  metrics: PerformanceMetric[]
  recommendations: string[]
  timestamp: number
}

interface BenchmarkData {
  metric: string
  current: number
  baseline: number
  target: number
  improvement: number
  trend: "improving" | "declining" | "stable"
}

class PerformanceAnalyzer {
  private static instance: PerformanceAnalyzer
  private metrics: PerformanceMetric[] = []
  private reports: PerformanceReport[] = []
  private benchmarks: Map<string, BenchmarkData> = new Map()

  static getInstance(): PerformanceAnalyzer {
    if (!PerformanceAnalyzer.instance) {
      PerformanceAnalyzer.instance = new PerformanceAnalyzer()
    }
    return PerformanceAnalyzer.instance
  }

  recordMetric(metric: Omit<PerformanceMetric, "timestamp">) {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: Date.now(),
    }

    this.metrics.push(fullMetric)
    this.updateBenchmark(fullMetric)

    // الحفاظ على آخر 1000 قياس فقط
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  private updateBenchmark(metric: PerformanceMetric) {
    const existing = this.benchmarks.get(metric.name)

    if (!existing) {
      this.benchmarks.set(metric.name, {
        metric: metric.name,
        current: metric.value,
        baseline: metric.value,
        target: metric.threshold.good,
        improvement: 0,
        trend: "stable",
      })
      return
    }

    const previousValue = existing.current
    existing.current = metric.value
    existing.improvement = ((existing.baseline - metric.value) / existing.baseline) * 100

    // تحديد الاتجاه
    if (metric.value < previousValue * 0.95) {
      existing.trend = "improving"
    } else if (metric.value > previousValue * 1.05) {
      existing.trend = "declining"
    } else {
      existing.trend = "stable"
    }
  }

  generateReport(): PerformanceReport {
    const recentMetrics = this.getRecentMetrics(300000) // آخر 5 دقائق
    const score = this.calculatePerformanceScore(recentMetrics)
    const grade = this.getPerformanceGrade(score)
    const recommendations = this.generateRecommendations(recentMetrics)

    const report: PerformanceReport = {
      score,
      grade,
      metrics: recentMetrics,
      recommendations,
      timestamp: Date.now(),
    }

    this.reports.push(report)

    // الحفاظ على آخر 100 تقرير
    if (this.reports.length > 100) {
      this.reports = this.reports.slice(-100)
    }

    return report
  }

  private getRecentMetrics(timeWindow: number): PerformanceMetric[] {
    const cutoff = Date.now() - timeWindow
    return this.metrics.filter((metric) => metric.timestamp > cutoff)
  }

  private calculatePerformanceScore(metrics: PerformanceMetric[]): number {
    if (metrics.length === 0) return 0

    let totalScore = 0
    let totalWeight = 0

    const weights = {
      "core-web-vitals": 0.4,
      network: 0.3,
      resource: 0.2,
      custom: 0.1,
    }

    metrics.forEach((metric) => {
      const weight = weights[metric.category] || 0.1
      let score = 100

      if (metric.value <= metric.threshold.good) {
        score = 100
      } else if (metric.value <= metric.threshold.needsImprovement) {
        score = 75
      } else {
        score = 25
      }

      totalScore += score * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
  }

  private getPerformanceGrade(score: number): "A" | "B" | "C" | "D" | "F" {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = []

    metrics.forEach((metric) => {
      if (metric.value > metric.threshold.poor) {
        switch (metric.name) {
          case "LCP":
            recommendations.push("تحسين سرعة تحميل أكبر عنصر مرئي - قم بضغط الصور وتحسين الخطوط")
            break
          case "FID":
            recommendations.push("تقليل وقت الاستجابة للتفاعل الأول - قم بتحسين JavaScript وتقليل المهام الطويلة")
            break
          case "CLS":
            recommendations.push("تقليل التحرك التراكمي للتخطيط - حدد أبعاد الصور والإعلانات مسبقاً")
            break
          case "TTFB":
            recommendations.push("تحسين وقت الاستجابة الأول - قم بتحسين الخادم واستخدم CDN")
            break
          case "FCP":
            recommendations.push("تسريع أول رسم للمحتوى - قم بتحسين CSS الحرج وتقليل موارد الحظر")
            break
        }
      }
    })

    // إضافة توصيات عامة
    if (recommendations.length === 0) {
      recommendations.push("الأداء جيد! استمر في مراقبة المقاييس للحفاظ على الجودة")
    }

    return [...new Set(recommendations)] // إزالة التكرار
  }

  getBenchmarks(): BenchmarkData[] {
    return Array.from(this.benchmarks.values())
  }

  getMetricHistory(metricName: string, timeWindow = 3600000): PerformanceMetric[] {
    const cutoff = Date.now() - timeWindow
    return this.metrics
      .filter((metric) => metric.name === metricName && metric.timestamp > cutoff)
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  getPerformanceTrends(): Record<string, { trend: string; change: number }> {
    const trends: Record<string, { trend: string; change: number }> = {}

    this.benchmarks.forEach((benchmark, metricName) => {
      trends[metricName] = {
        trend: benchmark.trend,
        change: benchmark.improvement,
      }
    })

    return trends
  }

  exportReport(format: "json" | "csv" = "json"): string {
    const latestReport = this.reports[this.reports.length - 1]
    if (!latestReport) return ""

    if (format === "json") {
      return JSON.stringify(latestReport, null, 2)
    }

    // تصدير CSV
    const csvHeaders = ["Metric", "Value", "Category", "Status", "Timestamp"]
    const csvRows = latestReport.metrics.map((metric) => [
      metric.name,
      metric.value.toString(),
      metric.category,
      metric.value <= metric.threshold.good
        ? "Good"
        : metric.value <= metric.threshold.needsImprovement
          ? "Needs Improvement"
          : "Poor",
      new Date(metric.timestamp).toISOString(),
    ])

    return [csvHeaders, ...csvRows].map((row) => row.join(",")).join("\n")
  }

  async sendPerformanceAlert(threshold = 60) {
    const latestReport = this.reports[this.reports.length - 1]
    if (!latestReport || latestReport.score >= threshold) return

    try {
      await fetch("/api/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "performance_degradation",
          score: latestReport.score,
          grade: latestReport.grade,
          recommendations: latestReport.recommendations,
          timestamp: latestReport.timestamp,
        }),
      })
    } catch (error) {
      console.error("Failed to send performance alert:", error)
    }
  }
}

export const performanceAnalyzer = PerformanceAnalyzer.getInstance()
export type { PerformanceMetric, PerformanceReport, BenchmarkData }
