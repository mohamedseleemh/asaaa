"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

interface SystemStatus {
  database: "healthy" | "warning" | "error"
  cache: "healthy" | "warning" | "error"
  api: "healthy" | "warning" | "error"
  storage: "healthy" | "warning" | "error"
}

interface SystemMetrics {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  activeUsers: number
  requestsPerMinute: number
  averageResponseTime: number
}

export default function SystemMonitoring() {
  const [status, setStatus] = useState<SystemStatus>({
    database: "healthy",
    cache: "healthy",
    api: "healthy",
    storage: "healthy",
  })

  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
    activeUsers: 127,
    requestsPerMinute: 1250,
    averageResponseTime: 245,
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update with random data for demo
    setMetrics({
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      diskUsage: Math.floor(Math.random() * 100),
      activeUsers: Math.floor(Math.random() * 200) + 50,
      requestsPerMinute: Math.floor(Math.random() * 2000) + 500,
      averageResponseTime: Math.floor(Math.random() * 500) + 100,
    })

    setIsRefreshing(false)
  }

  useEffect(() => {
    const interval = setInterval(refreshData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getProgressColor = (value: number) => {
    if (value < 50) return "bg-green-500"
    if (value < 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مراقبة النظام</h2>
          <p className="text-muted-foreground">حالة النظام والأداء في الوقت الفعلي</p>
        </div>
        <Button onClick={refreshData} disabled={isRefreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 ml-2 ${isRefreshing ? "animate-spin" : ""}`} />
          تحديث
        </Button>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(status).map(([service, serviceStatus]) => (
          <Card key={service}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 space-x-reverse">
                  {getStatusIcon(serviceStatus)}
                  <span className="font-medium capitalize">
                    {service === "database" && "قاعدة البيانات"}
                    {service === "cache" && "التخزين المؤقت"}
                    {service === "api" && "واجهة البرمجة"}
                    {service === "storage" && "التخزين"}
                  </span>
                </div>
                <Badge variant={serviceStatus === "healthy" ? "default" : "destructive"}>
                  {serviceStatus === "healthy" ? "سليم" : serviceStatus === "warning" ? "تحذير" : "خطأ"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>استخدام المعالج</CardTitle>
            <CardDescription>{metrics.cpuUsage}%</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.cpuUsage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>استخدام الذاكرة</CardTitle>
            <CardDescription>{metrics.memoryUsage}%</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.memoryUsage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>استخدام القرص</CardTitle>
            <CardDescription>{metrics.diskUsage}%</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={metrics.diskUsage} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المستخدمون النشطون</CardTitle>
            <CardDescription>في الوقت الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الطلبات في الدقيقة</CardTitle>
            <CardDescription>معدل الطلبات الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.requestsPerMinute.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>متوسط وقت الاستجابة</CardTitle>
            <CardDescription>{metrics.averageResponseTime}ms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}ms</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
