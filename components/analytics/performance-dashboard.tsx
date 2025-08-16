"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, Zap, AlertTriangle, CheckCircle, Download } from "lucide-react"
import type { PerformanceReport, BenchmarkData } from "@/lib/analytics/performance-analyzer"

interface PerformanceMetrics {
  lcp: number
  fid: number
  cls: number
  ttfb: number
  fcp: number
}

export function PerformanceDashboard() {
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [benchmarks, setBenchmarks] = useState<BenchmarkData[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    fcp: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
    const interval = setInterval(fetchPerformanceData, 60000) // تحديث كل دقيقة

    return () => clearInterval(interval)
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch("/api/analytics/advanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric: "page_load",
          value: Math.random() * 3000 + 1000,
          category: "core-web-vitals",
        }),
      })

      const data = await response.json()
      if (data.success) {
        setReport(data.report)
        setBenchmarks(data.benchmarks)
      }

      // محاكاة Core Web Vitals
      setMetrics({
        lcp: Math.random() * 4000 + 1000,
        fid: Math.random() * 200 + 50,
        cls: Math.random() * 0.3,
        ttfb: Math.random() * 800 + 200,
        fcp: Math.random() * 3000 + 800,
      })
    } catch (error) {
      console.error("Failed to fetch performance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMetricStatus = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return { status: "good", color: "text-green-600", bg: "bg-green-100" }
    if (value <= thresholds.poor) return { status: "needs-improvement", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { status: "poor", color: "text-red-600", bg: "bg-red-100" }
  }

  const exportReport = async (format: "json" | "csv") => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}`)
      const data = await response.text()

      const blob = new Blob([data], {
        type: format === "json" ? "application/json" : "text/csv",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `performance-report.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const coreWebVitals = [
    {
      name: "LCP",
      label: "Largest Contentful Paint",
      value: metrics.lcp,
      unit: "ms",
      thresholds: { good: 2500, poor: 4000 },
      description: "وقت تحميل أكبر عنصر مرئي",
    },
    {
      name: "FID",
      label: "First Input Delay",
      value: metrics.fid,
      unit: "ms",
      thresholds: { good: 100, poor: 300 },
      description: "تأخير أول تفاعل",
    },
    {
      name: "CLS",
      label: "Cumulative Layout Shift",
      value: metrics.cls,
      unit: "",
      thresholds: { good: 0.1, poor: 0.25 },
      description: "التحرك التراكمي للتخطيط",
    },
    {
      name: "TTFB",
      label: "Time to First Byte",
      value: metrics.ttfb,
      unit: "ms",
      thresholds: { good: 600, poor: 1500 },
      description: "وقت الاستجابة الأول",
    },
    {
      name: "FCP",
      label: "First Contentful Paint",
      value: metrics.fcp,
      unit: "ms",
      thresholds: { good: 1800, poor: 3000 },
      description: "أول رسم للمحتوى",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">لوحة تحليل الأداء</h2>
          <p className="text-muted-foreground">مراقبة وتحليل أداء الموقع بالتفصيل</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          {report && (
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${
                  report.score >= 90 ? "text-green-600" : report.score >= 70 ? "text-yellow-600" : "text-red-600"
                }`}
              >
                {report.score}
              </div>
              <Badge
                className={
                  report.grade === "A"
                    ? "bg-green-100 text-green-800"
                    : report.grade === "B"
                      ? "bg-blue-100 text-blue-800"
                      : report.grade === "C"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                }
              >
                Grade {report.grade}
              </Badge>
            </div>
          )}
          <Button onClick={() => exportReport("json")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير JSON
          </Button>
          <Button onClick={() => exportReport("csv")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="benchmarks">المقارنات المرجعية</TabsTrigger>
          <TabsTrigger value="recommendations">التوصيات</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreWebVitals.map((vital) => {
              const status = getMetricStatus(vital.value, vital.thresholds)
              return (
                <Card key={vital.name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{vital.name}</CardTitle>
                      {status.status === "good" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className={`h-4 w-4 ${status.color}`} />
                      )}
                    </div>
                    <CardDescription className="text-xs">{vital.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {vital.value.toFixed(vital.name === "CLS" ? 3 : 0)}
                      {vital.unit}
                    </div>
                    <div className="mt-2">
                      <Progress value={Math.min(100, (vital.value / vital.thresholds.poor) * 100)} className="h-2" />
                    </div>
                    <Badge className={`mt-2 ${status.bg} ${status.color}`}>
                      {status.status === "good"
                        ? "جيد"
                        : status.status === "needs-improvement"
                          ? "يحتاج تحسين"
                          : "ضعيف"}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {benchmarks.map((benchmark) => (
              <Card key={benchmark.metric}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {benchmark.metric}
                    {benchmark.trend === "improving" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : benchmark.trend === "declining" ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : (
                      <Activity className="h-4 w-4 text-gray-600" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">القيمة الحالية</span>
                      <span className="font-medium">{benchmark.current.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">الهدف</span>
                      <span className="font-medium">{benchmark.target.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">التحسن</span>
                      <span
                        className={`font-medium ${
                          benchmark.improvement > 0
                            ? "text-green-600"
                            : benchmark.improvement < 0
                              ? "text-red-600"
                              : "text-gray-600"
                        }`}
                      >
                        {benchmark.improvement > 0 ? "+" : ""}
                        {benchmark.improvement.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                توصيات تحسين الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report?.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 space-x-reverse">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{recommendation}</p>
                    </div>
                  </div>
                )) || <p className="text-muted-foreground">لا توجد توصيات متاحة حالياً</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
