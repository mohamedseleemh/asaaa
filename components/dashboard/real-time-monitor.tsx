"use client"

import React from "react"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Users, Globe, Server, Database, Zap } from "lucide-react"

interface SystemMetrics {
  activeUsers: number
  pageViews: number
  responseTime: number
  uptime: number
  errorRate: number
  databaseConnections: number
  memoryUsage: number
  cpuUsage: number
}

const MetricCard = React.memo(function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  badge,
}: {
  title: string
  value: string | number
  icon: any
  subtitle: string
  badge?: { variant: any; text: string }
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        {badge ? (
          <Badge variant={badge.variant}>{badge.text}</Badge>
        ) : (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
})

const SystemProgressCard = React.memo(function SystemProgressCard({
  title,
  metrics,
}: {
  title: string
  metrics: Array<{ label: string; value: number; key: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
        <CardDescription>استخدام الموارد الحالي</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.key}>
            <div className="flex justify-between text-sm mb-2">
              <span>{metric.label}</span>
              <span>{metric.value}%</span>
            </div>
            <Progress value={metric.value} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
})

export function RealTimeMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    pageViews: 0,
    responseTime: 0,
    uptime: 0,
    errorRate: 0,
    databaseConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0,
  })
  const [isConnected, setIsConnected] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  const fetchMetrics = useCallback(async () => {
    if (!mountedRef.current) return

    try {
      const response = await fetch("/api/monitoring/metrics")
      const data = await response.json()

      if (mountedRef.current) {
        setMetrics(data)
        setIsConnected(true)
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error)
      if (mountedRef.current) {
        setIsConnected(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    // جلب البيانات فوراً
    fetchMetrics()

    intervalRef.current = setInterval(fetchMetrics, 30000)

    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchMetrics])

  const getStatusColor = useCallback((value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return "destructive"
    if (value >= thresholds.warning) return "default"
    return "secondary"
  }, [])

  const getUptimeColor = useCallback((uptime: number) => {
    if (uptime >= 99.5) return "text-green-600"
    if (uptime >= 95) return "text-yellow-600"
    return "text-red-600"
  }, [])

  const metricCards = useMemo(
    () => [
      {
        title: "المستخدمون النشطون",
        value: metrics.activeUsers,
        icon: Users,
        subtitle: "في الوقت الحالي",
      },
      {
        title: "مشاهدات الصفحة",
        value: metrics.pageViews,
        icon: Globe,
        subtitle: "اليوم",
      },
      {
        title: "وقت الاستجابة",
        value: `${metrics.responseTime}ms`,
        icon: Zap,
        subtitle: "",
        badge: {
          variant: getStatusColor(metrics.responseTime, { warning: 500, critical: 1000 }),
          text: metrics.responseTime < 500 ? "ممتاز" : metrics.responseTime < 1000 ? "جيد" : "بطيء",
        },
      },
      {
        title: "وقت التشغيل",
        value: `${metrics.uptime.toFixed(2)}%`,
        icon: Server,
        subtitle: "آخر 30 يوم",
      },
    ],
    [metrics.activeUsers, metrics.pageViews, metrics.responseTime, metrics.uptime, getStatusColor],
  )

  const systemMetrics = useMemo(
    () => [
      { label: "استخدام المعالج", value: metrics.cpuUsage, key: "cpu" },
      { label: "استخدام الذاكرة", value: metrics.memoryUsage, key: "memory" },
      { label: "معدل الأخطاء", value: metrics.errorRate, key: "error" },
    ],
    [metrics.cpuUsage, metrics.memoryUsage, metrics.errorRate],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مراقبة النظام في الوقت الفعلي</h2>
          <p className="text-muted-foreground">مراقبة أداء النظام والخوادم</p>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
          <span className="text-sm text-muted-foreground">{isConnected ? "متصل" : "غير متصل"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <MetricCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SystemProgressCard title="أداء النظام" metrics={systemMetrics} />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              قاعدة البيانات
            </CardTitle>
            <CardDescription>حالة الاتصالات والأداء</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">الاتصالات النشطة</span>
              <Badge variant="secondary">{metrics.databaseConnections}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">حالة الاتصال</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                متصل
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">آخر نسخ احتياطي</span>
              <span className="text-sm text-muted-foreground">منذ ساعتين</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
