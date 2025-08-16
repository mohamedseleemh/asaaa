"use client"

import React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { SimpleLineChart } from "./charts"
import { TrendingUp, TrendingDown } from "lucide-react"

interface AnalyticsData {
  visitors: { t: string; v: number }[]
  pageViews: { t: string; v: number }[]
  bounceRate: { t: string; v: number }[]
  sessionDuration: { t: string; v: number }[]
  conversionRate: { t: string; v: number }[]
}

interface KPIData {
  title: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  icon: any
}

const KPICard = React.memo(function KPICard({ kpi }: { kpi: KPIData }) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
        <kpi.icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{kpi.value}</div>
        <div className={`flex items-center text-xs ${getTrendColor(kpi.trend)}`}>
          {getTrendIcon(kpi.trend)}
          <span className="mr-1">{kpi.change}</span>
        </div>
      </CardContent>
    </Card>
  )
})

const ChartTab = React.memo(function ChartTab({
  title,
  description,
  data,
}: {
  title: string
  description: string
  data: { t: string; v: number }[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SimpleLineChart data={data} height={300} />
      </CardContent>
    </Card>
  )
})

export function AdvancedAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    visitors: [],
    pageViews: [],
    bounceRate: [],
    sessionDuration: [],
    conversionRate: [],
  })
  const [kpis, setKpis] = useState<KPIData[]>([])
  const [timeRange, setTimeRange] = useState("7d")
  const [loading, setLoading] = useState(true)

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/advanced?range=${timeRange}`)
      const result = await response.json()

      setData(result.data)
      setKpis(result.kpis)
    } catch (error) {
      console.error("Failed to fetch advanced analytics:", error)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAnalyticsData()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [fetchAnalyticsData])

  const chartTabs = useMemo(
    () => [
      {
        value: "visitors",
        title: "الزوار الفريدون",
        description: "عدد الزوار الفريدين خلال الفترة المحددة",
        data: data.visitors,
      },
      {
        value: "pageviews",
        title: "مشاهدات الصفحة",
        description: "إجمالي مشاهدات الصفحات",
        data: data.pageViews,
      },
      {
        value: "bounce",
        title: "معدل الارتداد",
        description: "نسبة الزوار الذين يغادرون بعد صفحة واحدة",
        data: data.bounceRate,
      },
      {
        value: "duration",
        title: "متوسط مدة الجلسة",
        description: "الوقت المتوسط الذي يقضيه المستخدمون في الموقع",
        data: data.sessionDuration,
      },
      {
        value: "conversion",
        title: "معدل التحويل",
        description: "نسبة الزوار الذين يقومون بإجراء مطلوب",
        data: data.conversionRate,
      },
    ],
    [data],
  )

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
          <h2 className="text-2xl font-bold">التحليلات المتقدمة</h2>
          <p className="text-muted-foreground">تحليل شامل لأداء الموقع وسلوك المستخدمين</p>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
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
          <Button onClick={fetchAnalyticsData} variant="outline" disabled={loading}>
            تحديث البيانات
          </Button>
        </div>
      </div>

      {/* مؤشرات الأداء الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* الرسوم البيانية التفاعلية */}
      <Tabs defaultValue="visitors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visitors">الزوار</TabsTrigger>
          <TabsTrigger value="pageviews">مشاهدات الصفحة</TabsTrigger>
          <TabsTrigger value="bounce">معدل الارتداد</TabsTrigger>
          <TabsTrigger value="duration">مدة الجلسة</TabsTrigger>
          <TabsTrigger value="conversion">معدل التحويل</TabsTrigger>
        </TabsList>

        {chartTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <ChartTab title={tab.title} description={tab.description} data={tab.data} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
