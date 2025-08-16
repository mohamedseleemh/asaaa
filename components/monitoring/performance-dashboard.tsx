"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Zap, Activity, TrendingUp } from "lucide-react"
import { PerformanceMonitor } from "@/lib/monitoring/performance-monitor"

interface PerformanceStats {
  metric_type: string
  issue_count: number
  avg_value: number
  max_value: number
  first_seen: string
  last_seen: string
}

interface SlowResource {
  resource_name: string
  resource_type: string
  occurrence_count: number
  avg_duration: number
  max_duration: number
  avg_size: number
}

export function PerformanceDashboard() {
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats[]>([])
  const [slowResources, setSlowResources] = useState<SlowResource[]>([])
  const [currentScore, setCurrentScore] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance()
    monitor.initialize()

    const fetchData = async () => {
      try {
        const [statsResponse, resourcesResponse] = await Promise.all([
          fetch("/api/monitoring/performance"),
          fetch("/api/monitoring/slow-resources"),
        ])

        const stats = await statsResponse.json()
        const resources = await resourcesResponse.json()

        setPerformanceStats(stats)
        setSlowResources(resources)
        setCurrentScore(monitor.getPerformanceScore())
      } catch (error) {
        console.error("Failed to fetch performance data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000) // تحديث كل دقيقة

    return () => {
      clearInterval(interval)
      monitor.cleanup()
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: "secondary" as const, text: "ممتاز", color: "bg-green-100 text-green-800" }
    if (score >= 70) return { variant: "default" as const, text: "جيد", color: "bg-yellow-100 text-yellow-800" }
    return { variant: "destructive" as const, text: "يحتاج تحسين", color: "bg-red-100 text-red-800" }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const scoreBadge = getScoreBadge(currentScore)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">لوحة مراقبة الأداء</h2>
          <p className="text-muted-foreground">مراقبة أداء الموقع والتطبيق في الوقت الفعلي</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>{currentScore}</div>
            <Badge className={scoreBadge.color}>{scoreBadge.text}</Badge>
          </div>
        </div>
      </div>

      {/* نظرة عامة على المقاييس */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceStats.map((stat) => (
          <Card key={stat.metric_type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.metric_type.toUpperCase()}</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.issue_count}</div>
              <p className="text-xs text-muted-foreground">مشاكل في آخر 24 ساعة</p>
              <div className="mt-2">
                <div className="text-xs text-muted-foreground">متوسط: {stat.avg_value.toFixed(2)}ms</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* الموارد البطيئة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            الموارد البطيئة
          </CardTitle>
          <CardDescription>الموارد التي تستغرق وقتاً أطول من المعتاد في التحميل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {slowResources.slice(0, 5).map((resource, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm truncate">{resource.resource_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {resource.resource_type} • {resource.occurrence_count} مرة
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{resource.avg_duration.toFixed(0)}ms</div>
                  <div className="text-xs text-muted-foreground">متوسط التحميل</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* توصيات التحسين */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            توصيات التحسين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentScore < 90 && (
              <div className="flex items-start space-x-3 space-x-reverse">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <div className="font-medium">تحسين سرعة التحميل</div>
                  <div className="text-sm text-muted-foreground">قم بضغط الصور وتحسين الخطوط لتحسين LCP</div>
                </div>
              </div>
            )}

            {slowResources.length > 0 && (
              <div className="flex items-start space-x-3 space-x-reverse">
                <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium">تحسين الموارد البطيئة</div>
                  <div className="text-sm text-muted-foreground">هناك {slowResources.length} مورد يحتاج إلى تحسين</div>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3 space-x-reverse">
              <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">تفعيل التخزين المؤقت</div>
                <div className="text-sm text-muted-foreground">استخدم CDN والتخزين المؤقت لتحسين الأداء</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
