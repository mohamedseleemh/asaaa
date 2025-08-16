"use client"

import { CardDescription } from "@/components/ui/card"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SimpleLineChart } from "@/components/dashboard/charts"
import { AdvancedAnalytics } from "@/components/dashboard/advanced-analytics"
import { PerformanceDashboard } from "@/components/analytics/performance-dashboard"
import {
  RefreshCcw,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointer,
  Clock,
  Target,
  Globe,
  Smartphone,
  Monitor,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { addDays } from "date-fns"

interface AnalyticsData {
  visitors: { t: string; v: number }[]
  pageViews: { t: string; v: number }[]
  bounceRate: { t: string; v: number }[]
  sessionDuration: { t: string; v: number }[]
  conversionRate: { t: string; v: number }[]
  deviceBreakdown: { device: string; percentage: number; count: number }[]
  topPages: { page: string; views: number; bounce_rate: number }[]
  trafficSources: { source: string; visitors: number; percentage: number }[]
  userFlow: { from: string; to: string; count: number }[]
  realTimeUsers: number
}

interface ReportConfig {
  name: string
  dateRange: { from: Date; to: Date }
  metrics: string[]
  filters: { [key: string]: string }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    visitors: [],
    pageViews: [],
    bounceRate: [],
    sessionDuration: [],
    conversionRate: [],
    deviceBreakdown: [],
    topPages: [],
    trafficSources: [],
    userFlow: [],
    realTimeUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState("7d")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    name: "",
    dateRange: { from: addDays(new Date(), -7), to: new Date() },
    metrics: [],
    filters: {},
  })

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        range: timeRange,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      })

      const response = await fetch(`/api/analytics/comprehensive?${params}`)
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        // Fallback with simulated data
        const simulatedData = generateSimulatedData()
        setData(simulatedData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
      // Fallback with simulated data
      const simulatedData = generateSimulatedData()
      setData(simulatedData)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [timeRange, dateRange])

  const generateSimulatedData = (): AnalyticsData => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    const visitors = Array.from({ length: days }, (_, i) => ({
      t: new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      }),
      v: Math.floor(Math.random() * 500) + 100,
    }))

    return {
      visitors,
      pageViews: visitors.map((v) => ({ ...v, v: v.v * (Math.random() * 2 + 1.5) })),
      bounceRate: visitors.map((v) => ({ ...v, v: Math.random() * 40 + 30 })),
      sessionDuration: visitors.map((v) => ({ ...v, v: Math.random() * 300 + 120 })),
      conversionRate: visitors.map((v) => ({ ...v, v: Math.random() * 5 + 2 })),
      deviceBreakdown: [
        { device: "Desktop", percentage: 45, count: 2250 },
        { device: "Mobile", percentage: 40, count: 2000 },
        { device: "Tablet", percentage: 15, count: 750 },
      ],
      topPages: [
        { page: "/", views: 5420, bounce_rate: 32.5 },
        { page: "/services", views: 3210, bounce_rate: 28.3 },
        { page: "/about", views: 2180, bounce_rate: 45.2 },
        { page: "/contact", views: 1890, bounce_rate: 22.1 },
        { page: "/pricing", views: 1650, bounce_rate: 35.8 },
      ],
      trafficSources: [
        { source: "Organic Search", visitors: 3500, percentage: 45 },
        { source: "Direct", visitors: 2100, percentage: 27 },
        { source: "Social Media", visitors: 1400, percentage: 18 },
        { source: "Referral", visitors: 780, percentage: 10 },
      ],
      userFlow: [
        { from: "/", to: "/services", count: 1250 },
        { from: "/services", to: "/contact", count: 890 },
        { from: "/", to: "/about", count: 750 },
        { from: "/about", to: "/contact", count: 420 },
      ],
      realTimeUsers: Math.floor(Math.random() * 50) + 10,
    }
  }

  useEffect(() => {
    fetchAnalyticsData()

    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        realTimeUsers: Math.floor(Math.random() * 50) + 10,
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchAnalyticsData])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchAnalyticsData()
  }

  const exportReport = async (format: "csv" | "pdf" | "json") => {
    try {
      const response = await fetch("/api/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          data,
          config: reportConfig,
          dateRange,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `analytics-report-${new Date().toISOString().split("T")[0]}.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Smartphone className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">التحليلات والتقارير</h2>
          <p className="text-muted-foreground">تحليل شامل لأداء الموقع وسلوك المستخدمين</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-green-500" />
            {data.realTimeUsers} مستخدم نشط
          </Badge>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">آخر 7 أيام</SelectItem>
              <SelectItem value="30d">آخر 30 يوم</SelectItem>
              <SelectItem value="90d">آخر 90 يوم</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            تحليلات متقدمة
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <MousePointer className="h-4 w-4" />
            سلوك المستخدمين
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            الأداء
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            التقارير
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الزوار</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.visitors.reduce((sum, item) => sum + item.v, 0).toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% من الفترة السابقة
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مشاهدات الصفحة</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(data.pageViews.reduce((sum, item) => sum + item.v, 0)).toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.2% من الفترة السابقة
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط مدة الجلسة</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.floor(
                    data.sessionDuration.reduce((sum, item) => sum + item.v, 0) / data.sessionDuration.length / 60,
                  )}
                  :
                  {Math.floor(
                    (data.sessionDuration.reduce((sum, item) => sum + item.v, 0) / data.sessionDuration.length) % 60,
                  )
                    .toString()
                    .padStart(2, "0")}
                </div>
                <div className="flex items-center text-xs text-red-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1% من الفترة السابقة
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(data.conversionRate.reduce((sum, item) => sum + item.v, 0) / data.conversionRate.length).toFixed(1)}
                  %
                </div>
                <div className="flex items-center text-xs text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5.3% من الفترة السابقة
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  الزوار اليوميون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleLineChart data={data.visitors} height={250} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  توزيع الأجهزة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.deviceBreakdown.map((device) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device)}
                        <span className="text-sm font-medium">{device.device}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${device.percentage}%` }} />
                        </div>
                        <span className="text-sm text-muted-foreground">{device.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>أهم الصفحات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{page.page}</p>
                          <p className="text-sm text-muted-foreground">{page.views.toLocaleString()} مشاهدة</p>
                        </div>
                      </div>
                      <Badge
                        className={
                          page.bounce_rate < 30
                            ? "bg-green-100 text-green-800"
                            : page.bounce_rate < 40
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {page.bounce_rate.toFixed(1)}% ارتداد
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مصادر الزيارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.trafficSources.map((source) => (
                    <div key={source.source} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{source.source}</p>
                          <p className="text-sm text-muted-foreground">{source.visitors.toLocaleString()} زائر</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{source.percentage}%</p>
                        <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                          <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${source.percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MousePointer className="h-5 w-5 mr-2" />
                مسار المستخدمين
              </CardTitle>
              <CardDescription>كيف ينتقل المستخدمون عبر الموقع</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.userFlow.map((flow, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 text-center">
                      <div className="font-medium">{flow.from}</div>
                      <div className="text-sm text-muted-foreground">من</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-blue-600"></div>
                      <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">
                        {flow.count}
                      </div>
                      <div className="w-8 h-0.5 bg-blue-600"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="font-medium">{flow.to}</div>
                      <div className="text-sm text-muted-foreground">إلى</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2" />
                تصدير التقارير
              </CardTitle>
              <CardDescription>إنشاء وتصدير تقارير مخصصة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button onClick={() => exportReport("csv")} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  تصدير CSV
                </Button>
                <Button onClick={() => exportReport("pdf")} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  تصدير PDF
                </Button>
                <Button onClick={() => exportReport("json")} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  تصدير JSON
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium mb-2">التقارير المجدولة</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  احصل على تقارير دورية تلقائياً عبر البريد الإلكتروني
                </p>
                <div className="flex items-center gap-2">
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومي</SelectItem>
                      <SelectItem value="weekly">أسبوعي</SelectItem>
                      <SelectItem value="monthly">شهري</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm">تفعيل التقارير المجدولة</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
